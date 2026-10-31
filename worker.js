import { DRIVER_PAYLOAD_B64 } from './driver_payload.js';
import { ADMIN_HTML } from './admin_html.js';

// -------------------------------------------------------------
// DISCORD OAUTH2 & BOT INTEGRATION CONFIGURATION
// -------------------------------------------------------------
const DISCORD_CLIENT_ID = '1565727420739227748';
const DISCORD_CLIENT_SECRET = 'hjw53zJFLDZ0kw50FbHNX1bQAWVqOkP3';
const ALLOWED_DISCORD_ID = '1415022792214052915';
const DISCORD_GUILD_ID = '1549785920490971187';
const DISCORD_ROLE_CUSTOMER = '1550990740329467904';
const DISCORD_ROLE_LIFETIME = '1551043327317516348';

function getBotToken(env) {
    if (env && env.DISCORD_BOT_TOKEN) return env.DISCORD_BOT_TOKEN;
    return atob('TVRVMk5UY3lOelF5TURjek9USXlOemMwT0EuR1R1REM4LjVmMDVuNTAwdzFyTXBXS3UwdzFzUWJiRUdmdU45VXptRkRLc3Bz');
}

function getDiscordIdForLicense(lic) {
    if (!lic) return null;
    if (lic.discord_id) return String(lic.discord_id).trim();
    if (lic.note) {
        const match = lic.note.match(/for\s+<@(\d+)>/i) || lic.note.match(/<@(\d+)>/) || lic.note.match(/\b\d{17,20}\b/);
        if (match) return (match[1] || match[0]).trim();
    }
    return null;
}

async function revokeDiscordRole(env, guildId, userId, roleId) {
    if (!guildId || !userId || !roleId) return false;
    try {
        const token = getBotToken(env);
        const url = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bot ${token}`,
                'X-Audit-Log-Reason': 'License deleted or revoked via Web Dashboard'
            }
        });
        return res.ok || res.status === 404;
    } catch (err) {
        console.error(`[Discord Role Revoke Error] Member ${userId}, Role ${roleId}:`, err);
        return false;
    }
}

async function syncDiscordRolesOnKeyRemoval(env, discordId, excludeKey) {
    if (!discordId) return { revoked: false, roles: [] };

    const all = await getAllLicenses(env);
    const now = Date.now();

    // Check if the user has any remaining active, non-expired license
    const remaining = all.filter(l => {
        if (l.key === excludeKey) return false;
        const otherId = getDiscordIdForLicense(l);
        if (otherId !== discordId) return false;
        if (l.status === 'banned') return false;
        if (l.expires_at && l.expires_at <= now) return false;
        return true;
    });

    const revokedRoles = [];

    if (remaining.length === 0) {
        // No remaining active licenses -> revoke both Customer and Lifetime roles
        await revokeDiscordRole(env, DISCORD_GUILD_ID, discordId, DISCORD_ROLE_CUSTOMER);
        await revokeDiscordRole(env, DISCORD_GUILD_ID, discordId, DISCORD_ROLE_LIFETIME);
        revokedRoles.push('Customer', 'Lifetime');
    } else {
        // Still has active licenses, but check if any of them are Lifetime
        const hasLifetime = remaining.some(l => l.duration_days === 0 || !l.expires_at);
        if (!hasLifetime) {
            // No lifetime key remains -> revoke Lifetime role only, keep Customer role
            await revokeDiscordRole(env, DISCORD_GUILD_ID, discordId, DISCORD_ROLE_LIFETIME);
            revokedRoles.push('Lifetime');
        }
    }

    return { revoked: revokedRoles.length > 0, roles: revokedRoles };
}

// -------------------------------------------------------------
// CRYPTO HELPERS (Web Crypto API - Native Cloudflare Edge)
// -------------------------------------------------------------
function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function base64ToBytes(b64) {
    const binStr = atob(b64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
        bytes[i] = binStr.charCodeAt(i);
    }
    return bytes;
}

function getRandomHex(lenBytes) {
    const bytes = new Uint8Array(lenBytes);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
}

async function encryptAes256Ctr(dataBuffer, keyHex) {
    const keyBytes = hexToBytes(keyHex);
    const iv = new Uint8Array(16);
    crypto.getRandomValues(iv);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-CTR' },
        false,
        ['encrypt']
    );

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-CTR', counter: iv, length: 128 },
        cryptoKey,
        dataBuffer
    );

    const combined = new Uint8Array(16 + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), 16);
    return bytesToHex(combined);
}

function generateLicenseKey(prefix = 'KEY') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = (len) => {
        let res = '';
        const bytes = new Uint8Array(len);
        crypto.getRandomValues(bytes);
        for (let i = 0; i < len; i++) {
            res += chars[bytes[i] % chars.length];
        }
        return res;
    };
    return `${prefix.toUpperCase().trim()}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

function parseCookies(header) {
    const list = {};
    if (!header) return list;
    header.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        if (parts.length >= 2) {
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        }
    });
    return list;
}

// -------------------------------------------------------------
// STORAGE ABSTRACTION (Cloudflare KV + In-Memory Fallback)
// -------------------------------------------------------------
const memoryStore = {
    licenses: new Map(),
    sessions: new Map(),
    adminSessions: new Map(),
    logs: []
};

async function getKv(env) {
    return env.AUTH_KV || null;
}

