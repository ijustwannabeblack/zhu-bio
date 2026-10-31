export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Control Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        :root {
            --bg-base: #09090b;
            --bg-sidebar: #070709;
            --bg-card: #0c0c0e;
            --border-subtle: #1f1f23;
            --border-hover: #2e2e34;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-base);
            color: #f4f4f5;
        }
        .font-mono { font-family: 'Geist Mono', monospace; }
        .border-subtle { border-color: var(--border-subtle); }
        .border-hover:hover { border-color: var(--border-hover); }
        .bg-card { background-color: var(--bg-card); }
        .bg-sidebar { background-color: var(--bg-sidebar); }
        .bg-hover:hover { background-color: #131316; }
        
        /* Smooth Mobile & Desktop Scrollbars */
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
        .scrollbar-none::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        /* Subtle Fade In Animation for Views */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(3px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
    </style>
</head>
<body class="min-h-screen flex antialiased selection:bg-neutral-800 selection:text-white">

    <!-- MOBILE BACKDROP -->
    <div id="mobileDrawerBackdrop" onclick="toggleMobileSidebar(false)" class="hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"></div>

    <!-- LEFT SIDEBAR -->
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-subtle flex flex-col justify-between transition-transform duration-200 -translate-x-full lg:translate-x-0 lg:static shrink-0 select-none">
        
        <!-- TOP BRAND & NAVIGATION -->
        <div class="flex flex-col h-full overflow-y-auto custom-scrollbar">
            
            <!-- BRAND HEADER -->
            <div class="h-16 px-5 border-b border-subtle flex items-center justify-between shrink-0">
                <a href="/admin" class="flex items-center space-x-2.5 group">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700/80 flex items-center justify-center shadow-inner group-hover:border-neutral-500 transition">
                        <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <div class="flex flex-col">
                        <span class="font-extrabold tracking-wider text-sm text-neutral-100 flex items-center gap-1.5">
                            LARPIFY
                            <span class="text-[9px] font-mono font-medium px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">AUTH</span>
                        </span>
                        <span class="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Control Hub</span>
                    </div>
                </a>

                <!-- MOBILE CLOSE BUTTON -->
                <button onclick="toggleMobileSidebar(false)" class="lg:hidden text-neutral-400 hover:text-white p-1 rounded-md">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
            </div>

            <!-- NAVIGATION ITEMS -->
            <nav class="p-3.5 space-y-6 flex-1">
                
                <!-- GROUP 1: CORE -->
                <div>
                    <div class="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">Overview</div>
                    <div class="space-y-1">
                        <button onclick="switchView('dashboard')" id="navBtn-dashboard" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-white bg-neutral-800/90 border border-neutral-700/60 shadow-sm transition group">
                            <div class="flex items-center space-x-2.5">
                                <svg class="w-4 h-4 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                                <span>Dashboard</span>
                            </div>
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </button>

                        <button onclick="switchView('licenses')" id="navBtn-licenses" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent transition group">
                            <div class="flex items-center space-x-2.5">
                                <svg class="w-4 h-4 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
                                <span>Licenses</span>
                            </div>
                            <span id="navBadgeLicenses" class="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-subtle">0</span>
                        </button>
                    </div>
                </div>

                <!-- GROUP 2: DEFENSE & AUDIT -->
                <div>
                    <div class="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">Defense & Logs</div>
                    <div class="space-y-1">
                        <button onclick="switchView('threats')" id="navBtn-threats" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-rose-300 hover:bg-rose-950/20 border border-transparent transition group">
                            <div class="flex items-center space-x-2.5">
                                <svg class="w-4 h-4 text-neutral-400 group-hover:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                                <span>Threat Intel</span>
                            </div>
                            <span id="navBadgeThreats" class="hidden text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">0</span>
                        </button>

                        <button onclick="switchView('logs')" id="navBtn-logs" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent transition group">
                            <div class="flex items-center space-x-2.5">
                                <svg class="w-4 h-4 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                                <span>Audit Logs</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- GROUP 3: SYSTEM CONTROL -->
                <div>
                    <div class="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">System</div>
                    <div class="space-y-1">
                        <button onclick="switchView('loader')" id="navBtn-loader" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent transition group">
                            <div class="flex items-center space-x-2.5">
                                <svg class="w-4 h-4 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10"/></svg>
                                <span>Loader Control</span>
                            </div>
                            <span id="navLoaderDot" class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                        </button>

                        <button onclick="switchView('system')" id="navBtn-system" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent transition group">
                            <div class="flex items-center space-x-2.5">
                                <svg class="w-4 h-4 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 9h6v6H9z"/><path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/></svg>
                                <span>Infrastructure</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- GROUP 4: LINKS -->
                <div>
                    <div class="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">Ecosystem</div>
                    <a href="/" target="_blank" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent transition group">
                        <div class="flex items-center space-x-2.5">
                            <svg class="w-4 h-4 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                            <span>Public Bio</span>
                        </div>
                        <svg class="w-3.5 h-3.5 text-neutral-500 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
                    </a>
                </div>
            </nav>

            <!-- FOOTER: ADMIN USER PROFILE & LOGOUT -->
            <div class="p-3 border-t border-subtle bg-neutral-950/60 shrink-0">
                <div class="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-subtle">
                    <div class="flex items-center space-x-2.5 min-w-0">
                        <img id="adminAvatar" src="https://cdn.discordapp.com/embed/avatars/0.png" class="w-8 h-8 rounded-full border border-neutral-700 shrink-0">
                        <div class="flex flex-col min-w-0">
                            <span id="adminUsername" class="text-neutral-200 font-semibold text-xs truncate">Owner</span>
                            <span class="text-[10px] text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Superadmin
                            </span>
                        </div>
                    </div>
                    <a href="/api/admin/logout" class="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition" title="Log out">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    </a>
                </div>
                <div class="mt-2 px-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>Cloudflare Edge</span>
                    <span class="flex items-center gap-1 text-emerald-400"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Zero-Knowledge</span>
                </div>
            </div>

        </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 min-w-0 flex flex-col min-h-screen">
        
        <!-- TOP APP BAR -->
        <header class="h-16 border-b border-subtle bg-[#09090b]/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-3">
            
            <!-- LEFT: MOBILE TOGGLE & BREADCRUMB -->
            <div class="flex items-center space-x-3 min-w-0">
                <button onclick="toggleMobileSidebar(true)" class="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 border border-subtle">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                </button>
                <div class="flex items-center space-x-2 text-xs">
                    <span class="text-neutral-500">Portal</span>
                    <span class="text-neutral-600">/</span>
                    <span id="breadcrumbCurrent" class="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">Dashboard</span>
                </div>
            </div>

            <!-- RIGHT: QUICK ACTIONS -->
            <div class="flex items-center space-x-2 sm:space-x-3 shrink-0">
                <!-- LOADER TOGGLE BUTTON -->
                <button id="loaderToggleBtn" onclick="toggleLoaderState()" class="h-8 px-2.5 sm:px-3 bg-neutral-900 text-neutral-300 border border-subtle text-xs font-semibold rounded-lg transition duration-150 flex items-center space-x-1.5 shadow-sm whitespace-nowrap">
                    <span id="loaderDot" class="w-2 h-2 rounded-full bg-neutral-500 shrink-0"></span>
                    <span id="loaderBtnText">...</span>
                </button>

                <!-- CREATE KEY BUTTON -->
                <button onclick="openModal('generateModal')" class="h-8 px-3 sm:px-3.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition duration-150 flex items-center space-x-1.5 shadow-sm whitespace-nowrap">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    <span>Create Key</span>
                </button>
            </div>
        </header>

        <!-- VIEW WRAPPER -->
        <main class="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">

            <!-- DISABLED BANNER -->
            <div id="disabledBanner" class="hidden p-3.5 sm:p-4 bg-rose-950/50 border border-rose-900/70 rounded-xl text-xs text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div class="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                    <span><strong class="font-semibold text-rose-200 uppercase tracking-wider text-[11px]">Loaders Globally Disabled:</strong> <span id="currentDisableReasonText" class="text-rose-100 font-mono text-[11px]"></span></span>
                    <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">Time Paused ⏸</span>
                </div>
                <button onclick="toggleLoaderState()" class="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 rounded-lg text-xs font-semibold transition text-center whitespace-nowrap">
                    Re-Enable Now
                </button>
            </div>

            <!-- ========================================== -->
            <!-- VIEW 1: DASHBOARD OVERVIEW                 -->
            <!-- ========================================== -->
            <div id="view-dashboard" class="space-y-6 animate-fade-in">
                
                <!-- METRICS ROW (4 CARDS) -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div class="bg-card border border-subtle rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700 transition">
                        <div class="flex items-center justify-between text-neutral-400 mb-2">
                            <span class="text-[11px] font-semibold uppercase tracking-wider font-mono">Total Licenses</span>
                            <svg class="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/></svg>
                        </div>
                        <div id="statTotal" class="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-neutral-100">0</div>
                        <div class="mt-2 text-[11px] text-neutral-500">All generated keys</div>
                    </div>

                    <div class="bg-card border border-subtle rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700 transition">
                        <div class="flex items-center justify-between text-neutral-400 mb-2">
                            <span class="text-[11px] font-semibold uppercase tracking-wider font-mono">Active Subs</span>
                            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>
                        <div id="statActive" class="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-400">0</div>
                        <div class="mt-2 text-[11px] text-neutral-500">Unexpired active keys</div>
                    </div>

                    <div class="bg-card border border-subtle rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700 transition">
                        <div class="flex items-center justify-between text-neutral-400 mb-2">
                            <span class="text-[11px] font-semibold uppercase tracking-wider font-mono">Banned Users</span>
                            <svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        </div>
                        <div id="statBanned" class="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-400">0</div>
                        <div class="mt-2 text-[11px] text-neutral-500">Revoked / Blacklisted</div>
                    </div>

                    <div class="bg-card border border-rose-950/50 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-rose-900/60 transition bg-rose-950/10">
                        <div class="flex items-center justify-between text-rose-400 mb-2">
                            <span class="text-[11px] font-semibold uppercase tracking-wider font-mono">Cracking Logs</span>
                            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        </div>
                        <div id="statCracks" class="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-400">0</div>
                        <div class="mt-2 text-[11px] text-rose-400/70">Tamper & debugger alerts</div>
                    </div>
                </div>

                <!-- QUICK ACTIONS BAR -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button onclick="openModal('generateModal')" class="p-3 bg-neutral-900/80 hover:bg-neutral-800 border border-subtle rounded-xl text-left transition flex items-center space-x-3 group">
                        <div class="w-8 h-8 rounded-lg bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center text-white shrink-0">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs font-semibold text-neutral-200">New License</div>
                            <div class="text-[10px] text-neutral-500 truncate">Generate custom keys</div>
                        </div>
                    </button>

                    <button onclick="toggleLoaderState()" class="p-3 bg-neutral-900/80 hover:bg-neutral-800 border border-subtle rounded-xl text-left transition flex items-center space-x-3 group">
                        <div class="w-8 h-8 rounded-lg bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10"/></svg>
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs font-semibold text-neutral-200">Kill Switch</div>
                            <div class="text-[10px] text-neutral-500 truncate">Halt or resume loader</div>
                        </div>
                    </button>

                    <button onclick="switchView('threats')" class="p-3 bg-neutral-900/80 hover:bg-neutral-800 border border-subtle rounded-xl text-left transition flex items-center space-x-3 group">
                        <div class="w-8 h-8 rounded-lg bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center text-rose-400 shrink-0">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs font-semibold text-neutral-200">Threat Feed</div>
                            <div class="text-[10px] text-neutral-500 truncate">View security triggers</div>
                        </div>
                    </button>

                    <button onclick="copyDomainUrl()" class="p-3 bg-neutral-900/80 hover:bg-neutral-800 border border-subtle rounded-xl text-left transition flex items-center space-x-3 group">
                        <div class="w-8 h-8 rounded-lg bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center text-emerald-400 shrink-0">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs font-semibold text-neutral-200">Domain API</div>
                            <div class="text-[10px] text-neutral-500 truncate">larpifyy.asia</div>
                        </div>
                    </button>
                </div>

                <!-- SPLIT COLUMNS: RECENT ACTIVITY & SECURITY INTEGRITY -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    <!-- RECENT ACTIVITY (PREVIEW) -->
                    <div class="bg-card border border-subtle rounded-xl p-5 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between pb-3 border-b border-subtle">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-200 font-mono">Recent Activity</h3>
                                </div>
                                <button onclick="switchView('logs')" class="text-xs text-neutral-400 hover:text-white transition">View All →</button>
                            </div>
                            <div id="dashboardRecentLogs" class="divide-y divide-neutral-900 text-xs font-mono pt-1">
                                <!-- Dynamic recent logs -->
                            </div>
                        </div>
                    </div>

                    <!-- SECURITY HEALTH -->
                    <div class="bg-card border border-subtle rounded-xl p-5 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between pb-3 border-b border-subtle">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                                    <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-200 font-mono">System Integrity</h3>
                                </div>
                                <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">ARMED</span>
                            </div>

                            <div class="mt-4 space-y-3 text-xs">
                                <div class="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-subtle">
                                    <span class="text-neutral-400">Zero-Knowledge Handshake</span>
                                    <span class="text-emerald-400 font-mono font-medium">AES-256-GCM + HMAC</span>
                                </div>
                                <div class="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-subtle">
                                    <span class="text-neutral-400">Driver Extraction Defense</span>
                                    <span class="text-emerald-400 font-mono font-medium">In-Memory Streamed</span>
                                </div>
                                <div class="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-subtle">
                                    <span class="text-neutral-400">Admin RBAC Gate</span>
                                    <span class="text-neutral-200 font-mono font-medium truncate max-w-[150px]">1415022792214052915</span>
                                </div>
                                <div class="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-subtle">
                                    <span class="text-neutral-400">Anti-Tamper Popup</span>
                                    <span class="text-rose-400 font-mono font-medium">"stop cracking pls :3"</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <!-- ========================================== -->
            <!-- VIEW 2: LICENSES MANAGEMENT                -->
            <!-- ========================================== -->
            <div id="view-licenses" class="hidden space-y-4 animate-fade-in">
                
                <!-- HEADER & CONTROLS -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 class="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">License Management</h2>
                        <p class="text-xs text-neutral-400">Create, search, inspect, ban, and reset user HWIDs.</p>
                    </div>

                    <!-- SEARCH & FILTER -->
                    <div class="flex items-center space-x-2">
                        <div class="relative w-full sm:w-64">
                            <svg class="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            <input type="text" id="searchInput" oninput="filterLicenses()" placeholder="Search key, HWID, note..."
                                class="w-full h-8 pl-8 pr-3 bg-neutral-900 border border-subtle rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition">
                        </div>
                        <button onclick="openModal('generateModal')" class="h-8 px-3 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition whitespace-nowrap">
                            + Create
                        </button>
                    </div>
                </div>

                <!-- TABLE CONTAINER -->
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
            <!-- VIEW 3: THREAT INTEL & CRACKING ATTEMPTS   -->
            <!-- ========================================== -->
            <div id="view-threats" class="hidden space-y-4 animate-fade-in">
                
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 class="text-sm font-bold text-rose-300 uppercase tracking-wider font-mono flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            Live Integrity & Threat Intel
                        </h2>
                        <p class="text-xs text-neutral-400">Real-time alerts triggered by anti-tamper, debuggers, memory scans, or invalid signatures.</p>
                    </div>

                    <button onclick="clearCrackingAttempts()" class="h-8 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-rose-400 border border-subtle rounded-lg text-xs font-medium transition whitespace-nowrap">
                        Clear Threat Feed
                    </button>
                </div>

                <div class="bg-card border border-rose-950/40 rounded-xl overflow-hidden shadow-sm">
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
            <!-- VIEW 4: SYSTEM AUDIT LOGS                  -->
            <!-- ========================================== -->
            <div id="view-logs" class="hidden space-y-4 animate-fade-in">
                
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 class="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">System Audit Trail</h2>
                        <p class="text-xs text-neutral-400">Forensic logs of every authentication attempt, key generation, and administrative action.</p>
                    </div>
                    <button onclick="loadDashboard()" class="h-8 px-3 bg-neutral-900 hover:bg-neutral-800 border border-subtle text-xs text-neutral-300 rounded-lg transition">
                        Refresh Logs
                    </button>
                </div>

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
            <!-- VIEW 5: LOADER CONTROL & MAINTENANCE       -->
            <!-- ========================================== -->
            <div id="view-loader" class="hidden space-y-5 animate-fade-in">
                
                <div>
                    <h2 class="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">Loader Kill-Switch & Maintenance Engine</h2>
                    <p class="text-xs text-neutral-400">Instantly halt client loader access during game updates while freezing customer subscription timers.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    <!-- KILL SWITCH CONTROLLER -->
                    <div class="bg-card border border-subtle rounded-xl p-5 space-y-4">
                        <div class="flex items-center justify-between pb-3 border-b border-subtle">
                            <span class="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">Current Status</span>
                            <span id="loaderStatusBadge" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OPERATIONAL</span>
                        </div>

                        <p class="text-xs text-neutral-400">
                            Disabling the loader instantly blocks all incoming Loader.exe handshakes worldwide. Any user attempting to launch will be greeted with the maintenance popup reason below.
                        </p>

                        <div class="p-3 rounded-lg bg-neutral-900 border border-subtle space-y-1">
                            <div class="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Active Maintenance Reason</div>
                            <div id="loaderReasonDisplay" class="text-xs text-neutral-200 font-mono">Updating for new game patch</div>
                        </div>

                        <div class="pt-2">
                            <button id="viewLoaderToggleBtn" onclick="toggleLoaderState()" class="w-full h-9 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold rounded-lg text-xs border border-subtle transition">
                                Toggle Loader State
                            </button>
                        </div>
                    </div>

                    <!-- CLIENT POPUP SIMULATION PREVIEW -->
                    <div class="bg-card border border-subtle rounded-xl p-5 space-y-3">
                        <div class="flex items-center justify-between pb-3 border-b border-subtle">
                            <span class="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">Client Simulation View</span>
                            <span class="text-[10px] text-neutral-500 font-mono">Win32 MessageBox Mock</span>
                        </div>

                        <div class="p-4 rounded-lg bg-[#0e0e11] border border-neutral-700/80 shadow-2xl space-y-3">
                            <div class="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                                <span class="font-semibold text-neutral-200 flex items-center gap-1.5">
                                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                    Security Notification
                                </span>
                                <span>✕</span>
                            </div>
                            <div class="py-2 text-xs text-neutral-300 font-mono">
                                stop cracking pls :3
                            </div>
                            <div class="flex justify-end pt-1">
                                <div class="px-3 py-1 bg-neutral-800 border border-neutral-700 text-white rounded text-[11px] font-sans">
                                    OK
                                </div>
                            </div>
                        </div>

                        <p class="text-[11px] text-neutral-500">
                            When security violations occur in protection.h, attackers are presented with this exact dialog before the process terminates cleanly.
                        </p>
                    </div>

                </div>

            </div>

            <!-- ========================================== -->
            <!-- VIEW 6: INFRASTRUCTURE & ARCHITECTURE      -->
            <!-- ========================================== -->
            <div id="view-system" class="hidden space-y-5 animate-fade-in">
                
                <div>
                    <h2 class="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">Infrastructure & Cryptographic Stack</h2>
                    <p class="text-xs text-neutral-400">Zero-knowledge server topology running at the Cloudflare Edge network.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-card border border-subtle rounded-xl p-4 space-y-2">
                        <div class="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">1. Key Derivation</div>
                        <div class="text-xs text-neutral-300 font-semibold">Web Crypto AES-GCM</div>
                        <p class="text-[11px] text-neutral-500">Hardware identifiers are SHA-256 hashed locally on the client before being sent across TLS 1.3.</p>
                    </div>

                    <div class="bg-card border border-subtle rounded-xl p-4 space-y-2">
                        <div class="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 font-mono">2. Memory Payload</div>
                        <div class="text-xs text-neutral-300 font-semibold">Driver Decrypted in RAM</div>
                        <p class="text-[11px] text-neutral-500">Kernel drivers are never dropped on disk. The payload is streamed in memory directly to verified active sessions.</p>
                    </div>

                    <div class="bg-card border border-subtle rounded-xl p-4 space-y-2">
                        <div class="text-[11px] font-semibold uppercase tracking-wider text-rose-400 font-mono">3. Anti-Tamper</div>
                        <div class="text-xs text-neutral-300 font-semibold">Real-Time Threat Webhook</div>
                        <p class="text-[11px] text-neutral-500">Debugger hooks and integrity breaches are logged directly to the Cloudflare Worker and Discord alert channel.</p>
                    </div>
                </div>

                <div class="p-4 bg-card border border-subtle rounded-xl flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <div>
                            <div class="text-xs font-semibold text-neutral-200">Global API Gateway</div>
                            <div class="text-[10px] text-neutral-500 font-mono">https://larpifyy.asia/</div>
                        </div>
                    </div>
                    <a href="/" target="_blank" class="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs rounded-lg border border-subtle transition">
                        Open Public Bio
                    </a>
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
        let allLogs = [];
        let gLoaderEnabled = true;
        let gLoaderDisabledAt = 0;
        let currentActiveView = 'dashboard';

        function switchView(viewName) {
            currentActiveView = viewName;
            
            // Views
            const views = ['dashboard', 'licenses', 'threats', 'logs', 'loader', 'system'];
            views.forEach(v => {
                const el = document.getElementById('view-' + v);
                const btn = document.getElementById('navBtn-' + v);
                if (el) {
                    if (v === viewName) {
                        el.classList.remove('hidden');
                    } else {
                        el.classList.add('hidden');
                    }
                }
                if (btn) {
                    if (v === viewName) {
                        btn.className = 'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-white bg-neutral-800/90 border border-neutral-700/60 shadow-sm transition group';
                    } else {
                        btn.className = 'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent transition group';
                    }
                }
            });

            // Update Breadcrumb
            const titles = {
                dashboard: 'Dashboard',
                licenses: 'Licenses',
                threats: 'Threat Intel',
                logs: 'Audit Logs',
                loader: 'Loader Control',
                system: 'Infrastructure'
            };
            const bc = document.getElementById('breadcrumbCurrent');
            if (bc) bc.textContent = titles[viewName] || 'Dashboard';

            // Close mobile sidebar if open
            toggleMobileSidebar(false);
        }

        function toggleMobileSidebar(open) {
            const sidebar = document.getElementById('sidebar');
            const backdrop = document.getElementById('mobileDrawerBackdrop');
            if (!sidebar || !backdrop) return;
            if (open) {
                sidebar.classList.remove('-translate-x-full');
                backdrop.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                backdrop.classList.add('hidden');
            }
        }

        function updateLoaderButton(enabled) {
            gLoaderEnabled = (enabled !== false);
            const btn = document.getElementById('loaderToggleBtn');
            const dot = document.getElementById('loaderDot');
            const text = document.getElementById('loaderBtnText');
            const navDot = document.getElementById('navLoaderDot');
            const statusBadge = document.getElementById('loaderStatusBadge');
            const viewBtn = document.getElementById('viewLoaderToggleBtn');

            if (gLoaderEnabled) {
                if (btn) btn.className = 'h-8 px-2.5 sm:px-3 bg-neutral-900 hover:bg-rose-950/40 text-neutral-200 hover:text-rose-300 border border-subtle hover:border-rose-900/60 text-xs font-semibold rounded-lg transition duration-150 flex items-center space-x-1.5 shadow-sm whitespace-nowrap';
                if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] shrink-0';
                if (text) text.innerHTML = 'Disable<span class="hidden sm:inline"> Loader</span>';
                if (navDot) navDot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
                if (statusBadge) {
                    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    statusBadge.textContent = 'OPERATIONAL';
                }
                if (viewBtn) viewBtn.textContent = 'Disable Loaders (Emergency)';
            } else {
                if (btn) btn.className = 'h-8 px-2.5 sm:px-3 bg-rose-950/60 hover:bg-emerald-950/50 text-rose-300 hover:text-emerald-300 border border-rose-800/80 hover:border-emerald-800/80 text-xs font-semibold rounded-lg transition duration-150 flex items-center space-x-1.5 shadow-sm whitespace-nowrap';
                if (dot) dot.className = 'w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse shrink-0';
                if (text) text.innerHTML = 'Enable<span class="hidden sm:inline"> Loader</span>';
                if (navDot) navDot.className = 'w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse';
                if (statusBadge) {
                    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse';
                    statusBadge.textContent = 'MAINTENANCE MODE';
                }
                if (viewBtn) viewBtn.textContent = 'Re-Enable All Loaders Now';
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
            const reasonDisplay = document.getElementById('loaderReasonDisplay');
            if (banner && reasonText) {
                if (data.loader_enabled === false) {
                    banner.classList.remove('hidden');
                    const r = data.loader_disable_reason || 'Maintenance';
                    reasonText.textContent = r;
                    if (reasonDisplay) reasonDisplay.textContent = r;
                } else {
                    banner.classList.add('hidden');
                    if (reasonDisplay) reasonDisplay.textContent = 'None (Loaders Fully Operational)';
                }
            }

            allLicenses = data.licenses || [];
            allLogs = data.logs || [];
            renderLicenses(allLicenses);
            renderLogs(allLogs);
            renderDashboardRecentLogs(allLogs);
            renderThreats(data.cracking_attempts || []);

            document.getElementById('statTotal').textContent = data.stats.total;
            document.getElementById('statActive').textContent = data.stats.active;
            document.getElementById('statBanned').textContent = data.stats.banned;
            
            const crackCount = data.stats.cracks !== undefined ? data.stats.cracks : (data.cracking_attempts ? data.cracking_attempts.length : 0);
            document.getElementById('statCracks').textContent = crackCount;

            const navBadgeL = document.getElementById('navBadgeLicenses');
            if (navBadgeL) navBadgeL.textContent = data.stats.total;

            const navBadgeT = document.getElementById('navBadgeThreats');
            if (navBadgeT) {
                if (crackCount > 0) {
                    navBadgeT.textContent = crackCount;
                    navBadgeT.classList.remove('hidden');
                } else {
                    navBadgeT.classList.add('hidden');
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

        function copyDomainUrl() {
            navigator.clipboard.writeText('https://larpifyy.asia/').then(() => showToast('Domain API copied!'));
        }

        function renderLicenses(licenses) {
            const tbody = document.getElementById('licenseTableBody');
            tbody.innerHTML = '';
            if (!licenses || licenses.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-neutral-500 font-sans">No licenses found.</td></tr>';
                return;
            }
            licenses.forEach(lic => {
                const tr = document.createElement('tr');
                tr.className = 'bg-hover transition duration-100';

                const isLocked = !!lic.hwid;
                const hwidCell = isLocked 
                    ? \`<button type="button" onclick="navigator.clipboard.writeText('\${lic.hwid}').then(()=>showToast('HWID copied!'))" class="text-neutral-400 hover:text-white transition select-all font-mono text-[11px] bg-neutral-900 px-1.5 py-0.5 rounded border border-subtle" title="Click to copy full HWID: \${lic.hwid}">\${lic.hwid.substring(0, 8)}...</button>\`
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
                    <td class="py-2.5 px-3 sm:px-4 text-neutral-500 font-sans whitespace-nowrap max-w-[150px] truncate" title="\${lic.note || ''}">\${lic.note || '-'}</td>
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
            if (!logs || logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-neutral-500 font-sans">No audit events logged yet.</td></tr>';
                return;
            }
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

        function renderDashboardRecentLogs(logs) {
            const container = document.getElementById('dashboardRecentLogs');
            if (!container) return;
            container.innerHTML = '';
            const recent = (logs || []).slice(0, 5);
            if (recent.length === 0) {
                container.innerHTML = '<div class="py-4 text-center text-neutral-500 font-sans">No events logged yet.</div>';
                return;
            }
            recent.forEach(l => {
                const isFail = l.event.includes('FAIL') || l.event.includes('MISMATCH') || l.event.includes('BAN') || l.event.includes('BLOCKED');
                const row = document.createElement('div');
                row.className = 'py-2 flex items-center justify-between text-[11px]';
                row.innerHTML = \`
                    <div class="flex items-center space-x-2 truncate">
                        <span class="w-1.5 h-1.5 rounded-full \${isFail ? 'bg-rose-400' : 'bg-emerald-400'} shrink-0"></span>
                        <span class="font-medium \${isFail ? 'text-rose-400' : 'text-neutral-200'}">\${l.event}</span>
                        <span class="text-neutral-500 truncate max-w-[200px]">\${l.key || l.details || ''}</span>
                    </div>
                    <span class="text-neutral-500 font-sans shrink-0">\${new Date(l.timestamp).toLocaleTimeString()}</span>
                \`;
                container.appendChild(row);
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
            loadDashboard();
        }

        async function deleteKey(key) {
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
            navigator.clipboard.writeText(ta.value).then(() => showToast('All keys copied!'));
        }

        window.addEventListener('DOMContentLoaded', loadDashboard);
    </script>
</body>
</html>
`;
