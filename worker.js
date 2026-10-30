import { DRIVER_PAYLOAD_B64 } from './driver_payload.js';
import { ADMIN_HTML } from './admin_html.js';

// -------------------------------------------------------------
// DISCORD OAUTH2 SECURITY CONFIGURATION
// -------------------------------------------------------------
const DISCORD_CLIENT_ID = '1565727420739227748';
const DISCORD_CLIENT_SECRET = 'hjw53zJFLDZ0kw50FbHNX1bQAWVqOkP3';
const ALLOWED_DISCORD_ID = '1415022792214052915';

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
        return (await kv.get('lic:' + key, 'json')) || null;
    }
    return memoryStore.licenses.get(key) || null;
}

async function saveLicense(env, lic) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('lic:' + lic.key, JSON.stringify(lic));
        let allKeys = (await kv.get('index:keys', 'json')) || [];
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
        let allKeys = (await kv.get('index:keys', 'json')) || [];
        allKeys = allKeys.filter(k => k !== key);
        await kv.put('index:keys', JSON.stringify(allKeys));
        return;
    }
    memoryStore.licenses.delete(key);
}

async function getAllLicenses(env) {
    const kv = await getKv(env);
    if (kv) {
        const allKeys = (await kv.get('index:keys', 'json')) || [];
        const results = [];
        for (const k of allKeys) {
            const lic = await kv.get('lic:' + k, 'json');
            if (lic) results.push(lic);
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
        return (await kv.get('audit:logs', 'json')) || [];
    }
    return memoryStore.logs;
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
        if (path === '/api/v1/init' && method === 'POST') {
            const nonce = getRandomHex(16);
            return jsonResponse({
                success: true,
                version: '2.0.0-cloudflare',
                timestamp: Date.now(),
                nonce
            });
        }

        if (path === '/api/v1/login' && method === 'POST') {
            try {
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
                const licenses = await getAllLicenses(env);
                const logs = await getAuditLogs(env);
                const now = Date.now();

                const total = licenses.length;
                const banned = licenses.filter(l => l.status === 'banned').length;
                const active = licenses.filter(l => l.status === 'active' && (!l.expires_at || l.expires_at >= now)).length;

                return jsonResponse({
                    success: true,
                    user: currentAdmin,
                    licenses,
                    logs,
                    stats: { total, active, banned, payloadLoaded: true }
                });
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
                const body = await request.json();
                const lic = await getLicense(env, body.key);
                if (lic && ['active', 'banned'].includes(body.status)) {
                    lic.status = body.status;
                    await saveLicense(env, lic);
                    await addAuditLog(env, 'STATUS_CHANGE', ip, body.key, `Status changed to ${body.status}`);
                }
                return jsonResponse({ success: true });
            }

            if (path === '/api/admin/delete-key' && method === 'POST') {
                const body = await request.json();
                await deleteLicense(env, body.key);
                await addAuditLog(env, 'KEY_DELETED', ip, body.key, 'Deleted by Discord Owner');
                return jsonResponse({ success: true });
            }
        }

        // -------------------------------------------------------------
        // 6. FALLTHROUGH: Serve Guns.lol profile static assets
        // -------------------------------------------------------------
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        return new Response("Not found", { status: 404 });
    }
};
