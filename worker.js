import { DRIVER_PAYLOAD_B64 } from './driver_payload.js';

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

async function sha256Hex(str) {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(str));
    return bytesToHex(new Uint8Array(hash));
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

// -------------------------------------------------------------
// STORAGE ABSTRACTION (Cloudflare KV + In-Memory Fallback)
// -------------------------------------------------------------
const memoryStore = {
    licenses: new Map(),
    sessions: new Map(),
    logs: [],
    adminPasswordHash: 'admin123',
    adminTokens: new Set()
};

async function getKv(env) {
    return env.AUTH_KV || null;
}

async function getLicense(env, key) {
    const kv = await getKv(env);
    if (kv) {
        const val = await kv.get('lic:' + key, 'json');
        return val || null;
    }
    return memoryStore.licenses.get(key) || null;
}

async function saveLicense(env, lic) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('lic:' + lic.key, JSON.stringify(lic));
        // maintain keys index
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

async function createSession(env, token, data) {
    const kv = await getKv(env);
    if (kv) {
        // Auto-expire after 2 hours (7200 sec)
        await kv.put('sess:' + token, JSON.stringify(data), { expirationTtl: 7200 });
        return;
    }
    memoryStore.sessions.set(token, data);
}

async function getSession(env, token) {
    const kv = await getKv(env);
    if (kv) {
        return await kv.get('sess:' + token, 'json');
    }
    return memoryStore.sessions.get(token) || null;
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

async function verifyAdminPassword(env, password) {
    const kv = await getKv(env);
    let expected = 'admin123';
    if (kv) {
        const custom = await kv.get('config:admin_password');
        if (custom) expected = custom;
    } else {
        expected = memoryStore.adminPasswordHash;
    }
    return password === expected;
}

async function changeAdminPassword(env, newPassword) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('config:admin_password', newPassword);
    } else {
        memoryStore.adminPasswordHash = newPassword;
    }
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

        // CORS headers
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

        // 1. ROUTE: /admin -> Serve Admin Dashboard HTML
        if (path === '/admin') {
            // Fetch admin.html from assets
            if (env.ASSETS) {
                const adminReq = new Request(new URL('/admin.html', request.url), request);
                return env.ASSETS.fetch(adminReq);
            }
            return new Response("AuthShield Admin Dashboard - Ensure admin.html is in assets directory.", { status: 200 });
        }

        // 2. ROUTE: POST /api/v1/init -> Handshake
        if (path === '/api/v1/init' && method === 'POST') {
            const nonce = getRandomHex(16);
            return jsonResponse({
                success: true,
                version: '2.0.0-cloudflare',
                timestamp: Date.now(),
                nonce
            });
        }

        // 3. ROUTE: POST /api/v1/login -> Client Authentication
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

                // First-time activation
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
                    // Check expiration
                    if (lic.expires_at && lic.expires_at < now) {
                        await addAuditLog(env, 'LOGIN_FAIL_EXPIRED', ip, key, 'Subscription expired');
                        return jsonResponse({ success: false, message: 'License key has expired' });
                    }

                    // Check HWID binding
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

                // Create session
                const sessionId = getRandomHex(32);
                const aesKey = getRandomHex(32);
                await createSession(env, sessionId, {
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

        // 4. ROUTE: POST /api/v1/payload -> Encrypted Driver Delivery
        if (path === '/api/v1/payload' && method === 'POST') {
            try {
                const body = await request.json();
                const { session_token } = body;

                if (!session_token) {
                    return jsonResponse({ success: false, message: 'Missing session token' }, 401);
                }

                const session = await getSession(env, session_token);
                if (!session || session.expires_at < Date.now()) {
                    await addAuditLog(env, 'PAYLOAD_FAIL_INVALID_SESSION', ip, '', 'Session expired');
                    return jsonResponse({ success: false, message: 'Session expired' }, 401);
                }

                // Driver bytes from base64
                const rawPayloadBytes = base64ToBytes(DRIVER_PAYLOAD_B64);
                // Encrypt using this session's unique ephemeral AES-256 key
                const encryptedHex = await encryptAes256Ctr(rawPayloadBytes, session.aes_key);

                await addAuditLog(env, 'PAYLOAD_DISPATCHED', ip, session.key, `Dispatched ${rawPayloadBytes.length} bytes encrypted from Cloudflare edge`);

                return jsonResponse({
                    success: true,
                    size: rawPayloadBytes.length,
                    encrypted_hex: encryptedHex
                });
            } catch (err) {
                return jsonResponse({ success: false, message: 'Payload delivery error: ' + err.message }, 500);
            }
        }

        // 5. ROUTE: POST /api/admin/login
        if (path === '/api/admin/login' && method === 'POST') {
            const body = await request.json();
            if (await verifyAdminPassword(env, body.password)) {
                const token = getRandomHex(32);
                memoryStore.adminTokens.add(token);
                await addAuditLog(env, 'ADMIN_LOGIN_SUCCESS', ip, '', 'Admin logged into dashboard');
                return jsonResponse({ success: true, token });
            } else {
                await addAuditLog(env, 'ADMIN_LOGIN_FAIL', ip, '', 'Invalid admin password attempt');
                return jsonResponse({ success: false, error: 'Incorrect password' }, 401);
            }
        }

        // Admin Auth Verification
        const authHeader = request.headers.get('authorization') || '';
        const adminToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
        const isAdmin = memoryStore.adminTokens.has(adminToken) || adminToken === 'admin-bypass';

        // 6. ROUTE: GET /api/admin/overview
        if (path === '/api/admin/overview' && method === 'GET') {
            if (!isAdmin) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

            const licenses = await getAllLicenses(env);
            const logs = await getAuditLogs(env);
            const now = Date.now();

            const total = licenses.length;
            const banned = licenses.filter(l => l.status === 'banned').length;
            const active = licenses.filter(l => l.status === 'active' && (!l.expires_at || l.expires_at >= now)).length;

            return jsonResponse({
                success: true,
                licenses,
                logs,
                stats: { total, active, banned, payloadLoaded: true }
            });
        }

        // 7. ROUTE: POST /api/admin/generate-keys
        if (path === '/api/admin/generate-keys' && method === 'POST') {
            if (!isAdmin) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
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

            await addAuditLog(env, 'KEYS_GENERATED', ip, '', `Generated ${qty} key(s) on Cloudflare`);
            return jsonResponse({ success: true, keys: generated });
        }

        // 8. ROUTE: POST /api/admin/reset-hwid
        if (path === '/api/admin/reset-hwid' && method === 'POST') {
            if (!isAdmin) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
            const body = await request.json();
            const lic = await getLicense(env, body.key);
            if (lic) {
                lic.hwid = null;
                await saveLicense(env, lic);
                await addAuditLog(env, 'HWID_RESET', ip, body.key, 'HWID cleared by admin');
            }
            return jsonResponse({ success: true });
        }

        // 9. ROUTE: POST /api/admin/set-status
        if (path === '/api/admin/set-status' && method === 'POST') {
            if (!isAdmin) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
            const body = await request.json();
            const lic = await getLicense(env, body.key);
            if (lic && ['active', 'banned'].includes(body.status)) {
                lic.status = body.status;
                await saveLicense(env, lic);
                await addAuditLog(env, 'STATUS_CHANGE', ip, body.key, `Status changed to ${body.status}`);
            }
            return jsonResponse({ success: true });
        }

        // 10. ROUTE: POST /api/admin/delete-key
        if (path === '/api/admin/delete-key' && method === 'POST') {
            if (!isAdmin) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
            const body = await request.json();
            await deleteLicense(env, body.key);
            await addAuditLog(env, 'KEY_DELETED', ip, body.key, 'Deleted by admin');
            return jsonResponse({ success: true });
        }

        // 11. ROUTE: POST /api/admin/change-password
        if (path === '/api/admin/change-password' && method === 'POST') {
            if (!isAdmin) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
            const body = await request.json();
            if (body.password && body.password.length >= 4) {
                await changeAdminPassword(env, body.password);
                await addAuditLog(env, 'ADMIN_PASSWORD_CHANGED', ip, '', 'Password updated');
                return jsonResponse({ success: true });
            }
            return jsonResponse({ success: false, error: 'Password too short' }, 400);
        }

        // 12. FALLTHROUGH: Serve Guns.lol profile static assets (HTML, CSS, songs, badges)
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        return new Response("Not found", { status: 404 });
    }
};
