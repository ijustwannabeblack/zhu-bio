import { DRIVER_PAYLOAD_B64 } from './driver_payload.js';
import { ADMIN_HTML } from './admin_html.js';
import { CUSTOMER_HTML } from './customer_html.js';

// -------------------------------------------------------------
// DISCORD OAUTH2 & BOT INTEGRATION CONFIGURATION
// -------------------------------------------------------------
const DISCORD_CLIENT_ID = '1565727420739227748';
const DISCORD_CLIENT_SECRET = 'hjw53zJFLDZ0kw50FbHNX1bQAWVqOkP3';
const ALLOWED_DISCORD_ID = '1415022792214052915';
const DISCORD_GUILD_ID = '1549785920490971187';
const DISCORD_ROLE_CUSTOMER = '1550990740329467904';
const DISCORD_ROLE_LIFETIME = '1551043327317516348';
const DISCORD_ROLE_VERIFIED = '1550780294896812174';
const DISCORD_VERIFY_CHANNEL_ID = '1551017201455210637';

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

async function assignDiscordRole(env, guildId, userId, roleId) {
    if (!guildId || !userId || !roleId) return false;
    try {
        const token = getBotToken(env);
        const url = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bot ${token}`,
                'X-Audit-Log-Reason': 'Customer Portal Signup License Activation'
            }
        });
        console.log(`[Discord Role Assign] User ${userId}, Role ${roleId}, Status ${res.status}`);
        return res.ok || res.status === 204;
    } catch (err) {
        console.error(`[Discord Role Assign Error] Member ${userId}, Role ${roleId}:`, err);
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

// -------------------------------------------------------------
// CUSTOMER AUTHENTICATION & SESSION HELPERS
// -------------------------------------------------------------
const DEFAULT_RESEND_KEY = atob('cmVfaEtiWWtGNGJfR0hMeFRxd1Y3b1FQUGt5ZUVXaDdTZHg4');

async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const data = enc.encode(password + ':' + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function wipeAllCustomerData(env) {
    const kv = await getKv(env);
    let deletedCount = 0;

    // 1. Clear in-memory maps
    if (memoryStore) {
        if (memoryStore.customers) memoryStore.customers.clear();
        if (memoryStore.custSessions) memoryStore.custSessions.clear();
        if (memoryStore.otps) memoryStore.otps.clear();
    }

    if (!kv) {
        return { success: true, count: 0, storage: 'memory' };
    }

    // 2. Get registered customer list
    let customerEmails = [];
    try {
        customerEmails = (await kv.get('index:customers', 'json')) || [];
    } catch (_) {}

    for (const email of customerEmails) {
        if (!email) continue;
        try {
            await kv.delete('cust:' + email.toLowerCase().trim());
            await kv.delete('otp:' + email.toLowerCase().trim());
            deletedCount++;
        } catch (_) {}
    }

    // 3. Scan and delete all customer-related keys using kv.list if supported
    if (typeof kv.list === 'function') {
        const prefixes = ['cust:', 'custsess:', 'otp:', 'key_to_cust:'];
        for (const prefix of prefixes) {
            try {
                let cursor = undefined;
                do {
                    const res = await kv.list({ prefix, cursor, limit: 1000 });
                    if (res && Array.isArray(res.keys)) {
                        for (const k of res.keys) {
                            await kv.delete(k.name);
                            deletedCount++;
                        }
                    }
                    cursor = (res && !res.list_complete) ? res.cursor : undefined;
                } while (cursor);
            } catch (err) {
                console.error(`[Wipe] Error listing keys for prefix ${prefix}:`, err);
            }
        }
    }

    // 4. Reset customer index
    await kv.put('index:customers', JSON.stringify([]));

    // 5. Unbind customer_email from all licenses and remove any test keys
    try {
        const allLicenses = await getAllLicenses(env);
        for (const lic of allLicenses) {
            if (!lic || !lic.key) continue;
            let modified = false;
            if (lic.customer_email) {
                delete lic.customer_email;
                modified = true;
            }
            if (lic.key.startsWith('TEST-') || lic.key === 'TEST-55KF-NUSE-88TB') {
                await deleteLicense(env, lic.key);
                deletedCount++;
            } else if (modified) {
                await saveLicense(env, lic);
                deletedCount++;
            }
        }
    } catch (err) {
        console.error('[Wipe] Error unbinding customer licenses:', err);
    }

    return { success: true, count: deletedCount, storage: 'kv' };
}

async function getCustomer(env, email) {
    if (!email) return null;
    const key = 'cust:' + email.toLowerCase().trim();
    const kv = await getKv(env);
    if (kv) {
        return await kv.get(key, 'json');
    }
    if (!memoryStore.customers) memoryStore.customers = new Map();
    return memoryStore.customers.get(key) || null;
}

async function saveCustomer(env, customer) {
    const key = 'cust:' + customer.email.toLowerCase().trim();
    const kv = await getKv(env);
    if (kv) {
        await kv.put(key, JSON.stringify(customer));
        let list = [];
        try {
            list = (await kv.get('index:customers', 'json')) || [];
        } catch (_) {}
        if (!list.includes(customer.email.toLowerCase().trim())) {
            list.push(customer.email.toLowerCase().trim());
            await kv.put('index:customers', JSON.stringify(list));
        }
        return;
    }
    if (!memoryStore.customers) memoryStore.customers = new Map();
    memoryStore.customers.set(key, customer);
}

async function saveCustomerSession(env, token, data) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('custsess:' + token, JSON.stringify(data), { expirationTtl: 86400 * 14 }); // 14 days
        return;
    }
    if (!memoryStore.custSessions) memoryStore.custSessions = new Map();
    memoryStore.custSessions.set(token, data);
}

async function getCustomerSession(env, token) {
    if (!token) return null;
    const kv = await getKv(env);
    if (kv) {
        return await kv.get('custsess:' + token, 'json');
    }
    if (!memoryStore.custSessions) memoryStore.custSessions = new Map();
    return memoryStore.custSessions.get(token) || null;
}

async function deleteCustomerSession(env, token) {
    if (!token) return;
    const kv = await getKv(env);
    if (kv) {
        await kv.delete('custsess:' + token);
        return;
    }
    if (!memoryStore.custSessions) memoryStore.custSessions = new Map();
    memoryStore.custSessions.delete(token);
}

async function saveOtpRecord(env, email, data) {
    const kv = await getKv(env);
    const key = 'otp:' + email.toLowerCase().trim();
    if (kv) {
        await kv.put(key, JSON.stringify(data), { expirationTtl: 600 }); // 10 minutes
        return;
    }
    if (!memoryStore.otps) memoryStore.otps = new Map();
    memoryStore.otps.set(key, data);
}

async function getOtpRecord(env, email) {
    const kv = await getKv(env);
    const key = 'otp:' + email.toLowerCase().trim();
    if (kv) {
        return await kv.get(key, 'json');
    }
    if (!memoryStore.otps) memoryStore.otps = new Map();
    return memoryStore.otps.get(key) || null;
}

async function deleteOtpRecord(env, email) {
    const kv = await getKv(env);
    const key = 'otp:' + email.toLowerCase().trim();
    if (kv) {
        await kv.delete(key);
        return;
    }
    if (!memoryStore.otps) memoryStore.otps = new Map();
    memoryStore.otps.delete(key);
}

async function sendOtpEmail(env, toEmail, code, isReset = false) {
    const iconUrl = 'https://cdn.discordapp.com/attachments/1526175746169503854/1566118441050578995/Glossy_Purple_UD_Witch_Hat_Logo.png?ex=6ae760f5&is=6ae60f75&hm=08104390c4e5a763abf9eaa0f48733b84ef7f92f0d06bf7b0d84630bb103f257&';
    const title = isReset ? 'Password Reset Code' : 'Account Verification';
    const desc = isReset ? 'Use the 6-digit confirmation code below to reset your customer account password.' : 'Enter the 6-digit confirmation code below to finish setting up your account.';
    const subject = (isReset ? 'Your Password Reset Code: ' : 'Your Verification Code: ') + code;
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 32px 16px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 460px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <tr>
                <td style="padding: 40px 36px; text-align: center;">
                    <img src="${iconUrl}" width="56" height="56" alt="UDvengers" style="display: block; margin: 0 auto 16px auto; border-radius: 10px; border: 0;">
                    <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.02em;">${title}</h2>
                    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 28px 0;">${desc}</p>
                    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 0 auto 24px auto;">
                        <span style="font-family: 'SFMono-Regular', Consolas, Monaco, monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #005b7f; display: inline-block;">${code}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0 0 24px 0;">This code will expire in 10 minutes. If you did not make this request, you can safely ignore this email.</p>
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 18px;">
                        <span style="color: #94a3b8; font-size: 11px;">Protected by UDvengers Automated Infrastructure</span>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    // Read API keys from Environment or KV config
    const kv = await getKv(env);
    const resendKey = (env && env.RESEND_API_KEY) || (kv ? await kv.get('config:resend_api_key') : null) || DEFAULT_RESEND_KEY;
    const brevoKey = (env && env.BREVO_API_KEY) || (kv ? await kv.get('config:brevo_api_key') : null);

    // Persist resend key in KV config if not present
    if (kv) {
        try {
            const existing = await kv.get('config:resend_api_key');
            if (!existing) {
                await kv.put('config:resend_api_key', DEFAULT_RESEND_KEY);
            }
        } catch (_) {}
    }

    // 1. Try Resend API (https://resend.com)
    if (resendKey) {
        try {
            const customFrom = kv ? await kv.get('config:email_from') : null;
            let fromAddress = customFrom || 'UDvengers <auth@larpifyy.asia>';
            
            let resendRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + resendKey.trim(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: fromAddress,
                    to: [toEmail],
                    subject,
                    html
                })
            });

            // If 403 (domain unverified), fallback to onboarding@resend.dev
            if (!resendRes.ok && resendRes.status === 403 && fromAddress !== 'UDvengers <onboarding@resend.dev>') {
                console.log('[Resend] Custom domain unverified, falling back to onboarding@resend.dev...');
                fromAddress = 'UDvengers <onboarding@resend.dev>';
                resendRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + resendKey.trim(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: fromAddress,
                        to: [toEmail],
                        subject,
                        html
                    })
                });
            }

            if (resendRes.ok) {
                const resData = await resendRes.json();
                console.log(`[Resend] Successfully sent OTP to ${toEmail}, id: ${resData.id}`);
                return { ok: true, provider: 'resend', id: resData.id };
            } else {
                const errData = await resendRes.json().catch(() => ({}));
                const errMsg = errData.message || ('Resend status ' + resendRes.status);
                console.error(`[Resend Send Failed] Status ${resendRes.status}:`, errMsg);
                return { ok: false, error: errMsg, provider: 'resend' };
            }
        } catch (err) {
            console.error('[Resend Error]', err.message);
            return { ok: false, error: err.message, provider: 'resend' };
        }
    }

    // 2. Try Brevo API (https://brevo.com)
    if (brevoKey) {
        try {
            const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': brevoKey.trim(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: 'UDvengers', email: 'auth@larpifyy.asia' },
                    to: [{ email: toEmail }],
                    subject,
                    htmlContent: html
                })
            });
            if (brevoRes.ok) {
                console.log(`[Brevo] Successfully sent OTP to ${toEmail}`);
                return { ok: true, provider: 'brevo' };
            } else {
                const errText = await brevoRes.text();
                console.error(`[Brevo Send Failed] Status ${brevoRes.status}:`, errText);
                return { ok: false, error: errText, provider: 'brevo' };
            }
        } catch (err) {
            console.error('[Brevo Error]', err.message);
            return { ok: false, error: err.message, provider: 'brevo' };
        }
    }

    return { ok: false, error: 'No email delivery provider configured' };
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

// -------------------------------------------------------------
// OAUTH2 VERIFIED MEMBERS STORAGE & BACKUP HELPERS
// -------------------------------------------------------------
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function saveOAuthMember(env, member) {
    const kv = await getKv(env);
    if (kv) {
        await kv.put('oauth_member:' + member.user_id, JSON.stringify(member));
        let allIds = [];
        try {
            allIds = (await kv.get('index:oauth_members', 'json')) || [];
        } catch (e) {
            allIds = [];
        }
        if (!allIds.includes(member.user_id)) {
            allIds.push(member.user_id);
            await kv.put('index:oauth_members', JSON.stringify(allIds));
        }
        return;
    }
    if (!memoryStore.oauthMembers) memoryStore.oauthMembers = new Map();
    memoryStore.oauthMembers.set(member.user_id, member);
}

async function getOAuthMember(env, userId) {
    const kv = await getKv(env);
    if (kv) {
        try {
            return await kv.get('oauth_member:' + userId, 'json');
        } catch (e) {
            return null;
        }
    }
    if (!memoryStore.oauthMembers) memoryStore.oauthMembers = new Map();
    return memoryStore.oauthMembers.get(userId) || null;
}

async function getAllOAuthMembers(env) {
    const kv = await getKv(env);
    if (kv) {
        let allIds = [];
        try {
            allIds = (await kv.get('index:oauth_members', 'json')) || [];
        } catch (e) {
            allIds = [];
        }
        const members = [];
        for (const id of allIds) {
            try {
                const m = await kv.get('oauth_member:' + id, 'json');
                if (m && m.user_id) members.push(m);
            } catch (e) {}
        }
        return members.sort((a, b) => (b.verified_at || 0) - (a.verified_at || 0));
    }
    if (!memoryStore.oauthMembers) memoryStore.oauthMembers = new Map();
    return Array.from(memoryStore.oauthMembers.values()).sort((a, b) => (b.verified_at || 0) - (a.verified_at || 0));
}

function renderVerificationPage({ success, user, error }) {
    const avatarUrl = user?.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
    const username = user?.username ? escapeHtml(user.username) : 'Discord User';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${success ? 'Verification' : 'Verification Incomplete'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #070709;
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.18), transparent 50%),
                radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.1), transparent 40%);
        }
        .glass-card {
            background: rgba(18, 14, 26, 0.92);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(168, 85, 247, 0.28);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 50px rgba(168, 85, 247, 0.18);
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.06); opacity: 0.35; }
            100% { transform: scale(0.95); opacity: 0.8; }
        }
        .animate-ring {
            animation: pulse-ring 2s infinite ease-in-out;
        }
        @keyframes fillBarAnimation {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        .fill-bar-active {
            animation: fillBarAnimation 3000ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .fade-transition {
            transition: opacity 0.4s ease, transform 0.4s ease;
        }
    </style>
</head>
<body class="min-h-screen text-neutral-100 flex items-center justify-center p-4">
    <div class="glass-card w-full max-w-sm rounded-2xl p-7 text-center relative overflow-hidden">
        <!-- Ambient Top Glow -->
        <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-36 h-36 bg-purple-600/30 blur-2xl rounded-full pointer-events-none"></div>

        ${success ? `
        <!-- Loading State (Runs for exactly 3 Seconds) -->
        <div id="loadingBox" class="fade-transition">
            <div class="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
                <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-purple-400 animate-spin"></div>
                <div class="absolute inset-2 rounded-full bg-purple-500/10 animate-ring"></div>
                <svg class="w-8 h-8 text-purple-400 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
            </div>

            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/25 mb-3">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span> Synchronizing
            </div>

            <h1 class="text-lg font-bold text-white mb-1 tracking-tight">Authorizing Account</h1>
            <p id="stepLabel" class="text-xs text-neutral-400 mb-5">Verifying credentials with Discord...</p>

            <!-- Percentage Display -->
            <div class="flex items-center justify-between text-xs font-mono text-purple-300 font-semibold mb-2 px-1">
                <span class="text-neutral-400 font-normal">Progress</span>
                <span id="percentNumber">0%</span>
            </div>

            <!-- Visible Animated Progress Bar -->
            <div class="w-full bg-[#130f1e] rounded-full h-3 p-0.5 border border-purple-500/35 shadow-inner mb-4 overflow-hidden">
                <div id="progressBar" class="h-full rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-rose-400 fill-bar-active shadow-md shadow-purple-500/50" style="width: 0%;"></div>
            </div>

            <p class="text-[11px] text-neutral-500">Please do not close this window...</p>
        </div>

        <!-- Success State (Appears smoothly after 3s) -->
        <div id="successBox" class="fade-transition hidden opacity-0 translate-y-2">
            <div class="w-20 h-20 mx-auto mb-5 relative">
                <img src="${avatarUrl}" alt="${username}" class="w-20 h-20 rounded-full border-2 border-purple-500/50 shadow-lg object-cover">
                <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#120e1a]">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
            </div>

            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/25 mb-3">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified
            </div>

            <h1 class="text-lg font-bold text-white mb-1.5 tracking-tight">Welcome, ${username}</h1>
            <p class="text-neutral-400 text-xs leading-relaxed mb-5">
                Your Discord account has been authorized and your role has been assigned.
            </p>

            <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 mb-4 text-left flex items-center justify-between text-xs">
                <span class="text-neutral-300">Server Status</span>
                <span class="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Access Granted
                </span>
            </div>

            <p class="text-[11px] text-neutral-500">You may now close this browser window.</p>
        </div>

        <script>
            const startTime = performance.now();
            const duration = 3000;
            const bar = document.getElementById('progressBar');
            const num = document.getElementById('percentNumber');
            const stepLabel = document.getElementById('stepLabel');

            function tick(now) {
                const elapsed = now - startTime;
                const ratio = Math.min(1, elapsed / duration);
                const pct = Math.floor(ratio * 100);

                if (bar) bar.style.width = (ratio * 100) + '%';
                if (num) num.textContent = pct + '%';

                if (stepLabel) {
                    if (ratio > 0.7) {
                        stepLabel.textContent = 'Finalizing permissions...';
                    } else if (ratio > 0.35) {
                        stepLabel.textContent = 'Assigning server roles...';
                    }
                }

                if (ratio < 1) {
                    requestAnimationFrame(tick);
                } else {
                    if (bar) bar.style.width = '100%';
                    if (num) num.textContent = '100%';
                    revealSuccess();
                }
            }

            requestAnimationFrame(tick);

            function revealSuccess() {
                const loadingBox = document.getElementById('loadingBox');
                const successBox = document.getElementById('successBox');

                if (loadingBox && successBox) {
                    loadingBox.classList.add('opacity-0', '-translate-y-2');
                    setTimeout(() => {
                        loadingBox.classList.add('hidden');
                        successBox.classList.remove('hidden');
                        requestAnimationFrame(() => {
                            successBox.classList.remove('opacity-0', 'translate-y-2');
                            successBox.classList.add('opacity-100', 'translate-y-0');
                        });
                    }, 300);
                }
            }
        </script>
        ` : `
        <!-- Error State -->
        <div class="w-16 h-16 mx-auto mb-4 bg-rose-500/10 border border-rose-500/25 rounded-full flex items-center justify-center text-rose-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h1 class="text-lg font-bold text-white mb-2">Verification Incomplete</h1>
        <p class="text-neutral-400 text-xs mb-6">${error || 'Authorization was cancelled or expired. Please try again.'}</p>
        <a href="/verify" class="w-full inline-block py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition">
            Try Verification Again
        </a>
        `}
    </div>
</body>
</html>`;
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

        // Check Customer Authentication via Cookie or Bearer header
        const customerToken = (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '') || cookies['auth_customer_session'];
        const currentCustomer = await getCustomerSession(env, customerToken);

        // Check for one-time customer data wipe requested by admin
        const kv = await getKv(env);
        if (kv) {
            try {
                const wipeDone = await kv.get('flag:customer_wipe_executed_v3');
                if (!wipeDone) {
                    console.log('[Maintenance] Executing customer wipe requested by user...');
                    await wipeAllCustomerData(env);
                    await kv.put('flag:customer_wipe_executed_v3', 'done');
                    console.log('[Maintenance] Customer data wipe complete.');
                }
            } catch (wipeErr) {
                console.error('[Maintenance] Customer wipe error:', wipeErr);
            }
        }

        // Maintenance Wipe Endpoint (Can be triggered via secret or by authenticated owner)
        if (path === '/api/customer/maintenance-wipe' && (url.searchParams.get('secret') === 'udvengers_wipe_2026' || (currentAdmin && currentAdmin.discord_id === ALLOWED_DISCORD_ID))) {
            const wipeResult = await wipeAllCustomerData(env);
            if (kv) {
                await kv.put('flag:customer_wipe_executed_v3', 'done');
            }
            return jsonResponse({
                success: true,
                message: 'All customer data wiped successfully.',
                details: wipeResult
            });
        }

        // -------------------------------------------------------------
        // CUSTOMER PORTAL: /customer & /api/customer/*
        // -------------------------------------------------------------
        if (path === '/customer' || path === '/customer/') {
            return new Response(CUSTOMER_HTML, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html; charset=UTF-8',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    ...corsHeaders
                }
            });
        }

        // Customer: Request registration OTP code
        if (path === '/api/customer/register/request-code' && method === 'POST') {
            try {
                const body = await request.json();
                const email = (body.email || '').toLowerCase().trim();
                const password = body.password || '';
                const key = (body.key || '').toUpperCase().trim();
                const discordId = (body.discord_id || '').replace(/[^\d]/g, '').trim();

                if (!email || !email.includes('@') || !email.includes('.')) {
                    return jsonResponse({ success: false, message: 'Please provide a valid email address.' }, 400);
                }
                if (!discordId || discordId.length < 17 || discordId.length > 21) {
                    return jsonResponse({ success: false, message: 'Please provide a valid numeric Discord User ID (17-20 digits).' }, 400);
                }
                if (!password || password.length < 6) {
                    return jsonResponse({ success: false, message: 'Password must be at least 6 characters.' }, 400);
                }
                if (!key) {
                    return jsonResponse({ success: false, message: 'Please provide a license key.' }, 400);
                }

                // Verify license key exists and is valid
                const lic = await getLicense(env, key);
                if (!lic) {
                    return jsonResponse({ success: false, message: 'Invalid license key. Key does not exist.' }, 400);
                }
                if (lic.status === 'banned') {
                    return jsonResponse({ success: false, message: 'This license key has been revoked or banned.' }, 403);
                }

                // Check if key is already bound to another customer
                if (kv) {
                    const boundEmail = await kv.get('key_to_cust:' + key);
                    if (boundEmail && boundEmail.toLowerCase() !== email) {
                        return jsonResponse({ success: false, message: 'This license key is already registered to another account.' }, 400);
                    }
                }

                // Check if email already registered
                const existingCust = await getCustomer(env, email);
                if (existingCust) {
                    return jsonResponse({ success: false, message: 'An account with this email already exists. Please sign in.' }, 400);
                }

                // Generate 6-digit OTP code
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const salt = getRandomHex(16);
                const passwordHash = await hashPassword(password, salt);

                await saveOtpRecord(env, email, {
                    code: otp,
                    email,
                    password_hash: passwordHash,
                    salt,
                    key: lic.key,
                    discord_id: discordId,
                    created_at: Date.now()
                });

                // Attempt sending email via Resend
                const emailResult = await sendOtpEmail(env, email, otp);
                await addAuditLog(env, 'CUSTOMER_OTP_REQUESTED', ip, lic.key, `OTP for ${email}: ${otp} (Result: ${emailResult.ok ? 'sent' : 'failed'}${emailResult.error ? ' - ' + emailResult.error : ''})`);

                if (emailResult.ok) {
                    return jsonResponse({
                        success: true,
                        message: 'Verification code sent to ' + email + '. Please check your inbox and spam folder.'
                    });
                } else {
                    // If Resend failed due to testing restrictions (domain not yet verified on resend.com/domains)
                    if (emailResult.error && (emailResult.error.includes('resend.com/domains') || emailResult.error.includes('testing emails'))) {
                        return jsonResponse({
                            success: true,
                            message: `Verification code generated! (Note: Resend delivered code ${otp} as larpifyy.asia domain is not yet verified on resend.com/domains)`
                        });
                    }
                    return jsonResponse({
                        success: false,
                        message: 'Failed to dispatch email: ' + (emailResult.error || 'Mail delivery error')
                    }, 400);
                }
            } catch (err) {
                console.error('[Customer Request Code Error]', err);
                return jsonResponse({ success: false, message: 'Failed to process request: ' + err.message }, 500);
            }
        }

        // Customer: Verify code and create account
        if (path === '/api/customer/register/verify-code' && method === 'POST') {
            try {
                const body = await request.json();
                const email = (body.email || '').toLowerCase().trim();
                const code = (body.code || '').trim();

                const pending = await getOtpRecord(env, email);
                if (!pending) {
                    return jsonResponse({ success: false, message: 'Verification code expired or not found. Please request a new code.' }, 400);
                }

                if (String(pending.code).trim() !== code) {
                    return jsonResponse({ success: false, message: 'Invalid verification code. Please check your email.' }, 400);
                }

                // Create and save customer
                const customer = {
                    email: pending.email,
                    password_hash: pending.password_hash,
                    salt: pending.salt,
                    key: pending.key,
                    discord_id: pending.discord_id,
                    created_at: Date.now(),
                    last_login: Date.now(),
                    hwid_last_reset: 0
                };
                await saveCustomer(env, customer);

                if (kv) {
                    await kv.put('key_to_cust:' + pending.key, customer.email);
                }

                // Update license with customer email and Discord ID
                const lic = await getLicense(env, pending.key);
                if (lic) {
                    lic.customer_email = customer.email;
                    lic.discord_id = customer.discord_id;
                    if (!lic.activated_at) {
                        lic.activated_at = Date.now();
                        lic.expires_at = lic.duration_days === 0 ? null : Date.now() + (lic.duration_days * 86400000);
                    }
                    await saveLicense(env, lic);
                }

                // Assign Discord roles automatically
                if (customer.discord_id) {
                    try {
                        await assignDiscordRole(env, DISCORD_GUILD_ID, customer.discord_id, DISCORD_ROLE_CUSTOMER);
                        if (lic && (lic.duration_days === 0 || !lic.expires_at)) {
                            await assignDiscordRole(env, DISCORD_GUILD_ID, customer.discord_id, DISCORD_ROLE_LIFETIME);
                        }
                        await addAuditLog(env, 'DISCORD_ROLES_ASSIGNED', ip, pending.key, `User <@${customer.discord_id}> assigned roles via signup.`);
                    } catch (roleErr) {
                        console.error('[Role Assign Error]', roleErr);
                    }
                }

                // Delete used OTP
                await deleteOtpRecord(env, email);

                // Create session
                const sessionId = getRandomHex(32);
                await saveCustomerSession(env, sessionId, {
                    email: customer.email,
                    key: customer.key,
                    discord_id: customer.discord_id,
                    created_at: Date.now()
                });

                await addAuditLog(env, 'CUSTOMER_REGISTER_SUCCESS', ip, customer.key, `Customer registered: ${customer.email} (Discord: <@${customer.discord_id}>)`);

                const headers = new Headers();
                headers.set('Content-Type', 'application/json');
                headers.set('Set-Cookie', `auth_customer_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600`);

                return new Response(JSON.stringify({
                    success: true,
                    user: { email: customer.email, key: customer.key, discord_id: customer.discord_id }
                }), { status: 200, headers });
            } catch (err) {
                console.error('[Customer Verify Code Error]', err);
                return jsonResponse({ success: false, message: 'Failed to verify: ' + err.message }, 500);
            }
        }

        // Customer: Login
        if (path === '/api/customer/login' && method === 'POST') {
            try {
                const body = await request.json();
                const email = (body.email || '').toLowerCase().trim();
                const password = body.password || '';

                const customer = await getCustomer(env, email);
                if (!customer) {
                    return jsonResponse({ success: false, message: 'Invalid email or password.' }, 400);
                }

                const hash = await hashPassword(password, customer.salt);
                if (hash !== customer.password_hash) {
                    return jsonResponse({ success: false, message: 'Invalid email or password.' }, 400);
                }

                customer.last_login = Date.now();
                await saveCustomer(env, customer);

                const sessionId = getRandomHex(32);
                await saveCustomerSession(env, sessionId, {
                    email: customer.email,
                    key: customer.key,
                    created_at: Date.now()
                });

                await addAuditLog(env, 'CUSTOMER_LOGIN_SUCCESS', ip, customer.key, `Customer signed in: ${customer.email}`);

                const headers = new Headers();
                headers.set('Content-Type', 'application/json');
                headers.set('Set-Cookie', `auth_customer_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600`);

                return new Response(JSON.stringify({
                    success: true,
                    user: { email: customer.email, key: customer.key }
                }), { status: 200, headers });
            } catch (err) {
                console.error('[Customer Login Error]', err);
                return jsonResponse({ success: false, message: 'Login failed: ' + err.message }, 500);
            }
        }

        // Customer: Request Password Reset Code
        if (path === '/api/customer/password-reset/request-code' && method === 'POST') {
            try {
                const body = await request.json();
                const email = (body.email || '').toLowerCase().trim();

                if (!email || !email.includes('@')) {
                    return jsonResponse({ success: false, message: 'Please provide a valid email address.' }, 400);
                }

                const customer = await getCustomer(env, email);
                if (!customer) {
                    return jsonResponse({ success: false, message: 'No registered customer account found with that email.' }, 404);
                }

                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                await saveOtpRecord(env, 'reset:' + email, {
                    code: otp,
                    expires_at: Date.now() + 600000 // 10 minutes
                });

                const emailResult = await sendOtpEmail(env, email, otp, true);
                if (emailResult.ok) {
                    return jsonResponse({
                        success: true,
                        message: 'Password reset code sent to ' + email + '. Please check your inbox.'
                    });
                } else {
                    if (emailResult.error && (emailResult.error.includes('resend.com/domains') || emailResult.error.includes('testing emails'))) {
                        return jsonResponse({
                            success: true,
                            message: `Password reset code generated! (Note: Resend delivered code ${otp})`
                        });
                    }
                    return jsonResponse({
                        success: false,
                        message: 'Failed to send email: ' + (emailResult.error || 'Mail delivery error')
                    }, 400);
                }
            } catch (err) {
                console.error('[Customer Password Reset Request Error]', err);
                return jsonResponse({ success: false, message: 'Failed to process request: ' + err.message }, 500);
            }
        }

        // Customer: Verify Password Reset Code & Update Password
        if (path === '/api/customer/password-reset/verify' && method === 'POST') {
            try {
                const body = await request.json();
                const email = (body.email || '').toLowerCase().trim();
                const code = (body.code || '').trim();
                const newPassword = body.new_password || '';

                if (!email || !code) {
                    return jsonResponse({ success: false, message: 'Email and verification code are required.' }, 400);
                }
                if (!newPassword || newPassword.length < 6) {
                    return jsonResponse({ success: false, message: 'New password must be at least 6 characters.' }, 400);
                }

                const storedOtp = await getOtpRecord(env, 'reset:' + email);
                if (!storedOtp || storedOtp.code !== code) {
                    return jsonResponse({ success: false, message: 'Invalid or expired reset code.' }, 400);
                }
                if (Date.now() > storedOtp.expires_at) {
                    return jsonResponse({ success: false, message: 'Reset code has expired. Please request a new one.' }, 400);
                }

                const customer = await getCustomer(env, email);
                if (!customer) {
                    return jsonResponse({ success: false, message: 'Customer account not found.' }, 404);
                }

                const salt = getRandomHex(16);
                const passwordHash = await hashPassword(newPassword, salt);

                customer.salt = salt;
                customer.password_hash = passwordHash;
                customer.last_login = Date.now();
                await saveCustomer(env, customer);

                await deleteOtpRecord(env, 'reset:' + email);

                const sessionId = getRandomHex(32);
                await saveCustomerSession(env, sessionId, {
                    email: customer.email,
                    key: customer.key,
                    discord_id: customer.discord_id,
                    created_at: Date.now()
                });

                await addAuditLog(env, 'CUSTOMER_PASSWORD_RESET', ip, customer.key, `Password reset completed for ${customer.email}`);

                const headers = new Headers();
                headers.set('Content-Type', 'application/json');
                headers.set('Set-Cookie', `auth_customer_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600`);

                return new Response(JSON.stringify({
                    success: true,
                    message: 'Password reset successfully!'
                }), { status: 200, headers });
            } catch (err) {
                console.error('[Customer Password Reset Verify Error]', err);
                return jsonResponse({ success: false, message: 'Failed to reset password: ' + err.message }, 500);
            }
        }

        // Customer: Me (Portal Data)
        if (path === '/api/customer/me' && method === 'GET') {
            if (!currentCustomer) {
                return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
            }

            const lic = await getLicense(env, currentCustomer.key);
            const loaderEnabled = await isLoaderEnabled(env);
            const now = Date.now();
            const isExpired = lic ? (Boolean(lic.expires_at && lic.expires_at <= now) || lic.status === 'expired') : true;

            return jsonResponse({
                success: true,
                customer: {
                    email: currentCustomer.email,
                    discord_id: currentCustomer.discord_id || (lic ? lic.discord_id : null),
                    created_at: currentCustomer.created_at
                },
                license: lic ? {
                    key: lic.key,
                    status: lic.status,
                    duration_days: lic.duration_days,
                    expires_at: lic.expires_at,
                    hwid: lic.hwid,
                    hwid_last_reset: lic.hwid_last_reset,
                    discord_id: lic.discord_id,
                    is_expired: isExpired
                } : { key: currentCustomer.key, status: 'expired', duration_days: 0, is_expired: true },
                loader: {
                    enabled: loaderEnabled,
                    status: loaderEnabled ? 'Undetected' : 'Updating'
                }
            });
        }

        // Customer: Renew Expired License
        if (path === '/api/customer/renew-license' && method === 'POST') {
            if (!currentCustomer) {
                return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
            }

            try {
                const body = await request.json();
                const newKey = (body.key || '').trim().toUpperCase();

                if (!newKey) {
                    return jsonResponse({ success: false, message: 'Please enter your new license key.' }, 400);
                }

                // Verify new license exists
                const newLic = await getLicense(env, newKey);
                if (!newLic) {
                    return jsonResponse({ success: false, message: 'Invalid license key. Key does not exist.' }, 400);
                }

                if (newLic.status === 'banned') {
                    return jsonResponse({ success: false, message: 'This license key has been revoked or banned.' }, 403);
                }

                const now = Date.now();
                if (newLic.expires_at && newLic.expires_at <= now) {
                    return jsonResponse({ success: false, message: 'This license key has already expired.' }, 400);
                }

                // Check if key is already registered to another account
                if (kv) {
                    const boundEmail = await kv.get('key_to_cust:' + newKey);
                    if (boundEmail && boundEmail.toLowerCase() !== currentCustomer.email.toLowerCase()) {
                        return jsonResponse({ success: false, message: 'This license key is already registered to another account.' }, 400);
                    }
                }

                const oldKey = currentCustomer.key;

                // Update customer record with new key
                currentCustomer.key = newLic.key;
                await saveCustomer(env, currentCustomer);

                // Update KV binding
                if (kv) {
                    await kv.put('key_to_cust:' + newLic.key, currentCustomer.email);
                }

                // Activate new license for this customer
                newLic.customer_email = currentCustomer.email;
                newLic.discord_id = currentCustomer.discord_id;
                newLic.status = 'active';
                if (!newLic.activated_at) {
                    newLic.activated_at = now;
                    newLic.expires_at = newLic.duration_days === 0 ? null : now + (newLic.duration_days * 86400000);
                }
                await saveLicense(env, newLic);

                // Update session
                if (customerToken) {
                    await saveCustomerSession(env, customerToken, {
                        email: currentCustomer.email,
                        key: newLic.key,
                        discord_id: currentCustomer.discord_id,
                        created_at: Date.now()
                    });
                }

                // Update Discord roles
                if (currentCustomer.discord_id) {
                    try {
                        await assignDiscordRole(env, DISCORD_GUILD_ID, currentCustomer.discord_id, DISCORD_ROLE_CUSTOMER);
                        if (newLic.duration_days === 0 || !newLic.expires_at) {
                            await assignDiscordRole(env, DISCORD_GUILD_ID, currentCustomer.discord_id, DISCORD_ROLE_LIFETIME);
                        }
                    } catch (e) {
                        console.error('[Discord role error on renewal]', e);
                    }
                }

                await addAuditLog(env, 'CUSTOMER_LICENSE_RENEWED', ip, newLic.key, `Customer ${currentCustomer.email} renewed license. Old key: ${oldKey}`);

                return jsonResponse({
                    success: true,
                    message: 'License successfully activated! Access restored.',
                    license: newLic
                });
            } catch (err) {
                console.error('[Customer Renew License Error]', err);
                return jsonResponse({ success: false, message: 'Failed to renew license: ' + err.message }, 500);
            }
        }

        // Customer: Reset HWID directly
        if (path === '/api/customer/hwid-reset' && method === 'POST') {
            if (!currentCustomer) {
                return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
            }

            const lic = await getLicense(env, currentCustomer.key);
            if (!lic) {
                return jsonResponse({ success: false, message: 'License not found.' }, 404);
            }

            const lastReset = lic.hwid_last_reset || 0;
            const COOLDOWN_MS = 24 * 60 * 60 * 1000;
            const now = Date.now();

            if (now - lastReset < COOLDOWN_MS) {
                const waitHours = Math.ceil((COOLDOWN_MS - (now - lastReset)) / (60 * 60 * 1000));
                return jsonResponse({ success: false, message: `HWID reset on cooldown. Please wait ${waitHours} more hours.` }, 400);
            }

            lic.hwid = null;
            lic.hwid_last_reset = now;
            await saveLicense(env, lic);

            await addAuditLog(env, 'CUSTOMER_HWID_RESET', ip, lic.key, `HWID reset by customer: ${currentCustomer.email}`);

            return jsonResponse({ success: true, message: 'HWID successfully reset. You can now launch on your new hardware.' });
        }

        // Customer: Logout
        if (path === '/api/customer/logout' && method === 'POST') {
            if (customerToken) {
                await deleteCustomerSession(env, customerToken);
            }
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');
            headers.set('Set-Cookie', `auth_customer_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
            return new Response(JSON.stringify({ success: true }), { status: 200, headers });
        }

        // -------------------------------------------------------------
        // VERIFICATION PORTAL: /verify & /api/verify/callback
        // -------------------------------------------------------------
        if (path === '/verify') {
            const verifyRedirectUri = `${hostOrigin}/api/verify/callback`;
            const verifyOAuthUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(verifyRedirectUri)}&scope=identify%20guilds.join&prompt=consent`;
            // Direct 302 redirect: zero loading screen before authorization
            return Response.redirect(verifyOAuthUrl, 302);
        }

        if (path === '/api/verify/callback') {
            const errorParam = url.searchParams.get('error');
            const errorDesc = url.searchParams.get('error_description');
            if (errorParam) {
                return new Response(renderVerificationPage({
                    success: false,
                    error: errorDesc || 'Discord authorization was rejected or cancelled.'
                }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            }

            const code = url.searchParams.get('code');
            if (!code) {
                return new Response(renderVerificationPage({
                    success: false,
                    error: 'Missing authorization code from Discord.'
                }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            }

            try {
                const verifyRedirectUri = `${hostOrigin}/api/verify/callback`;
                const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: DISCORD_CLIENT_ID,
                        client_secret: DISCORD_CLIENT_SECRET,
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: verifyRedirectUri
                    })
                });

                if (!tokenResponse.ok) {
                    const errText = await tokenResponse.text();
                    console.error('[OAuth Token Exchange Error]', errText);
                    return new Response(renderVerificationPage({
                        success: false,
                        error: 'Failed to exchange authorization token with Discord. Please try again.'
                    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
                }

                const tokenData = await tokenResponse.json();

                // Fetch User Details
                const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
                    headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
                });

                if (!userResponse.ok) {
                    return new Response(renderVerificationPage({
                        success: false,
                        error: 'Could not fetch your Discord user details.'
                    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
                }

                const discordUser = await userResponse.json();

                // Save authorized member record for server migration / backups
                const memberRecord = {
                    user_id: discordUser.id,
                    username: `${discordUser.username}${discordUser.discriminator && discordUser.discriminator !== '0' ? '#' + discordUser.discriminator : ''}`,
                    global_name: discordUser.global_name || discordUser.username,
                    avatar: discordUser.avatar,
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    expires_at: Date.now() + (tokenData.expires_in * 1000),
                    scope: tokenData.scope,
                    verified_at: Date.now(),
                    guild_id: DISCORD_GUILD_ID,
                    ip
                };
                await saveOAuthMember(env, memberRecord);

                // Assign Verified Role (1550780294896812174) in Server (1549785920490971187)
                const botToken = getBotToken(env);
                let roleAssigned = false;

                // 1. Try assigning role to existing guild member
                const roleRes = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordUser.id}/roles/${DISCORD_ROLE_VERIFIED}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bot ${botToken}`,
                        'X-Audit-Log-Reason': 'Member verified via web portal'
                    }
                });

                if (roleRes.ok) {
                    roleAssigned = true;
                } else if (roleRes.status === 404) {
                    // Not currently in guild -> Add user to guild with verified role using guilds.join access_token
                    const joinRes = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordUser.id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bot ${botToken}`,
                            'Content-Type': 'application/json',
                            'X-Audit-Log-Reason': 'Joined and verified via web portal'
                        },
                        body: JSON.stringify({
                            access_token: tokenData.access_token,
                            roles: [DISCORD_ROLE_VERIFIED]
                        })
                    });
                    if (joinRes.ok) roleAssigned = true;
                }

                await addAuditLog(env, 'MEMBER_VERIFIED', ip, discordUser.username, `User ${discordUser.id} verified, role assigned: ${roleAssigned}`);

                return new Response(renderVerificationPage({
                    success: true,
                    user: discordUser
                }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

            } catch (err) {
                console.error('[Verify Callback Error]', err);
                return new Response(renderVerificationPage({
                    success: false,
                    error: err.message || 'An unexpected verification error occurred.'
                }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            }
        }

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
                    const authorizedMembers = await getAllOAuthMembers(env);

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
                        stats: { total, active, banned, cracks: crackingAttempts.length, authorized_members: authorizedMembers.length, payloadLoaded: true }
                    });
                } catch (err) {
                    console.error('Error serving admin overview:', err);
                    return jsonResponse({
                        success: false,
                        error: 'Failed to load dashboard data: ' + err.message
                    }, 500);
                }
            }

            if (path === '/api/admin/members' && method === 'GET') {
                try {
                    const members = await getAllOAuthMembers(env);
                    return jsonResponse({
                        success: true,
                        total: members.length,
                        members: members.map(m => ({
                            user_id: m.user_id,
                            username: m.username,
                            global_name: m.global_name,
                            avatar: m.avatar,
                            verified_at: m.verified_at,
                            expired: Date.now() > (m.expires_at || 0)
                        }))
                    });
                } catch (e) {
                    return jsonResponse({ success: false, error: e.message }, 500);
                }
            }

            if (path === '/api/admin/members/pull' && method === 'POST') {
                try {
                    const body = await request.json().catch(() => ({}));
                    const targetGuildId = String(body.new_guild_id || body.guild_id || '').trim();
                    if (!targetGuildId) {
                        return jsonResponse({ success: false, error: 'Target Server (Guild) ID is required.' }, 400);
                    }

                    const members = await getAllOAuthMembers(env);
                    if (members.length === 0) {
                        return jsonResponse({ success: false, error: 'No authorized members found in database.' }, 400);
                    }

                    const botToken = getBotToken(env);
                    let successCount = 0;
                    let failedCount = 0;
                    const details = [];

                    for (const member of members) {
                        try {
                            let token = member.access_token;
                            // Refresh token if close to expiry
                            if (Date.now() >= (member.expires_at || 0) - 60000 && member.refresh_token) {
                                try {
                                    const refRes = await fetch('https://discord.com/api/v10/oauth2/token', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                        body: new URLSearchParams({
                                            client_id: DISCORD_CLIENT_ID,
                                            client_secret: DISCORD_CLIENT_SECRET,
                                            grant_type: 'refresh_token',
                                            refresh_token: member.refresh_token
                                        })
                                    });
                                    if (refRes.ok) {
                                        const refData = await refRes.json();
                                        token = refData.access_token;
                                        member.access_token = refData.access_token;
                                        member.refresh_token = refData.refresh_token || member.refresh_token;
                                        member.expires_at = Date.now() + (refData.expires_in * 1000);
                                        await saveOAuthMember(env, member);
                                    }
                                } catch (e) {
                                    console.error('Token refresh error:', e);
                                }
                            }

                            // Add member to new guild
                            const addRes = await fetch(`https://discord.com/api/v10/guilds/${targetGuildId}/members/${member.user_id}`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bot ${botToken}`,
                                    'Content-Type': 'application/json',
                                    'X-Audit-Log-Reason': 'Server restore & member migration'
                                },
                                body: JSON.stringify({
                                    access_token: token
                                })
                            });

                            if (addRes.status === 201 || addRes.status === 204) {
                                successCount++;
                                details.push({ user_id: member.user_id, username: member.username, status: addRes.status === 201 ? 'added' : 'already_member' });
                            } else {
                                failedCount++;
                                const errText = await addRes.text();
                                details.push({ user_id: member.user_id, username: member.username, status: 'failed', code: addRes.status, detail: errText });
                            }
                        } catch (mErr) {
                            failedCount++;
                            details.push({ user_id: member.user_id, status: 'error', error: mErr.message });
                        }
                    }

                    await addAuditLog(env, 'MEMBERS_PULLED', ip, '', `Target Guild: ${targetGuildId}, Success: ${successCount}, Failed: ${failedCount}`);

                    return jsonResponse({
                        success: true,
                        total: members.length,
                        pulled: successCount,
                        failed: failedCount,
                        details: details.slice(0, 50)
                    });
                } catch (err) {
                    return jsonResponse({ success: false, error: err.message }, 500);
                }
            }

            if (path === '/api/admin/clear-cracks' && method === 'POST') {
                await clearCrackingAttempts(env);
                await addAuditLog(env, 'CRACKING_LOGS_CLEARED', ip, '', 'Cracking attempts feed cleared by Discord Owner');
                return jsonResponse({ success: true });
            }

            if (path === '/api/admin/set-email-key' && method === 'POST') {
                const body = (await request.json().catch(() => ({}))) || {};
                const kv = await getKv(env);
                if (kv) {
                    if (body.resend_key !== undefined) {
                        if (body.resend_key) await kv.put('config:resend_api_key', body.resend_key.trim());
                        else await kv.delete('config:resend_api_key');
                    }
                    if (body.brevo_key !== undefined) {
                        if (body.brevo_key) await kv.put('config:brevo_api_key', body.brevo_key.trim());
                        else await kv.delete('config:brevo_api_key');
                    }
                    if (body.from_email !== undefined) {
                        if (body.from_email) await kv.put('config:email_from', body.from_email.trim());
                        else await kv.delete('config:email_from');
                    }
                }
                await addAuditLog(env, 'EMAIL_CONFIG_UPDATED', ip, '', 'Transactional email credentials updated by Owner');
                return jsonResponse({ success: true, message: 'Email configuration saved successfully.' });
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

            if (path === '/api/admin/customer/wipe-all' && method === 'POST') {
                const wipeResult = await wipeAllCustomerData(env);
                if (kv) {
                    await kv.put('flag:customer_wipe_executed_v2', 'done');
                }
                await addAuditLog(env, 'ADMIN_CUSTOMER_WIPE', ip, null, `All customer accounts and sessions purged by owner.`);
                return jsonResponse({
                    success: true,
                    message: 'All customer data and sessions purged successfully.',
                    details: wipeResult
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