async function getLicense(env, key) {
    const kv = await getKv(env);
    if (kv) {
        try {
            return (await kv.get('lic:' + key, 'json')) || null;
        } catch (e) {
            console.error('Error parsing license for key:', key, e);
            return null;
        }
    }
    return memoryStore.licenses.get(key) || null;
}

async function saveLicense(env, lic) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('lic:' + lic.key, JSON.stringify(lic));
        let allKeys = [];
        try {
            allKeys = (await kv.get('index:keys', 'json')) || [];
        } catch (e) {
            allKeys = [];
        }
        if (!allKeys.includes(lic.key)) {
            allKeys.push(lic.key);
            await kv.put('index:keys', JSON.stringify(allKeys));
        }
        return;
    }
    memoryStore.licenses.set(lic.key, lic);
}

async function deleteLicense(env, key) {
    const kv = await getKv(env);
    if (kv) {
        await kv.delete('lic:' + key);
        let allKeys = [];
        try {
            allKeys = (await kv.get('index:keys', 'json')) || [];
        } catch (e) {
            allKeys = [];
        }
        allKeys = allKeys.filter(k => k !== key);
        await kv.put('index:keys', JSON.stringify(allKeys));
        return;
    }
    memoryStore.licenses.delete(key);
}

async function getAllLicenses(env) {
    const kv = await getKv(env);
    if (kv) {
        let allKeys = [];
        try {
            allKeys = (await kv.get('index:keys', 'json')) || [];
        } catch (e) {
            allKeys = [];
        }
        const results = [];
        for (const k of allKeys) {
            try {
                const lic = await kv.get('lic:' + k, 'json');
                if (lic && typeof lic === 'object' && lic.key) {
                    results.push(lic);
                }
            } catch (e) {
                console.warn('Skipping invalid license JSON for key:', k, e.message);
            }
        }
        return results.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    }
    return Array.from(memoryStore.licenses.values()).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

async function createClientSession(env, token, data) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('sess:' + token, JSON.stringify(data), { expirationTtl: 7200 });
        return;
    }
    memoryStore.sessions.set(token, data);
}

async function getClientSession(env, token) {
    const kv = await getKv(env);
    if (kv) {
        return await kv.get('sess:' + token, 'json');
    }
    return memoryStore.sessions.get(token) || null;
}

async function saveAdminSession(env, token, data) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('adminsess:' + token, JSON.stringify(data), { expirationTtl: 86400 * 7 }); // 7 days
        return;
    }
    memoryStore.adminSessions.set(token, data);
}

async function getAdminSession(env, token) {
    if (!token) return null;
    const kv = await getKv(env);
    if (kv) {
        return await kv.get('adminsess:' + token, 'json');
    }
    return memoryStore.adminSessions.get(token) || null;
}

async function deleteAdminSession(env, token) {
    if (!token) return;
    const kv = await getKv(env);
    if (kv) {
        await kv.delete('adminsess:' + token);
        return;
    }
    memoryStore.adminSessions.delete(token);
}

async function addAuditLog(env, event, ip, key, details) {
    const logItem = {
        timestamp: Date.now(),
        event,
        ip,
        key,
        details
    };
    const kv = await getKv(env);
    if (kv) {
        let logs = (await kv.get('audit:logs', 'json')) || [];
        logs.unshift(logItem);
        if (logs.length > 100) logs = logs.slice(0, 100);
        await kv.put('audit:logs', JSON.stringify(logs));
        return;
    }
    memoryStore.logs.unshift(logItem);
    if (memoryStore.logs.length > 100) memoryStore.logs = memoryStore.logs.slice(0, 100);
}

async function getAuditLogs(env) {
    const kv = await getKv(env);
    if (kv) {
        try {
            return (await kv.get('audit:logs', 'json')) || [];
        } catch (e) {
            console.error('Error parsing audit logs from KV:', e);
            return [];
        }
    }
    return memoryStore.logs;
}

async function isLoaderEnabled(env) {
    const kv = await getKv(env);
    if (kv) {
        try {
            const val = await kv.get('config:loader_enabled');
            if (val === null) return true;
            return val === 'true';
        } catch (e) {
            return true;
        }
    }
    return memoryStore.loaderEnabled !== false;
}

async function setLoaderEnabled(env, enabled) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('config:loader_enabled', enabled ? 'true' : 'false');
        return;
    }
    memoryStore.loaderEnabled = enabled;
}

async function getLoaderDisableReason(env) {
    const kv = await getKv(env);
    if (kv) {
        try {
            return (await kv.get('config:loader_disable_reason')) || 'Updating for new game patch';
        } catch (e) {
            return 'Updating for new game patch';
        }
    }
    return memoryStore.loaderDisableReason || 'Updating for new game patch';
}

async function setLoaderDisableReason(env, reason) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('config:loader_disable_reason', reason || '');
        return;
    }
    memoryStore.loaderDisableReason = reason || '';
}

async function getLoaderDisabledAt(env) {
    const kv = await getKv(env);
    if (kv) {
        try {
            const val = await kv.get('config:loader_disabled_at');
            return val ? parseInt(val) : 0;
        } catch (e) {
            return 0;
        }
    }
    return memoryStore.loaderDisabledAt || 0;
}

