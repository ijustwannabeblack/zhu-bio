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
        
        .custom-scrollbar::-webkit-scrollbar {
            height: 5px;
            width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #27272a;
            border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #3f3f46;
        }
    </style>
</head>
<body class="min-h-screen flex antialiased selection:bg-neutral-800 selection:text-white">

    <!-- MOBILE SIDEBAR BACKDROP -->
    <div id="sidebarBackdrop" onclick="toggleSidebar(false)" class="hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"></div>

    <!-- LEFT SIDEBAR -->
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-60 bg-[#09090b] border-r border-subtle flex flex-col justify-between transition-transform duration-200 -translate-x-full lg:translate-x-0 lg:static shrink-0 select-none">
        
        <div class="flex flex-col h-full">
            <!-- BRAND HEADER -->
            <div class="h-14 px-5 border-b border-subtle flex items-center justify-between shrink-0">
                <span class="font-bold tracking-tight text-sm text-neutral-100">Authentication</span>
                <button onclick="toggleSidebar(false)" class="lg:hidden text-neutral-400 hover:text-white p-1">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
            </div>

            <!-- TABS LIST -->
            <nav class="p-3 space-y-1 flex-1">
                <button onclick="switchTab('keys')" id="tabBtnKeys" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-neutral-800 text-white transition">
                    <div class="flex items-center space-x-2.5">
                        <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
                        <span>Licenses</span>
                    </div>
                    <span id="sidebarLicenseCount" class="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-subtle">0</span>
                </button>

                <button onclick="switchTab('logs')" id="tabBtnLogs" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 transition">
                    <div class="flex items-center space-x-2.5">
                        <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                        <span>Audit Logs</span>
                    </div>
                </button>

                <button onclick="switchTab('threats')" id="tabBtnThreats" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-rose-300 hover:bg-neutral-900 transition">
                    <div class="flex items-center space-x-2.5">
                        <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                        <span>Cracking Attempts</span>
                    </div>
                    <span id="threatCountBadge" class="hidden px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full text-[10px] font-bold font-mono">0</span>
                </button>

                <button onclick="switchTab('loader')" id="tabBtnLoader" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 transition">
                    <div class="flex items-center space-x-2.5">
                        <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10"/></svg>
                        <span>Loader Control</span>
                    </div>
                    <span id="sidebarLoaderDot" class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                </button>
            </nav>

            <!-- SIDEBAR FOOTER: USER & LOGOUT -->
            <div class="p-3 border-t border-subtle shrink-0">
                <div class="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-subtle">
                    <div class="flex items-center space-x-2 min-w-0">
                        <img id="adminAvatar" src="https://cdn.discordapp.com/embed/avatars/0.png" class="w-6 h-6 rounded-full shrink-0">
                        <span id="adminUsername" class="text-neutral-200 font-medium text-xs truncate">Owner</span>
                    </div>
                    <a href="/api/admin/logout" class="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition" title="Log out">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    </a>
                </div>
            </div>
        </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 min-w-0 flex flex-col min-h-screen">
        
        <!-- MOBILE TOP BAR -->
        <header class="lg:hidden h-14 border-b border-subtle px-4 flex items-center justify-between bg-[#09090b] sticky top-0 z-30">
            <button onclick="toggleSidebar(true)" class="p-1.5 text-neutral-400 hover:text-white rounded border border-subtle">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <span class="font-bold text-sm text-neutral-100">Authentication</span>
            <div class="w-8"></div>
        </header>

        <!-- MAIN PAGE WRAPPER -->
        <main class="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-6">

            <!-- DISABLED BANNER -->
            <div id="disabledBanner" class="hidden p-3 sm:p-3.5 bg-rose-950/50 border border-rose-900/70 rounded-xl text-xs text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-lg">
                <div class="flex items-center space-x-2 flex-wrap gap-y-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                    <span><strong class="font-semibold text-rose-200 uppercase tracking-wider text-[11px]">Loaders Globally Disabled:</strong> <span id="currentDisableReasonText" class="text-rose-100 font-mono text-[11px]"></span></span>
                    <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">Time Paused ⏸</span>
                </div>
                <button onclick="toggleLoaderState()" class="w-full sm:w-auto px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 rounded-lg text-xs font-semibold transition text-center whitespace-nowrap">
                    Re-Enable Now
                </button>
            </div>

            <!-- STATS ROW (4 CARDS) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <div class="bg-card border border-subtle rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
                    <div class="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1 truncate font-mono">Total Licenses</div>
                    <div id="statTotal" class="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-100">0</div>
                </div>
                <div class="bg-card border border-subtle rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
                    <div class="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1 truncate font-mono">Active Subs</div>
                    <div id="statActive" class="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-400">0</div>
                </div>
                <div class="bg-card border border-subtle rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
                    <div class="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1 truncate font-mono">Banned Users</div>
                    <div id="statBanned" class="text-xl sm:text-2xl font-bold font-mono tracking-tight text-rose-400">0</div>
                </div>
                <div class="bg-card border border-subtle rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
                    <div class="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-rose-400 mb-1 flex items-center justify-between font-mono">
                        <span class="truncate">Cracking Logs</span>
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                    </div>
                    <div id="statCracks" class="text-xl sm:text-2xl font-bold font-mono tracking-tight text-rose-400">0</div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- TAB 1: LICENSES                            -->
            <!-- ========================================== -->
            <div id="tabKeys" class="space-y-4">
                
                <!-- LICENSES CONTROLS BAR -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <!-- SEARCH INPUT -->
                    <div class="relative w-full sm:w-72">
                        <svg class="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input type="text" id="searchInput" oninput="filterLicenses()" placeholder="Search key, HWID, note..."
                            class="w-full h-8 pl-8 pr-3 bg-neutral-900 border border-subtle rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition">
                    </div>

                    <!-- CREATE KEY BUTTON -->
                    <button onclick="openModal('generateModal')" class="h-8 px-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition duration-150 flex items-center space-x-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                        <span>Create Key</span>
                    </button>
                </div>

                <!-- TABLE -->
                <div class="bg-card border border-subtle rounded-xl overflow-hidden shadow-sm">
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left text-xs min-w-[620px]">
                            <thead>
                                <tr class="border-b border-subtle bg-neutral-950/60 text-[11px] font-medium uppercase tracking-wider text-neutral-500 whitespace-nowrap">
                                    <th class="py-3 px-3.5 sm:px-4">License Key</th>
                                    <th class="py-3 px-3 sm:px-4">Duration</th>
                                    <th class="py-3 px-3 sm:px-4">HWID</th>
                                    <th class="py-3 px-3 sm:px-4">Expires</th>
                                    <th class="py-3 px-3 sm:px-4">Status</th>
                                    <th class="py-3 px-3 sm:px-4">Note</th>
                                    <th class="py-3 px-3.5 sm:px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="licenseTableBody" class="divide-y divide-neutral-900 font-mono">
                                <!-- Dynamic Rows -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- TAB 2: AUDIT LOGS                          -->
            <!-- ========================================== -->
            <div id="tabLogs" class="hidden space-y-4">
                <div class="bg-card border border-subtle rounded-xl overflow-hidden shadow-sm">
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left text-xs min-w-[580px]">
                            <thead>
                                <tr class="border-b border-subtle bg-neutral-950/60 text-[11px] font-medium uppercase tracking-wider text-neutral-500 whitespace-nowrap">
                                    <th class="py-3 px-3.5 sm:px-4">Timestamp</th>
                                    <th class="py-3 px-3 sm:px-4">Event</th>
                                    <th class="py-3 px-3 sm:px-4">IP</th>
                                    <th class="py-3 px-3 sm:px-4">Key</th>
                                    <th class="py-3 px-3.5 sm:px-4">Details</th>
                                </tr>
                            </thead>
                            <tbody id="logsTableBody" class="divide-y divide-neutral-900 font-mono">
                                <!-- Dynamic Rows -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- TAB 3: CRACKING ATTEMPTS                   -->
            <!-- ========================================== -->
            <div id="tabThreats" class="hidden space-y-4">
                <div class="bg-card border border-rose-950/40 rounded-xl overflow-hidden shadow-sm">
                    <div class="px-3.5 sm:px-4 py-3 bg-rose-950/20 border-b border-rose-900/30 flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></span>
                            <span class="text-xs font-semibold text-rose-300 uppercase tracking-wider">Live Security & Integrity Incidents</span>
                        </div>
                        <button onclick="clearCrackingAttempts()" class="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-subtle rounded text-[11px] transition">
                            Clear Log Feed
                        </button>
                    </div>
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left text-xs min-w-[680px]">
                            <thead>
                                <tr class="border-b border-subtle bg-neutral-950/60 text-[11px] font-medium uppercase tracking-wider text-neutral-500 whitespace-nowrap">
                                    <th class="py-3 px-3.5 sm:px-4">Time</th>
                                    <th class="py-3 px-3 sm:px-4">Threat / Violation</th>
                                    <th class="py-3 px-3 sm:px-4">Offender IP</th>
                                    <th class="py-3 px-3 sm:px-4">Offending Tool / App</th>
                                    <th class="py-3 px-3 sm:px-4">Associated Key</th>
                                    <th class="py-3 px-3 sm:px-4">Target Details</th>
                                    <th class="py-3 px-3.5 sm:px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="threatsTableBody" class="divide-y divide-neutral-900 font-mono">
                                <!-- Dynamic Rows -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- TAB 4: LOADER CONTROL                      -->
            <!-- ========================================== -->
            <div id="tabLoader" class="hidden space-y-4">
                <div class="bg-card border border-subtle rounded-xl p-5 max-w-xl space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-subtle">
                        <div>
                            <h3 class="text-sm font-semibold text-neutral-100">Loader Kill Switch</h3>
                            <p class="text-xs text-neutral-400">Globally disable or enable client loader access.</p>
                        </div>
                        <span id="loaderStatusTag" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                    </div>

                    <div class="p-3 rounded-lg bg-neutral-900 border border-subtle space-y-1">
                        <div class="text-[11px] text-neutral-400 font-medium">Shutdown Reason Broadcast</div>
                        <div id="loaderReasonCurrent" class="text-xs text-neutral-200 font-mono">None (Loaders are running)</div>
                    </div>

                    <div class="pt-1">
                        <button id="loaderToggleBtn" onclick="toggleLoaderState()" class="h-9 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-subtle text-xs font-semibold rounded-lg transition duration-150 flex items-center space-x-2 shadow-sm">
                            <span id="loaderDot" class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                            <span id="loaderBtnText">Disable Loader</span>
                        </button>
                    </div>
                </div>
            </div>

        </main>
    </div>

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

    <!-- MODAL: DISABLE LOADER WITH REASON -->
    <div id="disableModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
        <div class="bg-card w-full max-w-md p-5 rounded-xl border border-rose-900/60 shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-subtle">
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <h3 class="font-semibold text-sm text-neutral-100">Disable All Loaders</h3>
                </div>
                <button onclick="closeModal('disableModal')" class="text-neutral-500 hover:text-neutral-300">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <p class="text-xs text-neutral-400">
                All client loaders will immediately be blocked. Anyone launching the loader will see a popup window displaying the reason you provide below.
            </p>
            <div class="space-y-1.5">
                <label class="text-[11px] font-medium text-neutral-400">Reason for Shutdown</label>
                <input type="text" id="disableReasonInput" placeholder="e.g. Updating for new game patch / Maintenance" 
                    value="Updating for new game patch"
                    class="w-full h-9 px-3 bg-neutral-900 border border-subtle rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-rose-500">
            </div>
            <div class="flex justify-end space-x-2 pt-2">
                <button onclick="closeModal('disableModal')" class="h-8 px-3 border border-subtle hover:bg-neutral-900 text-neutral-300 rounded-lg text-xs transition">
                    Cancel
                </button>
                <button onclick="confirmDisableLoader()" class="h-8 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs transition shadow-sm">
                    Disable Loaders
                </button>
            </div>
        </div>
    </div>

    <script>
        let allLicenses = [];
        let gLoaderEnabled = true;
        let gLoaderDisabledAt = 0;

        function toggleSidebar(open) {
            const sidebar = document.getElementById('sidebar');
            const backdrop = document.getElementById('sidebarBackdrop');
            if (!sidebar || !backdrop) return;
            if (open) {
                sidebar.classList.remove('-translate-x-full');
                backdrop.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                backdrop.classList.add('hidden');
            }
        }

        function switchTab(t) {
            const tabs = ['keys', 'logs', 'threats', 'loader'];
            tabs.forEach(tab => {
                const view = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
                const btn = document.getElementById('tabBtn' + tab.charAt(0).toUpperCase() + tab.slice(1));
                if (view) {
                    if (tab === t) view.classList.remove('hidden');
                    else view.classList.add('hidden');
                }
                if (btn) {
                    if (tab === t) {
                        btn.className = 'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-neutral-800 text-white transition';
                    } else {
                        btn.className = 'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 transition';
                    }
                }
            });
            toggleSidebar(false);
        }

        function updateLoaderButton(enabled) {
            gLoaderEnabled = (enabled !== false);
            const btn = document.getElementById('loaderToggleBtn');
            const dot = document.getElementById('loaderDot');
            const text = document.getElementById('loaderBtnText');
            const sideDot = document.getElementById('sidebarLoaderDot');
            const tag = document.getElementById('loaderStatusTag');

            if (gLoaderEnabled) {
                if (btn) btn.className = 'h-9 px-4 bg-neutral-900 hover:bg-rose-950/40 text-neutral-200 hover:text-rose-300 border border-subtle hover:border-rose-900/60 text-xs font-semibold rounded-lg transition duration-150 flex items-center space-x-2 shadow-sm';
                if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-400 shrink-0';
                if (text) text.textContent = 'Disable Loader';
                if (sideDot) sideDot.className = 'w-2 h-2 rounded-full bg-emerald-400 shrink-0';
                if (tag) {
                    tag.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    tag.textContent = 'Active';
                }
            } else {
                if (btn) btn.className = 'h-9 px-4 bg-rose-950/60 hover:bg-emerald-950/50 text-rose-300 hover:text-emerald-300 border border-rose-800/80 hover:border-emerald-800/80 text-xs font-semibold rounded-lg transition duration-150 flex items-center space-x-2 shadow-sm';
                if (dot) dot.className = 'w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse';
                if (text) text.textContent = 'Enable Loader';
                if (sideDot) sideDot.className = 'w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse';
                if (tag) {
                    tag.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse';
                    tag.textContent = 'Disabled';
                }
            }
        }

        async function toggleLoaderState() {
            if (gLoaderEnabled) {
                openModal('disableModal');
                setTimeout(() => document.getElementById('disableReasonInput')?.focus(), 50);
            } else {
                const res = await api('/api/admin/toggle-loader', { 
                    method: 'POST',
                    body: JSON.stringify({ enable: true })
                });
                if (res && res.success) {
                    updateLoaderButton(res.loader_enabled);
                    loadDashboard();
                } else {
                    alert('Failed to update loader state: ' + (res?.message || 'Server error'));
                }
            }
        }

        async function confirmDisableLoader() {
            const reasonInput = document.getElementById('disableReasonInput').value.trim();
            const reason = reasonInput || 'Updating for new game patch';
            const res = await api('/api/admin/toggle-loader', { 
                method: 'POST',
                body: JSON.stringify({ enable: false, reason })
            });
            if (res && res.success) {
                closeModal('disableModal');
                updateLoaderButton(res.loader_enabled);
                loadDashboard();
            } else {
                alert('Failed to disable loaders: ' + (res?.message || 'Server error'));
            }
        }

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

            if (data.loader_enabled !== undefined) {
                updateLoaderButton(data.loader_enabled);
            }
            gLoaderDisabledAt = data.loader_disabled_at || 0;

            const banner = document.getElementById('disabledBanner');
            const reasonText = document.getElementById('currentDisableReasonText');
            const currentReasonDisplay = document.getElementById('loaderReasonCurrent');

            if (data.loader_enabled === false) {
                const r = data.loader_disable_reason || 'Maintenance';
                if (banner && reasonText) {
                    banner.classList.remove('hidden');
                    reasonText.textContent = r;
                }
                if (currentReasonDisplay) currentReasonDisplay.textContent = r;
            } else {
                if (banner) banner.classList.add('hidden');
                if (currentReasonDisplay) currentReasonDisplay.textContent = 'None (Loaders are running)';
            }

            allLicenses = data.licenses || [];
            renderLicenses(allLicenses);
            renderLogs(data.logs || []);
            renderThreats(data.cracking_attempts || []);

            document.getElementById('statTotal').textContent = data.stats.total;
            document.getElementById('statActive').textContent = data.stats.active;
            document.getElementById('statBanned').textContent = data.stats.banned;
            
            const crackCount = data.stats.cracks !== undefined ? data.stats.cracks : (data.cracking_attempts ? data.cracking_attempts.length : 0);
            document.getElementById('statCracks').textContent = crackCount;

            const sideCount = document.getElementById('sidebarLicenseCount');
            if (sideCount) sideCount.textContent = data.stats.total;

            const badge = document.getElementById('threatCountBadge');
            if (badge) {
                if (crackCount > 0) {
                    badge.textContent = crackCount;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        }

        function showToast(msg) {
            let t = document.getElementById('toastNotice');
            if (!t) {
                t = document.createElement('div');
                t.id = 'toastNotice';
                t.className = 'fixed bottom-4 right-4 z-50 px-3.5 py-2 bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs rounded-lg shadow-2xl transition-opacity duration-200 pointer-events-none opacity-0 flex items-center space-x-2';
                document.body.appendChild(t);
            }
            t.innerHTML = \`<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>\${msg}</span>\`;
            t.classList.remove('opacity-0');
            setTimeout(() => t.classList.add('opacity-0'), 2000);
        }

        function copyKey(key) {
            navigator.clipboard.writeText(key).then(() => showToast('Key copied to clipboard!'));
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

                const isFrozen = !gLoaderEnabled && lic.expires_at && lic.expires_at >= (gLoaderDisabledAt || Date.now());

                let statusBadge = '';
                if (lic.status === 'banned') statusBadge = '<span class="inline-flex items-center text-rose-400 font-sans"><span class="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>Banned</span>';
                else if (isFrozen) statusBadge = '<span class="inline-flex items-center text-amber-300 font-sans"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse"></span>Time Paused</span>';
                else if (lic.expires_at && lic.expires_at < Date.now()) statusBadge = '<span class="inline-flex items-center text-amber-400 font-sans"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>Expired</span>';
                else statusBadge = '<span class="inline-flex items-center text-emerald-400 font-sans"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>Active</span>';

                let expiresStr = 'Not Activated';
                if (lic.duration_days === 0) expiresStr = 'Lifetime';
                else if (lic.expires_at) {
                    expiresStr = new Date(lic.expires_at).toLocaleDateString();
                    if (isFrozen) {
                        expiresStr += ' <span class="text-amber-400 font-medium text-[10px]" title="Key timer stopped while loader is disabled">(Paused ⏸)</span>';
                    }
                }

                tr.innerHTML = \`
                    <td class="py-2.5 px-3.5 sm:px-4 font-semibold text-neutral-200 select-all tracking-tight whitespace-nowrap">
                        <span class="inline-flex items-center gap-1.5">
                            <span>\${lic.key}</span>
                            <button onclick="copyKey('\${lic.key}')" class="text-neutral-500 hover:text-neutral-200 transition p-0.5 rounded" title="Copy key">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            </button>
                        </span>
                    </td>
                    <td class="py-2.5 px-3 sm:px-4 text-neutral-400 font-sans whitespace-nowrap">\${lic.duration_days === 0 ? 'Lifetime' : lic.duration_days + 'd'}</td>
                    <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap">\${hwidCell}</td>
                    <td class="py-2.5 px-3 sm:px-4 text-neutral-400 font-sans whitespace-nowrap">\${expiresStr}</td>
                    <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap">\${statusBadge}</td>
                    <td class="py-2.5 px-3 sm:px-4 text-neutral-500 font-sans whitespace-nowrap">\${lic.note || '-'}</td>
                    <td class="py-2.5 px-3.5 sm:px-4 text-right space-x-1 font-sans whitespace-nowrap">
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
                const ipDisplay = l.ip ? \`<button type="button" onclick="const s=this.querySelector('span');const rev=this.dataset.rev==='1';this.dataset.rev=rev?'0':'1';s.textContent=rev?'••••••••••':'\${l.ip}';this.classList.toggle('text-neutral-200',!rev);this.classList.toggle('text-neutral-500',rev);" data-rev="0" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-subtle text-neutral-500 hover:text-neutral-200 hover:border-neutral-700 transition cursor-pointer select-none text-[11px]" title="Click to show/hide IP"><span>••••••••••</span><svg class="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>\` : '-';
                tr.innerHTML = \`
                    <td class="py-2.5 px-4 text-neutral-500 font-sans">\${new Date(l.timestamp).toLocaleTimeString()}</td>
                    <td class="py-2.5 px-4 font-medium \${isFail ? 'text-rose-400' : 'text-emerald-400'}">\${l.event}</td>
                    <td class="py-2.5 px-4">\${ipDisplay}</td>
                    <td class="py-2.5 px-4 text-neutral-300 font-mono">\${l.key || '-'}</td>
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

        function renderThreats(threats) {
            const tbody = document.getElementById('threatsTableBody');
            tbody.innerHTML = '';
            if (!threats || threats.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-neutral-500 font-sans">No cracking attempts recorded. System secure.</td></tr>';
                return;
            }
            threats.forEach(t => {
                const tr = document.createElement('tr');
                tr.className = 'bg-hover transition duration-100 hover:bg-rose-950/20';
                const ipDisplay = t.ip ? \`<button type="button" onclick="const s=this.querySelector('span');const rev=this.dataset.rev==='1';this.dataset.rev=rev?'0':'1';s.textContent=rev?'••••••••••':'\${t.ip}';this.classList.toggle('text-neutral-200',!rev);this.classList.toggle('text-neutral-500',rev);" data-rev="0" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-subtle text-neutral-500 hover:text-rose-300 hover:border-rose-800 transition cursor-pointer select-none text-[11px]" title="Click to show/hide IP"><span>••••••••••</span><svg class="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>\` : '-';
                
                const timeStr = new Date(t.timestamp).toLocaleTimeString() + ' ' + new Date(t.timestamp).toLocaleDateString();
                const keyDisplay = t.key ? \`<span class="text-neutral-200 font-semibold select-all">\${t.key}</span>\` : '<span class="text-neutral-600">Unauthenticated</span>';
                
                const banBtn = t.key ? \`<button onclick="toggleBan('\${t.key}', 'active')" class="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 rounded text-[11px] font-sans transition">Ban Key</button>\` : '';

                tr.innerHTML = \`
                    <td class="py-2.5 px-4 text-neutral-500 font-sans whitespace-nowrap">\${timeStr}</td>
                    <td class="py-2.5 px-4"><span class="inline-flex items-center text-rose-400 font-sans font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 shadow-[0_0_6px_rgba(244,63,94,0.8)]"></span>\${t.threat_type}</span></td>
                    <td class="py-2.5 px-4">\${ipDisplay}</td>
                    <td class="py-2.5 px-4 text-amber-300 font-sans">\${t.offending_app || 'N/A'}</td>
                    <td class="py-2.5 px-4">\${keyDisplay}</td>
                    <td class="py-2.5 px-4 text-neutral-400 font-sans max-w-xs truncate" title="\${t.details || ''}">\${t.details || '-'}</td>
                    <td class="py-2.5 px-4 text-right space-x-1 font-sans">\${banBtn}</td>
                \`;
                tbody.appendChild(tr);
            });
        }

        async function clearCrackingAttempts() {
            await api('/api/admin/clear-cracks', { method: 'POST' });
            loadDashboard();
        }

        async function resetHwid(key) {
            await api('/api/admin/reset-hwid', { method: 'POST', body: JSON.stringify({ key }) });
            loadDashboard();
        }

        async function toggleBan(key, currentStatus) {
            const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
            await api('/api/admin/set-status', { method: 'POST', body: JSON.stringify({ key, status: newStatus }) });
            showToast(newStatus === 'banned' ? 'Key banned & Discord roles revoked' : 'Key unbanned');
            loadDashboard();
        }

        async function deleteKey(key) {
            const res = await api('/api/admin/delete-key', { method: 'POST', body: JSON.stringify({ key }) });
            if (res && res.roles_revoked && res.revoked_roles && res.revoked_roles.length > 0) {
                showToast(\`Key deleted & Discord roles revoked: \${res.revoked_roles.join(', ')}\`);
            } else {
                showToast('Key deleted');
            }
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
            navigator.clipboard.writeText(ta.value).then(() => showToast('All keys copied!'));
        }

        window.addEventListener('DOMContentLoaded', loadDashboard);
    </script>
</body>
</html>
`;