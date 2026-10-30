export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #09090b; color: #f4f4f5; }
        .font-mono { font-family: 'Geist Mono', monospace; }
        .border-subtle { border-color: #27272a; }
        .bg-card { background-color: #0c0c0e; }
        .bg-hover:hover { background-color: #141417; }
    </style>
</head>
<body class="min-h-screen flex flex-col antialiased selection:bg-neutral-800 selection:text-white">

    <!-- TOP HEADER -->
    <header class="border-b border-subtle bg-[#09090b] sticky top-0 z-40">
        <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <span class="font-semibold tracking-tight text-sm text-neutral-100">Authentication</span>
            </div>

            <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2 pl-2 pr-3 py-1 bg-neutral-900 border border-subtle rounded-full text-xs text-neutral-400">
                    <img id="adminAvatar" src="https://cdn.discordapp.com/embed/avatars/0.png" class="w-4 h-4 rounded-full">
                    <span id="adminUsername" class="text-neutral-200 font-medium">Owner</span>
                </div>

                <button onclick="openModal('generateModal')" class="h-8 px-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition duration-150 flex items-center space-x-1.5 shadow-sm">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    <span>Create Key</span>
                </button>

                <a href="/api/admin/logout" class="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent hover:border-subtle rounded-lg transition" title="Log out">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                </a>
            </div>
        </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-6">

        <!-- METRICS ROW (3 Cards: Total, Active, Banned) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="bg-card border border-subtle rounded-xl p-4">
                <div class="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1">Total Licenses</div>
                <div id="statTotal" class="text-2xl font-bold font-mono tracking-tight text-neutral-100">0</div>
            </div>
            <div class="bg-card border border-subtle rounded-xl p-4">
                <div class="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1">Active Subscriptions</div>
                <div id="statActive" class="text-2xl font-bold font-mono tracking-tight text-emerald-400">0</div>
            </div>
            <div class="bg-card border border-subtle rounded-xl p-4">
                <div class="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1">Banned Users</div>
                <div id="statBanned" class="text-2xl font-bold font-mono tracking-tight text-rose-400">0</div>
            </div>
        </div>

        <!-- CONTROLS & FILTER BAR -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <!-- TABS -->
            <div class="inline-flex p-1 bg-neutral-900 border border-subtle rounded-lg self-start">
                <button onclick="switchTab('keys')" id="tabBtnKeys" class="px-3 py-1 rounded-md text-xs font-medium bg-neutral-800 text-white transition">
                    Licenses
                </button>
                <button onclick="switchTab('logs')" id="tabBtnLogs" class="px-3 py-1 rounded-md text-xs font-medium text-neutral-400 hover:text-white transition">
                    Audit Logs
                </button>
            </div>

            <!-- SEARCH -->
            <div class="relative w-full sm:w-64">
                <svg class="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" id="searchInput" oninput="filterLicenses()" placeholder="Search key, HWID, note..."
                    class="w-full h-8 pl-8 pr-3 bg-neutral-900 border border-subtle rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition">
            </div>
        </div>

        <!-- TAB 1: LICENSES TABLE -->
        <div id="tabKeys" class="bg-card border border-subtle rounded-xl overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="border-b border-subtle bg-neutral-950/60 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                            <th class="py-3 px-4">License Key</th>
                            <th class="py-3 px-4">Duration</th>
                            <th class="py-3 px-4">HWID</th>
                            <th class="py-3 px-4">Expires</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4">Note</th>
                            <th class="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="licenseTableBody" class="divide-y divide-neutral-900 font-mono">
                        <!-- Dynamic Rows -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- TAB 2: AUDIT LOGS -->
        <div id="tabLogs" class="hidden bg-card border border-subtle rounded-xl overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="border-b border-subtle bg-neutral-950/60 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                            <th class="py-3 px-4">Timestamp</th>
                            <th class="py-3 px-4">Event</th>
                            <th class="py-3 px-4">IP</th>
                            <th class="py-3 px-4">Key</th>
                            <th class="py-3 px-4">Details</th>
                        </tr>
                    </thead>
                    <tbody id="logsTableBody" class="divide-y divide-neutral-900 font-mono">
                        <!-- Dynamic Rows -->
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <!-- MODAL: GENERATE KEYS -->
    <div id="generateModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div class="bg-card w-full max-w-md p-5 rounded-xl border border-subtle shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-subtle">
                <h3 class="text-sm font-semibold text-neutral-100">Create Licenses</h3>
                <button onclick="closeModal('generateModal')" class="text-neutral-500 hover:text-neutral-300">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <form id="genForm" class="space-y-3.5">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1">Duration</label>
                        <select id="genDuration" class="w-full h-9 px-3 bg-neutral-900 border border-subtle rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-neutral-500">
                            <option value="1">1 Day</option>
                            <option value="3">3 Days</option>
                            <option value="7" selected>7 Days</option>
                            <option value="30">30 Days</option>
                            <option value="90">90 Days</option>
                            <option value="0">Lifetime</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1">Prefix</label>
                        <input type="text" id="genPrefix" value="VIP" maxlength="6"
                            class="w-full h-9 px-3 bg-neutral-900 border border-subtle rounded-lg text-xs font-mono uppercase text-neutral-200 focus:outline-none focus:border-neutral-500">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1">Quantity</label>
                        <input type="number" id="genCount" value="1" min="1" max="50"
                            class="w-full h-9 px-3 bg-neutral-900 border border-subtle rounded-lg text-xs font-mono text-neutral-200 focus:outline-none focus:border-neutral-500">
                    </div>
                    <div>
                        <label class="block text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1">Note (Optional)</label>
                        <input type="text" id="genNote" placeholder="e.g. buyer tag"
                            class="w-full h-9 px-3 bg-neutral-900 border border-subtle rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-neutral-500">
                    </div>
                </div>
                <div class="pt-2">
                    <button type="submit" class="w-full h-9 bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg text-xs transition duration-150 shadow-sm">
                        Generate
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL: RESULT KEYS -->
    <div id="resultModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div class="bg-card w-full max-w-md p-5 rounded-xl border border-subtle shadow-2xl space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-subtle">
                <h3 class="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>Keys Created</span>
                </h3>
                <button onclick="closeModal('resultModal')" class="text-neutral-500 hover:text-neutral-300">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <textarea id="resultKeys" readonly rows="5" class="w-full p-2.5 bg-neutral-900 border border-subtle rounded-lg font-mono text-xs text-neutral-200 focus:outline-none select-all"></textarea>
            <div class="flex justify-end space-x-2 pt-1">
                <button onclick="copyGeneratedKeys()" class="h-8 px-3 bg-neutral-100 hover:bg-white text-black font-semibold rounded-lg text-xs transition">
                    Copy All
                </button>
                <button onclick="closeModal('resultModal')" class="h-8 px-3 border border-subtle hover:bg-neutral-900 text-neutral-300 rounded-lg text-xs transition">
                    Done
                </button>
            </div>
        </div>
    </div>

    <script>
        let allLicenses = [];

        function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
        function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

        async function api(path, opts = {}) {
            opts.headers = opts.headers || {};
            opts.headers['Content-Type'] = 'application/json';
            const res = await fetch(path, opts);
            if (res.status === 401) {
                window.location.href = 'https://larpifyy.asia/';
                return { success: false };
            }
            return res.json();
        }

        async function loadDashboard() {
            const data = await api('/api/admin/overview');
            if (!data || !data.success) return;

            if (data.user) {
                document.getElementById('adminUsername').textContent = data.user.username;
                if (data.user.avatar) {
                    document.getElementById('adminAvatar').src = data.user.avatar;
                }
            }

            allLicenses = data.licenses || [];
            renderLicenses(allLicenses);
            renderLogs(data.logs || []);

            document.getElementById('statTotal').textContent = data.stats.total;
            document.getElementById('statActive').textContent = data.stats.active;
            document.getElementById('statBanned').textContent = data.stats.banned;
        }

        function renderLicenses(licenses) {
            const tbody = document.getElementById('licenseTableBody');
            tbody.innerHTML = '';
            licenses.forEach(lic => {
                const tr = document.createElement('tr');
                tr.className = 'bg-hover transition duration-100';

                const isLocked = !!lic.hwid;
                const hwidCell = isLocked 
                    ? \`<span class="text-neutral-400 select-all" title="\${lic.hwid}">\${lic.hwid.substring(0, 8)}...</span>\`
                    : \`<span class="text-neutral-600">Unbound</span>\`;

                let statusBadge = '';
                if (lic.status === 'banned') statusBadge = '<span class="inline-flex items-center text-rose-400 font-sans"><span class="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>Banned</span>';
                else if (lic.expires_at && lic.expires_at < Date.now()) statusBadge = '<span class="inline-flex items-center text-amber-400 font-sans"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>Expired</span>';
                else statusBadge = '<span class="inline-flex items-center text-emerald-400 font-sans"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>Active</span>';

                let expiresStr = 'Not Activated';
                if (lic.duration_days === 0) expiresStr = 'Lifetime';
                else if (lic.expires_at) expiresStr = new Date(lic.expires_at).toLocaleDateString();

                tr.innerHTML = \`
                    <td class="py-2.5 px-4 font-semibold text-neutral-200 select-all tracking-tight">\${lic.key}</td>
                    <td class="py-2.5 px-4 text-neutral-400 font-sans">\${lic.duration_days === 0 ? 'Lifetime' : lic.duration_days + 'd'}</td>
                    <td class="py-2.5 px-4">\${hwidCell}</td>
                    <td class="py-2.5 px-4 text-neutral-400 font-sans">\${expiresStr}</td>
                    <td class="py-2.5 px-4">\${statusBadge}</td>
                    <td class="py-2.5 px-4 text-neutral-500 font-sans">\${lic.note || '-'}</td>
                    <td class="py-2.5 px-4 text-right space-x-1 font-sans">
                        \${isLocked ? \`<button onclick="resetHwid('\${lic.key}')" class="px-2 py-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200 transition" title="Reset HWID"><svg class="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5"/></svg></button>\` : ''}
                        <button onclick="toggleBan('\${lic.key}', '\${lic.status}')" class="px-2 py-1 hover:bg-neutral-800 rounded \${lic.status === 'banned' ? 'text-emerald-400' : 'text-neutral-400 hover:text-amber-400'} transition" title="\${lic.status === 'banned' ? 'Unban' : 'Ban'}">
                            <svg class="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                        </button>
                        <button onclick="deleteKey('\${lic.key}')" class="px-2 py-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-rose-400 transition" title="Delete">
                            <svg class="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </td>
                \`;
                tbody.appendChild(tr);
            });
        }

        function renderLogs(logs) {
            const tbody = document.getElementById('logsTableBody');
            tbody.innerHTML = '';
            logs.forEach(l => {
                const tr = document.createElement('tr');
                tr.className = 'bg-hover transition duration-100';
                const isFail = l.event.includes('FAIL') || l.event.includes('MISMATCH') || l.event.includes('BAN') || l.event.includes('BLOCKED');
                tr.innerHTML = \`
                    <td class="py-2.5 px-4 text-neutral-500 font-sans">\${new Date(l.timestamp).toLocaleTimeString()}</td>
                    <td class="py-2.5 px-4 font-medium \${isFail ? 'text-rose-400' : 'text-emerald-400'}">\${l.event}</td>
                    <td class="py-2.5 px-4 text-neutral-500">\${l.ip || '-'}</td>
                    <td class="py-2.5 px-4 text-neutral-300">\${l.key || '-'}</td>
                    <td class="py-2.5 px-4 text-neutral-500 font-sans">\${l.details || ''}</td>
                \`;
                tbody.appendChild(tr);
            });
        }

        function filterLicenses() {
            const q = document.getElementById('searchInput').value.toLowerCase();
            const filtered = allLicenses.filter(l => 
                l.key.toLowerCase().includes(q) || 
                (l.hwid && l.hwid.toLowerCase().includes(q)) || 
                (l.note && l.note.toLowerCase().includes(q))
            );
            renderLicenses(filtered);
        }

        function switchTab(t) {
            if (t === 'keys') {
                document.getElementById('tabKeys').classList.remove('hidden');
                document.getElementById('tabLogs').classList.add('hidden');
                document.getElementById('tabBtnKeys').className = 'px-3 py-1 rounded-md text-xs font-medium bg-neutral-800 text-white transition';
                document.getElementById('tabBtnLogs').className = 'px-3 py-1 rounded-md text-xs font-medium text-neutral-400 hover:text-white transition';
            } else {
                document.getElementById('tabKeys').classList.add('hidden');
                document.getElementById('tabLogs').classList.remove('hidden');
                document.getElementById('tabBtnLogs').className = 'px-3 py-1 rounded-md text-xs font-medium bg-neutral-800 text-white transition';
                document.getElementById('tabBtnKeys').className = 'px-3 py-1 rounded-md text-xs font-medium text-neutral-400 hover:text-white transition';
            }
        }

        async function resetHwid(key) {
            if (!confirm(\`Reset HWID for key \${key}?\`)) return;
            await api('/api/admin/reset-hwid', { method: 'POST', body: JSON.stringify({ key }) });
            loadDashboard();
        }

        async function toggleBan(key, currentStatus) {
            const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
            await api('/api/admin/set-status', { method: 'POST', body: JSON.stringify({ key, status: newStatus }) });
            loadDashboard();
        }

        async function deleteKey(key) {
            if (!confirm(\`Delete key \${key}?\`)) return;
            await api('/api/admin/delete-key', { method: 'POST', body: JSON.stringify({ key }) });
            loadDashboard();
        }

        document.getElementById('genForm').onsubmit = async (e) => {
            e.preventDefault();
            const duration = parseInt(document.getElementById('genDuration').value);
            const prefix = document.getElementById('genPrefix').value;
            const count = parseInt(document.getElementById('genCount').value);
            const note = document.getElementById('genNote').value;

            const res = await api('/api/admin/generate-keys', {
                method: 'POST',
                body: JSON.stringify({ duration_days: duration, prefix, count, note })
            });

            if (res && res.success) {
                closeModal('generateModal');
                document.getElementById('resultKeys').value = res.keys.join('\\n');
                openModal('resultModal');
                loadDashboard();
            }
        };

        function copyGeneratedKeys() {
            const ta = document.getElementById('resultKeys');
            ta.select();
            navigator.clipboard.writeText(ta.value);
        }

        window.addEventListener('DOMContentLoaded', loadDashboard);
    </script>
</body>
</html>
`;