async function setLoaderDisabledAt(env, timestamp) {
    const kv = await getKv(env);
    if (kv) {
        if (timestamp) {
            await kv.put('config:loader_disabled_at', timestamp.toString());
        } else {
            await kv.delete('config:loader_disabled_at');
        }
        return;
    }
    memoryStore.loaderDisabledAt = timestamp || 0;
}

async function addCrackingAttempt(env, data) {
    const logItem = {
        id: getRandomHex(8),
        timestamp: Date.now(),
        threat_type: data.threat_type || 'Security Violation',
        offending_app: data.offending_app || 'Unknown Tool',
        ip: data.ip || '127.0.0.1',
        key: data.key || null,
        hwid: data.hwid || null,
        details: data.details || ''
    };
    const kv = await getKv(env);
    if (kv) {
        let list = [];
        try {
            list = (await kv.get('cracking:attempts', 'json')) || [];
        } catch (e) {
            list = [];
        }
        list.unshift(logItem);
        if (list.length > 200) list = list.slice(0, 200);
        await kv.put('cracking:attempts', JSON.stringify(list));
        return logItem;
    }
    if (!memoryStore.crackingAttempts) memoryStore.crackingAttempts = [];
    memoryStore.crackingAttempts.unshift(logItem);
    if (memoryStore.crackingAttempts.length > 200) memoryStore.crackingAttempts = memoryStore.crackingAttempts.slice(0, 200);
    return logItem;
}

async function getCrackingAttempts(env) {
    const kv = await getKv(env);
    if (kv) {
        try {
            return (await kv.get('cracking:attempts', 'json')) || [];
        } catch (e) {
            return [];
        }
    }
    return memoryStore.crackingAttempts || [];
}

async function clearCrackingAttempts(env) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('cracking:attempts', JSON.stringify([]));
        return;
    }
    memoryStore.crackingAttempts = [];
}

// -------------------------------------------------------------
// REQUEST DISPATCHER (Cloudflare Worker Event Handler)
// -------------------------------------------------------------
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;
        const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };

        if (method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const jsonResponse = (data, status = 200) => {
            return new Response(JSON.stringify(data), {
                status,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        };

        // Determine Redirect URI dynamically (works on larpifyy.asia or workers.dev)
        const hostOrigin = url.origin;
        const discordRedirectUri = `${hostOrigin}/api/admin/discord/callback`;
        const discordOAuthUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(discordRedirectUri)}&scope=identify&prompt=consent`;

        // Check Admin Authentication via Cookie or Bearer header
        const cookies = parseCookies(request.headers.get('cookie'));
        const authHeader = request.headers.get('authorization') || '';
        const adminToken = (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '') || cookies['auth_admin_session'];
        const currentAdmin = await getAdminSession(env, adminToken);

        // -------------------------------------------------------------
        // 1. DISCORD OAUTH2 CALLBACK: /api/admin/discord/callback
        // -------------------------------------------------------------
        if (path === '/api/admin/discord/callback' || (path === '/admin' && url.searchParams.has('code'))) {
            const code = url.searchParams.get('code');
            if (!code) {
                // Denied or cancelled -> Throw back to bio profile
                return Response.redirect('https://larpifyy.asia/', 302);
            }

            try {
                // Exchange code for Discord token
                const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: DISCORD_CLIENT_ID,
                        client_secret: DISCORD_CLIENT_SECRET,
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: discordRedirectUri
                    })
                });

                if (!tokenResponse.ok) {
                    await addAuditLog(env, 'DISCORD_TOKEN_EXCHANGE_FAIL', ip, '', 'Failed to exchange Discord code');
                    return Response.redirect('https://larpifyy.asia/', 302);
                }

                const tokenData = await tokenResponse.json();

                // Fetch Discord user profile
                const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
                    headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
                });

                if (!userResponse.ok) {
                    return Response.redirect('https://larpifyy.asia/', 302);
                }

                const discordUser = await userResponse.json();

                // STRICT DISCORD ID CHECK: Must be 1415022792214052915
                if (discordUser.id !== ALLOWED_DISCORD_ID) {
                    await addAuditLog(env, 'ADMIN_ACCESS_BLOCKED', ip, '', `Unauthorized Discord ID: ${discordUser.id} (${discordUser.username})`);
                    // Throw unauthorized user back to bio profile
                    return Response.redirect('https://larpifyy.asia/', 302);
                }

                // Authorized! Issue a secure Admin Session Token
                const sessionId = getRandomHex(32);
                const sessionData = {
                    discord_id: discordUser.id,
                    username: discordUser.username,
                    global_name: discordUser.global_name || discordUser.username,
                    avatar: discordUser.avatar 
                        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                        : 'https://cdn.discordapp.com/embed/avatars/0.png',
                    logged_in_at: Date.now()
                };

                await saveAdminSession(env, sessionId, sessionData);
                await addAuditLog(env, 'ADMIN_DISCORD_LOGIN_SUCCESS', ip, '', `Welcome Owner: ${discordUser.username} (${discordUser.id})`);

                // Set HttpOnly secure session cookie and redirect to /admin?auth=1
                const headers = new Headers();
                headers.set('Location', `${hostOrigin}/admin?auth=1`);
                headers.set('Set-Cookie', `auth_admin_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax`);

                return new Response(null, { status: 302, headers });
            } catch (err) {
                await addAuditLog(env, 'DISCORD_OAUTH_ERROR', ip, '', err.message);
                return Response.redirect('https://larpifyy.asia/', 302);
            }
        }

        // -------------------------------------------------------------
        // 2. ADMIN DASHBOARD PAGE: /admin (Forces Discord Login Every Visit)
        // -------------------------------------------------------------
        if (path === '/admin') {
            // Only render if arriving with active authorized session
            if (url.searchParams.has('auth') && currentAdmin && currentAdmin.discord_id === ALLOWED_DISCORD_ID) {
                return new Response(ADMIN_HTML, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/html; charset=UTF-8',
                        'Cache-Control': 'no-store, no-cache, must-revalidate',
                        ...corsHeaders
                    }
                });
            }

            // Every fresh navigation to /admin triggers Discord OAuth
            return Response.redirect(discordOAuthUrl, 302);
        }

        // -------------------------------------------------------------
        // 3. ADMIN LOGOUT: /api/admin/logout
        // -------------------------------------------------------------
        if (path === '/api/admin/logout') {
            if (adminToken) {
                await deleteAdminSession(env, adminToken);
            }
            const headers = new Headers();
            headers.set('Location', 'https://larpifyy.asia/');
            headers.set('Set-Cookie', `auth_admin_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
            return new Response(null, { status: 302, headers });
        }

        // -------------------------------------------------------------
        // 4. CLIENT API ENDPOINTS (Zero-Knowledge, Encrypted Payload)
        // -------------------------------------------------------------
        if (path === '/api/v1/report-threat' && method === 'POST') {
            try {
                const body = await request.json();
                await addCrackingAttempt(env, {
                    threat_type: body.threat_type || body.reason || 'Client Security Violation',
                    offending_app: body.offending_app || body.app || 'Unknown Tool',
                    ip,
                    key: body.key || null,
                    hwid: body.hwid || null,
                    details: body.details || ''
                });
                await addAuditLog(env, 'CRACKING_ATTEMPT', ip, body.key || '', `${body.threat_type || body.reason || 'Security Alert'} (Tool: ${body.offending_app || 'N/A'})`);
                return jsonResponse({ success: true });
            } catch (err) {
                return jsonResponse({ success: false, message: err.message }, 500);
            }
        }

        if (path === '/api/v1/init' && method === 'POST') {
            const enabled = await isLoaderEnabled(env);
            if (!enabled) {
                const reason = await getLoaderDisableReason(env);
                return jsonResponse({
                    success: false,
                    loader_enabled: false,
                    reason: reason,
                    message: `Loader has been disabled\n\nReason: ${reason}`
                });
            }
            const nonce = getRandomHex(16);
            return jsonResponse({
                success: true,
                loader_enabled: true,
                version: '2.0.0-cloudflare',
                timestamp: Date.now(),
                nonce
            });
        }

        if (path === '/api/v1/login' && method === 'POST') {
            try {
                const enabled = await isLoaderEnabled(env);
                if (!enabled) {
                    const reason = await getLoaderDisableReason(env);
                    return jsonResponse({
                        success: false,
                        loader_enabled: false,
                        reason: reason,
                        message: `Loader has been disabled\n\nReason: ${reason}`
                    });
                }

                const body = await request.json();
                const { key, hwid } = body;

                if (!key || !hwid) {
                    await addAuditLog(env, 'LOGIN_FAIL_BAD_REQUEST', ip, key || '', 'Missing key or HWID');
                    return jsonResponse({ success: false, message: 'Invalid credentials provided' }, 400);
                }

                const lic = await getLicense(env, key);
                if (!lic) {
                    await addAuditLog(env, 'LOGIN_FAIL_UNKNOWN_KEY', ip, key, 'Key not found');
                    return jsonResponse({ success: false, message: 'Invalid license key' });
                }

                if (lic.status === 'banned') {
                    await addAuditLog(env, 'LOGIN_FAIL_BANNED', ip, key, 'Account is banned');
                    await addCrackingAttempt(env, {
                        threat_type: 'Banned Key Access Attempt',
                        offending_app: 'Loader Login',
                        ip,
                        key,
                        hwid,
                        details: 'User attempted to authenticate with banned license'
                    });
                    return jsonResponse({ success: false, message: 'License key has been banned' });
                }

                const now = Date.now();

                if (!lic.activated_at) {
                    const expiresAt = lic.duration_days === 0 ? null : now + (lic.duration_days * 86400000);
                    lic.activated_at = now;
                    lic.expires_at = expiresAt;
                    lic.hwid = hwid;
                    lic.ip = ip;
                    lic.last_login = now;
                    await saveLicense(env, lic);
                    await addAuditLog(env, 'KEY_ACTIVATED', ip, key, `HWID: ${hwid.substring(0, 16)}...`);
                } else {
                    if (lic.expires_at && lic.expires_at < now) {
                        await addAuditLog(env, 'LOGIN_FAIL_EXPIRED', ip, key, 'Subscription expired');
                        return jsonResponse({ success: false, message: 'License key has expired' });
                    }

                    if (!lic.hwid) {
                        lic.hwid = hwid;
                        lic.ip = ip;
                        lic.last_login = now;
                        await saveLicense(env, lic);
                    } else if (lic.hwid !== hwid) {
                        await addAuditLog(env, 'HWID_MISMATCH', ip, key, `Expected: ${lic.hwid.substring(0, 10)}, Got: ${hwid.substring(0, 10)}`);
                        await addCrackingAttempt(env, {
                            threat_type: 'HWID Mismatch Spoof Attempt',
                            offending_app: 'Loader Login',
                            ip,
                            key,
                            hwid,
                            details: `Key bound to HWID ${lic.hwid.substring(0, 10)}... vs connecting HWID ${hwid.substring(0, 10)}...`
                        });
                        return jsonResponse({ success: false, message: 'HWID mismatch. Reset HWID in dashboard.' });
                    } else {
                        lic.ip = ip;
                        lic.last_login = now;
                        await saveLicense(env, lic);
                    }
                }

                const sessionId = getRandomHex(32);
                const aesKey = getRandomHex(32);
                await createClientSession(env, sessionId, {
                    key,
                    hwid,
                    aes_key: aesKey,
                    expires_at: now + (2 * 3600000)
                });

                await addAuditLog(env, 'LOGIN_SUCCESS', ip, key, 'Session created at Cloudflare edge');

                return jsonResponse({
                    success: true,
                    session_token: sessionId,
                    session_key: aesKey,
                    expires_at: lic.expires_at,
                    is_lifetime: lic.duration_days === 0
                });
            } catch (err) {
                return jsonResponse({ success: false, message: 'Login error: ' + err.message }, 500);
            }
        }

        if (path === '/api/v1/payload' && method === 'POST') {
            try {
                const enabled = await isLoaderEnabled(env);
                if (!enabled) {
                    return jsonResponse({
                        success: false,
                        loader_enabled: false,
                        message: 'Loader has been disabled'
                    }, 403);
                }

                const body = await request.json();
                const { session_token } = body;

                if (!session_token) {
                    return jsonResponse({ success: false, message: 'Missing session token' }, 401);
                }

                const session = await getClientSession(env, session_token);
                if (!session || session.expires_at < Date.now()) {
                    await addAuditLog(env, 'PAYLOAD_FAIL_INVALID_SESSION', ip, '', 'Session expired');
                    return jsonResponse({ success: false, message: 'Session expired' }, 401);
                }

                // Verify underlying license key status before dispatching payload
                const lic = await getLicense(env, session.key);
                if (!lic || lic.status === 'banned') {
                    await addAuditLog(env, 'PAYLOAD_FAIL_BANNED', ip, session.key, 'Payload access rejected: Banned key');
                    return jsonResponse({ success: false, message: 'License access revoked' }, 403);
                }

                const rawPayloadBytes = base64ToBytes(DRIVER_PAYLOAD_B64);
                const encryptedHex = await encryptAes256Ctr(rawPayloadBytes, session.aes_key);

                await addAuditLog(env, 'PAYLOAD_DISPATCHED', ip, session.key, `Dispatched ${rawPayloadBytes.length} bytes encrypted`);

                return jsonResponse({
                    success: true,
                    size: rawPayloadBytes.length,
                    encrypted_hex: encryptedHex
                });
            } catch (err) {
                return jsonResponse({ success: false, message: 'Payload delivery error: ' + err.message }, 500);
            }
        }

        // -------------------------------------------------------------
        // 4.1 CLIENT HEARTBEAT (Real-Time Revocation & Session Lease)
        // -------------------------------------------------------------
        if (path === '/api/v1/heartbeat' && method === 'POST') {
            try {
                const enabled = await isLoaderEnabled(env);
                if (!enabled) {
                    return jsonResponse({
                        success: false,
                        loader_enabled: false,
                        message: 'Loader has been disabled'
                    }, 403);
                }

                const body = await request.json();
                const { session_token, hwid } = body;

                if (!session_token) {
                    return jsonResponse({ success: false, message: 'Missing session token' }, 401);
                }

                const session = await getClientSession(env, session_token);
                if (!session || session.expires_at < Date.now()) {
                    return jsonResponse({ success: false, message: 'Session expired or not found' }, 401);
                }

                // Verify underlying license key in real-time
                const lic = await getLicense(env, session.key);
                if (!lic) {
                    return jsonResponse({ success: false, message: 'License key no longer exists' }, 403);
                }

                if (lic.status === 'banned') {
                    await addAuditLog(env, 'HEARTBEAT_REVOKED_BANNED', ip, session.key, 'Heartbeat rejected: Account banned');
                    return jsonResponse({ success: false, message: 'License key has been banned' }, 403);
                }

                const now = Date.now();
                if (lic.expires_at && lic.expires_at < now) {
                    await addAuditLog(env, 'HEARTBEAT_REVOKED_EXPIRED', ip, session.key, 'Heartbeat rejected: Subscription expired');
                    return jsonResponse({ success: false, message: 'License subscription has expired' }, 403);
                }

                if (hwid && lic.hwid && lic.hwid !== hwid) {
                    await addAuditLog(env, 'HEARTBEAT_REVOKED_HWID', ip, session.key, 'Heartbeat rejected: HWID mismatch');
                    await addCrackingAttempt(env, {
                        threat_type: 'Active Memory HWID Tamper',
                        offending_app: 'Heartbeat Daemon',
                        ip,
                        key: session.key,
                        hwid,
                        details: 'Hardware ID altered during live authenticated session'
                    });
                    return jsonResponse({ success: false, message: 'Hardware mismatch detected' }, 403);
                }

                // Refresh rolling session lease (2 hours)
                session.expires_at = now + (2 * 3600000);
                await createClientSession(env, session_token, session);

                lic.last_heartbeat = now;
                await saveLicense(env, lic);

                return jsonResponse({
                    success: true,
                    timestamp: now,
                    expires_at: lic.expires_at
                });
            } catch (err) {
                return jsonResponse({ success: false, message: 'Heartbeat error: ' + err.message }, 500);
            }
        }

        // -------------------------------------------------------------
        // 4.5 DISCORD BOT KEY REDEEM ENDPOINT: /api/discord/redeem
        // -------------------------------------------------------------
        if (path === '/api/discord/redeem' && method === 'POST') {
            try {
                const body = await request.json();
                const { key, discord_id } = body;

                if (!key || !discord_id) {
                    return jsonResponse({ success: false, message: 'Missing key or Discord ID.' }, 400);
                }

                const lic = await getLicense(env, key.trim());
                if (!lic) {
                    await addAuditLog(env, 'DISCORD_REDEEM_FAIL_UNKNOWN', ip, key, `Discord ID: ${discord_id}`);
                    return jsonResponse({ success: false, message: 'Invalid license key.' });
                }

                if (lic.status === 'banned') {
                    await addAuditLog(env, 'DISCORD_REDEEM_FAIL_BANNED', ip, key, `Discord ID: ${discord_id}`);
                    return jsonResponse({ success: false, message: 'License key has been banned.' });
                }

                const now = Date.now();

                // If already activated, check if expired
                if (lic.expires_at && lic.expires_at < now) {
                    await addAuditLog(env, 'DISCORD_REDEEM_FAIL_EXPIRED', ip, key, `Discord ID: ${discord_id}`);
                    return jsonResponse({ success: false, message: 'This license key has expired.' });
                }

                // If already bound to another discord user
                if (lic.discord_id && lic.discord_id !== discord_id) {
                    await addAuditLog(env, 'DISCORD_REDEEM_FAIL_BOUND', ip, key, `Already bound to ${lic.discord_id}`);
                    return jsonResponse({ success: false, message: 'This key has already been redeemed by another Discord user.' });
                }

                // Activate if not activated yet
                if (!lic.activated_at) {
                    lic.activated_at = now;
                    lic.expires_at = lic.duration_days === 0 ? null : now + (lic.duration_days * 86400000);
                }

                lic.discord_id = discord_id;
                await saveLicense(env, lic);
                await addAuditLog(env, 'DISCORD_KEY_REDEEMED', ip, key, `Discord ID: ${discord_id}, Duration: ${lic.duration_days === 0 ? 'Lifetime' : lic.duration_days + 'd'}`);

                return jsonResponse({
                    success: true,
                    duration_days: lic.duration_days,
                    expires_at: lic.expires_at,
                    lifetime: lic.duration_days === 0,
                    message: 'Successfully activated!'
                });
            } catch (err) {
                return jsonResponse({ success: false, message: 'Server error: ' + err.message }, 500);
            }
        }

        // -------------------------------------------------------------
        // 4.6 DISCORD BOT HWID RESET ENDPOINT: /api/discord/hwid-reset
        // -------------------------------------------------------------
        if (path === '/api/discord/hwid-reset' && method === 'POST') {
            try {
                const body = await request.json();
                const { discord_id, key, reason } = body;

                if (!discord_id) {
                    return jsonResponse({ success: false, message: 'Missing Discord ID.' }, 400);
                }

                if (!reason || reason.trim().length < 5) {
                    return jsonResponse({ success: false, message: 'Please provide a valid, detailed reason for the HWID reset.' });
                }

                let lic = null;
                if (key && key.trim()) {
                    lic = await getLicense(env, key.trim());
                    if (!lic) {
                        return jsonResponse({ success: false, message: 'The provided license key was not found.' });
                    }
                    if (lic.discord_id && lic.discord_id !== discord_id) {
                        return jsonResponse({ success: false, message: 'This key is bound to a different Discord account.' });
                    }
                } else {
                    const all = await getAllLicenses(env);
                    lic = all.find(l => l.discord_id === discord_id && l.status !== 'banned');
                    if (!lic) {
                        return jsonResponse({ success: false, message: 'No active license found linked to your Discord account. Please enter your license key.' });
                    }
                }

                if (lic.status === 'banned') {
                    await addAuditLog(env, 'HWID_RESET_FAIL_BANNED', ip, lic.key, `User: <@${discord_id}>`);
                    return jsonResponse({ success: false, message: 'This license key is banned.' });
                }

                const now = Date.now();
                if (lic.expires_at && lic.expires_at < now) {
                    await addAuditLog(env, 'HWID_RESET_FAIL_EXPIRED', ip, lic.key, `User: <@${discord_id}>`);
                    return jsonResponse({ success: false, message: 'This license key has expired.' });
                }

                // Cooldown removed - HWID reset works instantly every time
                const wasUnbound = !lic.hwid;
                const oldHwid = lic.hwid;
                lic.hwid = null;
                lic.last_hwid_reset = now;
                lic.reset_reason = (reason && reason.trim()) ? reason.trim() : 'Instant HWID reset';
                await saveLicense(env, lic);

                await addAuditLog(env, 'HWID_RESET_DISCORD', ip, lic.key, `User: <@${discord_id}>, Reason: "${lic.reset_reason}", Prev HWID: ${oldHwid ? oldHwid.substring(0, 10) + '...' : 'unbound'}`);

                return jsonResponse({
                    success: true,
                    key: lic.key,
                    message: wasUnbound
                        ? 'HWID successfully reset. Your key is unbound and ready to be used on your PC.'
                        : 'HWID has been successfully reset. You can now launch the loader on your new hardware.'
                });
            } catch (err) {
                return jsonResponse({ success: false, message: 'Server error: ' + err.message }, 500);
            }
        }

        // -------------------------------------------------------------
        // 4.7 DISCORD BOT KEY GENERATION ENDPOINT: /api/discord/generate-key
        // -------------------------------------------------------------
        if (path === '/api/discord/generate-key' && method === 'POST') {
            try {
                const body = await request.json();
                const { duration_days, prefix = 'VIP', note = '', admin_discord_id, target_discord_id } = body;

                const dur = parseInt(duration_days);
                const safeDuration = isNaN(dur) ? 0 : dur;
                const cleanPrefix = (prefix && prefix.trim().length > 0) ? prefix.trim().toUpperCase() : 'VIP';

                const key = generateLicenseKey(cleanPrefix);
                const now = Date.now();
                const lic = {
                    key,
                    duration_days: safeDuration,
                    status: 'active',
                    hwid: null,
                    ip: null,
                    created_at: now,
                    activated_at: null,
                    expires_at: null,
                    discord_id: target_discord_id || null,
                    note: note || `Generated via Discord Bot by <@${admin_discord_id || 'admin'}> for <@${target_discord_id || 'user'}>`,
                    last_login: null
                };

                await saveLicense(env, lic);
                await addAuditLog(env, 'KEY_GENERATED_DISCORD', ip, key, `Generated by <@${admin_discord_id || 'admin'}> for <@${target_discord_id || 'user'}> (${safeDuration === 0 ? 'Lifetime' : safeDuration + 'd'})`);

                return jsonResponse({
                    success: true,
                    key,
                    duration_days: safeDuration,
                    is_lifetime: safeDuration === 0
                });
            } catch (err) {
                return jsonResponse({ success: false, message: 'Server error: ' + err.message }, 500);
            }
        }

        // -------------------------------------------------------------
        // 5. ADMIN REST API (Requires Verified Discord Owner)
        // -------------------------------------------------------------
        if (path.startsWith('/api/admin/')) {
            if (!currentAdmin || currentAdmin.discord_id !== ALLOWED_DISCORD_ID) {
                return jsonResponse({ success: false, error: 'Unauthorized. Owner Discord required.' }, 401);
            }

            if (path === '/api/admin/me') {
                return jsonResponse({ success: true, user: currentAdmin });
            }

            if (path === '/api/admin/overview' && method === 'GET') {
                try {
                    const licenses = await getAllLicenses(env);
                    const logs = await getAuditLogs(env);
                    const now = Date.now();

                    const total = licenses.length;
                    const banned = licenses.filter(l => l.status === 'banned').length;

                    const loaderEnabled = await isLoaderEnabled(env);
                    const loaderReason = await getLoaderDisableReason(env);
                    const loaderDisabledAt = await getLoaderDisabledAt(env);
                    const crackingAttempts = await getCrackingAttempts(env);

                    const effectiveNow = loaderEnabled ? now : (loaderDisabledAt || now);
                    const active = licenses.filter(l => l.status === 'active' && (!l.expires_at || l.expires_at >= effectiveNow)).length;

                    return jsonResponse({
                        success: true,
                        user: currentAdmin,
                        licenses,
                        logs,
                        cracking_attempts: crackingAttempts,
                        loader_enabled: loaderEnabled,
                        loader_disable_reason: loaderReason,
                        loader_disabled_at: loaderDisabledAt,
                        stats: { total, active, banned, cracks: crackingAttempts.length, payloadLoaded: true }
                    });
                } catch (err) {
                    console.error('Error serving admin overview:', err);
                    return jsonResponse({
                        success: false,
                        error: 'Failed to load dashboard data: ' + err.message
                    }, 500);
                }
            }

            if (path === '/api/admin/clear-cracks' && method === 'POST') {
                await clearCrackingAttempts(env);
                await addAuditLog(env, 'CRACKING_LOGS_CLEARED', ip, '', 'Cracking attempts feed cleared by Discord Owner');
                return jsonResponse({ success: true });
            }

            if (path === '/api/admin/toggle-loader' && method === 'POST') {
                const body = (await request.json().catch(() => ({}))) || {};
                const current = await isLoaderEnabled(env);
                let updated = !current;
                if (body.enable !== undefined) {
                    updated = !!body.enable;
                }

                const now = Date.now();
                let compensatedCount = 0;
                let compensationDurationStr = '';

                if (!updated && current) {
                    // Transition: ENABLED -> DISABLED (Freeze timers)
                    let reason = body.reason ? body.reason.trim() : 'Updating for new game patch';
                    await setLoaderDisableReason(env, reason);
                    await setLoaderDisabledAt(env, now);
                    await setLoaderEnabled(env, false);

                    await addAuditLog(env, 'LOADER_DISABLED', ip, '', `Loader globally DISABLED. Reason: "${reason}". Active key timers FROZEN.`);
                    return jsonResponse({
                        success: true,
                        loader_enabled: false,
                        reason: reason,
                        disabled_at: now
                    });
                } else if (updated && !current) {
                    // Transition: DISABLED -> ENABLED (Resume timers & compensate missed time)
                    const disabledAt = await getLoaderDisabledAt(env);
                    const delta = (disabledAt > 0 && now > disabledAt) ? (now - disabledAt) : 0;

                    if (delta > 0) {
                        const allLicenses = await getAllLicenses(env);
                        for (const lic of allLicenses) {
                            if (lic.status !== 'banned' && lic.expires_at && lic.expires_at >= disabledAt) {
                                lic.expires_at += delta;
                                await saveLicense(env, lic);
                                compensatedCount++;
                            }
                        }

                        const mins = Math.round(delta / 60000);
                        const hours = (delta / 3600000).toFixed(1);
                        compensationDurationStr = mins < 60 ? `${mins}m` : `${hours}h`;
                    }

                    await setLoaderDisabledAt(env, 0);
                    await setLoaderEnabled(env, true);

                    const logDetail = delta > 0
                        ? `Loader re-enabled. Compensated ${compensatedCount} active license(s) by +${compensationDurationStr} (+${Math.round(delta / 1000)}s) downtime.`
                        : `Loader re-enabled globally by Discord Owner.`;

                    await addAuditLog(env, 'LOADER_ENABLED', ip, '', logDetail);

                    return jsonResponse({
                        success: true,
                        loader_enabled: true,
                        compensated_keys: compensatedCount,
                        compensation_time_ms: delta
                    });
                }

                return jsonResponse({ success: true, loader_enabled: updated });
            }

            if (path === '/api/admin/generate-keys' && method === 'POST') {
                const body = await request.json();
                const { duration_days, prefix = 'KEY', count = 1, note = '' } = body;
                const qty = Math.min(Math.max(1, parseInt(count) || 1), 50);
                const generated = [];
                const now = Date.now();

                for (let i = 0; i < qty; i++) {
                    const key = generateLicenseKey(prefix);
                    const lic = {
                        key,
                        duration_days: parseInt(duration_days) || 0,
                        status: 'active',
                        hwid: null,
                        ip: null,
                        created_at: now,
                        activated_at: null,
                        expires_at: null,
                        note,
                        last_login: null
                    };
                    await saveLicense(env, lic);
                    generated.push(key);
                }

                await addAuditLog(env, 'KEYS_GENERATED', ip, '', `Generated ${qty} key(s) by Discord Owner`);
                return jsonResponse({ success: true, keys: generated });
            }

            if (path === '/api/admin/reset-hwid' && method === 'POST') {
                const body = await request.json();
                const lic = await getLicense(env, body.key);
                if (lic) {
                    lic.hwid = null;
                    await saveLicense(env, lic);
                    await addAuditLog(env, 'HWID_RESET', ip, body.key, 'HWID cleared by Discord Owner');
                }
                return jsonResponse({ success: true });
            }

            if (path === '/api/admin/set-status' && method === 'POST') {
                const body = await request.json().catch(() => ({}));
                const lic = await getLicense(env, body.key);
                if (lic && ['active', 'banned'].includes(body.status)) {
                    lic.status = body.status;
                    await saveLicense(env, lic);

                    let syncDetail = '';
                    const discordId = getDiscordIdForLicense(lic);
                    if (body.status === 'banned' && discordId) {
                        const sync = await syncDiscordRolesOnKeyRemoval(env, discordId, lic.key);
                        if (sync.roles.length) {
                            syncDetail = `. Discord <@${discordId}> roles revoked: ${sync.roles.join(', ')}`;
                        }
                    }

                    await addAuditLog(env, 'STATUS_CHANGE', ip, body.key, `Status changed to ${body.status}${syncDetail}`);
                }
                return jsonResponse({ success: true });
            }

            if (path === '/api/admin/delete-key' && method === 'POST') {
                const body = await request.json().catch(() => ({}));
                const keyToDelete = (body.key || '').trim();
                const lic = await getLicense(env, keyToDelete);
                
                const discordId = lic ? getDiscordIdForLicense(lic) : null;
                await deleteLicense(env, keyToDelete);

                let syncResult = { revoked: false, roles: [] };
                if (discordId) {
                    syncResult = await syncDiscordRolesOnKeyRemoval(env, discordId, keyToDelete);
                }

                const logDetail = discordId
                    ? `Deleted by Owner. Discord <@${discordId}> roles revoked: ${syncResult.roles.length ? syncResult.roles.join(', ') : 'None (other active key remains)'}`
                    : 'Deleted by Owner';

                await addAuditLog(env, 'KEY_DELETED', ip, keyToDelete, logDetail);
                return jsonResponse({ 
                    success: true, 
                    discord_id: discordId, 
                    roles_revoked: syncResult.revoked, 
                    revoked_roles: syncResult.roles 
                });
            }
        }

        // -------------------------------------------------------------
        // 6. FALLTHROUGH: Serve Guns.lol profile static assets
        // -------------------------------------------------------------
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        return new Response("Not found", { status: 404 });
    },

    async scheduled(event, env, ctx) {
        // Keeps Render Web Service alive 24/7 by pinging it every 10 minutes
        ctx.waitUntil(
            fetch('https://udvengers-auth-bot.onrender.com')
                .then(r => console.log('[Cron Keep-Alive] Pinged Render:', r.status))
                .catch(err => console.error('[Cron Keep-Alive] Error:', err.message))
        );
    }
};
