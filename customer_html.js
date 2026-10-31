export const CUSTOMER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UDvengers • Customer Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #070709;
            color: #f3f4f6;
            background-image: 
                radial-gradient(circle at 15% 0%, rgba(168, 85, 247, 0.12), transparent 45%),
                radial-gradient(circle at 85% 100%, rgba(147, 51, 234, 0.08), transparent 40%);
            min-height: 100vh;
        }
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
        .glass-panel {
            background: rgba(18, 14, 26, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(168, 85, 247, 0.22);
            box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 35px rgba(168, 85, 247, 0.1);
        }
        .glass-card {
            background: rgba(22, 17, 33, 0.65);
            border: 1px solid rgba(168, 85, 247, 0.18);
            backdrop-filter: blur(12px);
        }
        .glass-card:hover {
            border-color: rgba(168, 85, 247, 0.35);
        }
        .input-dark {
            background: rgba(12, 9, 18, 0.8);
            border: 1px solid rgba(168, 85, 247, 0.25);
            color: #ffffff;
            transition: all 0.2s ease;
        }
        .input-dark:focus {
            outline: none;
            border-color: #a855f7;
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.25);
        }
        .btn-gradient {
            background: linear-gradient(135deg, #9333ea, #7e22ce);
            transition: all 0.2s ease;
        }
        .btn-gradient:hover {
            background: linear-gradient(135deg, #a855f7, #9333ea);
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
            transform: translateY(-1px);
        }
        .btn-gradient:active {
            transform: translateY(0);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
            height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #09070f;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2b1f42;
            border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #493373;
        }
    </style>
</head>
<body class="selection:bg-purple-900/60 selection:text-white flex flex-col justify-between">

    <!-- TOAST NOTIFICATION CONTAINER -->
    <div id="toast" class="fixed top-5 right-5 z-50 transform -translate-y-12 opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-900/95 border border-purple-500/30 text-neutral-100 text-xs shadow-2xl">
        <span id="toastDot" class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span id="toastMsg">Notification</span>
    </div>

    <!-- ============================================================ -->
    <!-- 1. AUTH MODAL VIEW (SHOWN IF USER IS NOT LOGGED IN) -->
    <!-- ============================================================ -->
    <div id="authView" class="hidden min-h-screen flex items-center justify-center p-4">
        <div class="glass-panel w-full max-w-md rounded-2xl p-7 relative overflow-hidden">
            <!-- Ambient Top Glow -->
            <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/25 blur-3xl rounded-full pointer-events-none"></div>

            <!-- Brand Logo & Header -->
            <div class="text-center mb-6 relative">
                <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-900/60 to-purple-600/30 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
                    <svg class="w-7 h-7 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <h1 class="text-xl font-bold tracking-tight text-white">Customer Portal</h1>
                <p class="text-xs text-neutral-400 mt-1">Access your license, downloads, and HWID controls.</p>
            </div>

            <!-- Tab Switcher: Sign In / Register -->
            <div class="flex p-1 bg-neutral-900/80 rounded-xl border border-purple-500/20 mb-6">
                <button type="button" id="tabSignInBtn" onclick="switchAuthTab('signin')" class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-white bg-purple-600 shadow-sm">
                    Sign In
                </button>
                <button type="button" id="tabRegisterBtn" onclick="switchAuthTab('register')" class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-neutral-400 hover:text-white">
                    Register with Key
                </button>
            </div>

            <!-- TAB A: SIGN IN FORM -->
            <form id="signInForm" onsubmit="handleSignIn(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">Email Address</label>
                    <input type="email" id="loginEmail" required placeholder="you@domain.com" class="input-dark w-full px-3.5 py-2.5 rounded-xl text-xs placeholder-neutral-500">
                </div>
                <div>
                    <div class="flex items-center justify-between mb-1.5">
                        <label class="text-xs font-medium text-neutral-300">Password</label>
                    </div>
                    <input type="password" id="loginPassword" required placeholder="••••••••••••" class="input-dark w-full px-3.5 py-2.5 rounded-xl text-xs placeholder-neutral-500">
                </div>

                <div id="loginError" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5"></div>

                <button type="submit" id="btnSignInSubmit" class="btn-gradient w-full py-2.5 rounded-xl text-xs font-semibold text-white tracking-wide shadow-md flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </form>

            <!-- TAB B: REGISTER STEP 1 (Email, Password, Key) -->
            <form id="registerStep1Form" onsubmit="handleRequestOtp(event)" class="hidden space-y-4">
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">Email Address</label>
                    <input type="email" id="regEmail" required placeholder="you@domain.com" class="input-dark w-full px-3.5 py-2.5 rounded-xl text-xs placeholder-neutral-500">
                    <p class="text-[11px] text-neutral-500 mt-1">A verification code will be sent to this email.</p>
                </div>
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">Create Password</label>
                    <input type="password" id="regPassword" required minlength="6" placeholder="At least 6 characters" class="input-dark w-full px-3.5 py-2.5 rounded-xl text-xs placeholder-neutral-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">License Key</label>
                    <input type="text" id="regKey" required placeholder="LIFETIME-XXXX-XXXX-XXXX" class="input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider placeholder-neutral-500">
                    <p class="text-[11px] text-neutral-500 mt-1">Enter your active UDvengers license key.</p>
                </div>

                <div id="regStep1Error" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5"></div>

                <button type="submit" id="btnRequestOtp" class="btn-gradient w-full py-2.5 rounded-xl text-xs font-semibold text-white tracking-wide shadow-md flex items-center justify-center gap-2">
                    <span>Continue & Send Code</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </form>

            <!-- TAB B: REGISTER STEP 2 (Enter OTP Code) -->
            <form id="registerStep2Form" onsubmit="handleVerifyOtp(event)" class="hidden space-y-4">
                <div class="text-center py-2">
                    <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <h3 class="text-sm font-semibold text-white">Check your email</h3>
                    <p class="text-xs text-neutral-400 mt-1">We sent a 6-digit verification code to <span id="displayOtpEmail" class="text-purple-300 font-medium"></span></p>
                </div>

                <div>
                    <label class="block text-center text-xs font-medium text-neutral-300 mb-2">Enter Verification Code</label>
                    <input type="text" id="otpInput" required maxlength="6" pattern="[0-9]{6}" placeholder="123456" class="input-dark w-full px-4 py-3 rounded-xl text-center text-lg font-mono tracking-[0.5em] placeholder-neutral-600 focus:tracking-[0.5em]">
                </div>

                <div id="regStep2Error" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-center"></div>

                <button type="submit" id="btnVerifyOtp" class="btn-gradient w-full py-2.5 rounded-xl text-xs font-semibold text-white tracking-wide shadow-md flex items-center justify-center gap-2">
                    <span>Verify & Enter Portal</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                </button>

                <div class="flex items-center justify-between text-xs pt-1">
                    <button type="button" onclick="backToStep1()" class="text-neutral-400 hover:text-white transition">← Change details</button>
                    <button type="button" id="btnResendOtp" onclick="resendOtpCode()" class="text-purple-400 hover:text-purple-300 font-medium transition">Resend code</button>
                </div>
            </form>
        </div>
    </div>


    <!-- ============================================================ -->
    <!-- 2. CUSTOMER DASHBOARD PANEL (SHOWN WHEN LOGGED IN) -->
    <!-- ============================================================ -->
    <div id="portalView" class="hidden min-h-screen flex flex-col">
        <!-- TOP NAVIGATION BAR -->
        <header class="h-16 border-b border-purple-500/20 bg-[#09070f]/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-900 to-purple-600/40 border border-purple-500/30 flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <div>
                    <span class="font-bold text-sm tracking-tight text-white">UDvengers</span>
                    <span class="ml-2 text-[11px] font-semibold text-purple-400 font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">Customer</span>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <!-- Cheat Status Indicator -->
                <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-medium">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span id="headerStatusText">Undetected • v2.4.1</span>
                </div>

                <!-- User Dropdown & Logout -->
                <div class="flex items-center gap-2 pl-2 border-l border-neutral-800">
                    <div class="text-right hidden md:block">
                        <div id="headerUserEmail" class="text-xs font-semibold text-neutral-200">user@email.com</div>
                        <div class="text-[10px] text-neutral-500 font-mono">Verified Customer</div>
                    </div>
                    <button onclick="handleLogout()" class="p-2 rounded-xl bg-neutral-900/80 border border-purple-500/20 text-neutral-400 hover:text-rose-400 hover:border-rose-500/40 transition" title="Log Out">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </div>
            </div>
        </header>

        <!-- MAIN LAYOUT -->
        <div class="flex-1 max-w-6xl w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-6">

            <!-- SIDEBAR TABS -->
            <aside class="w-full lg:w-56 shrink-0 flex flex-row lg:flex-col gap-1.5 bg-[#0e0a17]/60 p-2 rounded-2xl border border-purple-500/15 overflow-x-auto">
                <button onclick="switchPortalTab('dashboard')" id="pTabDashboard" class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600/90 shadow-sm transition shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    <span>Dashboard</span>
                </button>

                <button onclick="switchPortalTab('downloads')" id="pTabDownloads" class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>Downloads</span>
                </button>

                <button onclick="switchPortalTab('hwid')" id="pTabHwid" class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    <span>HWID Reset</span>
                </button>

                <button onclick="switchPortalTab('guide')" id="pTabGuide" class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    <span>Setup Guide</span>
                </button>
            </aside>

            <!-- TAB CONTENT AREA -->
            <main class="flex-1 min-w-0 space-y-6">

                <!-- 1. TAB: DASHBOARD OVERVIEW -->
                <div id="contentDashboard" class="space-y-6">
                    <!-- Top Welcome & Hero Banner -->
                    <div class="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div class="relative z-10">
                            <span class="text-[11px] font-semibold uppercase tracking-wider text-purple-400 font-mono">Customer Access</span>
                            <h2 class="text-xl font-bold text-white mt-1">Fortnite External <span class="text-purple-400">UDvengers</span></h2>
                            <p class="text-xs text-neutral-400 mt-1">Kernel driver streamed directly to memory. Streamproof with zero on-disk footprint.</p>
                        </div>
                        <a href="/assets/Loader.exe" download="Loader.exe" class="btn-gradient relative z-10 px-5 py-3 rounded-xl text-xs font-semibold text-white shadow-lg flex items-center gap-2 shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span>Download Loader.exe</span>
                        </a>
                    </div>

                    <!-- Grid: License Card + System Status -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <!-- License Details Card -->
                        <div class="glass-panel rounded-2xl p-6 space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                                    <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
                                    License Subscription
                                </h3>
                                <span id="dashLicenseBadge" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                            </div>

                            <!-- Masked Key Display -->
                            <div class="bg-[#100c1a] border border-purple-500/25 rounded-xl p-3.5 flex items-center justify-between">
                                <div>
                                    <span class="text-[10px] text-neutral-500 font-mono block">YOUR LICENSE KEY</span>
                                    <span id="dashKeyText" class="text-xs font-mono text-neutral-200 tracking-wider">••••••••••••••••••••••••</span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <button onclick="toggleKeyVisibility()" class="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition" title="Show/Hide">
                                        <svg id="eyeIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                    </button>
                                    <button onclick="copyLicenseKey()" class="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-purple-300 transition" title="Copy Key">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Subscription Duration & Expiry -->
                            <div class="grid grid-cols-2 gap-3 text-xs">
                                <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3">
                                    <span class="text-neutral-500 text-[10px] block">DURATION</span>
                                    <span id="dashDuration" class="text-white font-semibold">Lifetime</span>
                                </div>
                                <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3">
                                    <span class="text-neutral-500 text-[10px] block">EXPIRES</span>
                                    <span id="dashExpires" class="text-white font-semibold">Never</span>
                                </div>
                            </div>

                            <!-- HWID Status -->
                            <div class="flex items-center justify-between text-xs pt-1 border-t border-neutral-800">
                                <span class="text-neutral-400">Bound Hardware (HWID):</span>
                                <span id="dashHwid" class="font-mono text-purple-300">Unbound</span>
                            </div>
                        </div>

                        <!-- System & Cheat Status Card -->
                        <div class="glass-panel rounded-2xl p-6 space-y-4">
                            <h3 class="text-sm font-bold text-white flex items-center gap-2">
                                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                System Integrity & Status
                            </h3>

                            <div class="space-y-2.5 text-xs">
                                <div class="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                                    <span class="text-neutral-400">Cheat Detection Status</span>
                                    <span class="text-emerald-400 font-semibold font-mono flex items-center gap-1.5">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Undetected
                                    </span>
                                </div>
                                <div class="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                                    <span class="text-neutral-400">Anticheat Engine</span>
                                    <span class="text-neutral-200 font-mono">EAC / BattlEye Bypassed</span>
                                </div>
                                <div class="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                                    <span class="text-neutral-400">Streamproof Overlay</span>
                                    <span class="text-purple-300 font-mono">OBS & Discord Hidden</span>
                                </div>
                                <div class="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                                    <span class="text-neutral-400">Current Game Version</span>
                                    <span class="text-neutral-200 font-mono">v32.10 Supported</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- 2. TAB: DOWNLOADS & SETUP -->
                <div id="contentDownloads" class="hidden space-y-6">
                    <div class="glass-panel rounded-2xl p-6 space-y-6">
                        <div>
                            <h3 class="text-base font-bold text-white">Client Loader Downloads</h3>
                            <p class="text-xs text-neutral-400 mt-1">Download the official Amethyst Loader binary. Always run as Administrator.</p>
                        </div>

                        <!-- Main Download Card -->
                        <div class="glass-card rounded-2xl p-5 border border-purple-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-bold text-white font-mono">Loader.exe</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">Release Build</span>
                                </div>
                                <p class="text-xs text-neutral-400">SHA256: <span class="font-mono text-[11px] text-neutral-500">4CAEAD5C45648155CA8AB0A4B249...</span></p>
                            </div>
                            <a href="/assets/Loader.exe" download="Loader.exe" class="btn-gradient px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md flex items-center gap-2 shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                <span>Download (8.2 MB)</span>
                            </a>
                        </div>

                        <!-- Hotkey Info Box -->
                        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                            <h4 class="text-xs font-semibold text-white mb-2">Default Menu Controls</h4>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                <div class="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800">
                                    <span class="text-neutral-500 text-[10px] block">TOGGLE MENU</span>
                                    <span class="font-mono font-semibold text-purple-300">INSERT</span>
                                </div>
                                <div class="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800">
                                    <span class="text-neutral-500 text-[10px] block">EMERGENCY EXIT</span>
                                    <span class="font-mono font-semibold text-rose-400">END</span>
                                </div>
                                <div class="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800">
                                    <span class="text-neutral-500 text-[10px] block">AIMBOT BIND</span>
                                    <span class="font-mono font-semibold text-purple-300">RIGHT CLICK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- 3. TAB: HWID RESET -->
                <div id="contentHwid" class="hidden space-y-6">
                    <div class="glass-panel rounded-2xl p-6 space-y-5">
                        <div>
                            <h3 class="text-base font-bold text-white">Hardware ID (HWID) Management</h3>
                            <p class="text-xs text-neutral-400 mt-1">If you upgraded PC components or reinstalled Windows, reset your HWID below.</p>
                        </div>

                        <div class="bg-neutral-900/60 border border-purple-500/20 rounded-2xl p-5 space-y-4">
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-neutral-400">Currently Linked Hardware:</span>
                                <span id="hwidCurrentDisplay" class="font-mono text-purple-300 font-semibold">Unbound</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-neutral-400">Reset Policy:</span>
                                <span class="text-neutral-300">1 Reset per 24 Hours</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-neutral-400">Cooldown Status:</span>
                                <span id="hwidCooldownDisplay" class="text-emerald-400 font-semibold font-mono">Available Now</span>
                            </div>

                            <button onclick="requestHwidReset()" id="btnResetHwid" class="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                <span>Reset HWID Now</span>
                            </button>
                        </div>

                        <div class="text-[11px] text-neutral-500 space-y-1">
                            <p>• After resetting, simply launch the Loader on your new PC and your HWID will rebind automatically.</p>
                            <p>• Account sharing or frequent HWID resets are monitored and may result in an automated ban.</p>
                        </div>
                    </div>
                </div>


                <!-- 4. TAB: SETUP GUIDE -->
                <div id="contentGuide" class="hidden space-y-6">
                    <div class="glass-panel rounded-2xl p-6 space-y-6">
                        <div>
                            <h3 class="text-base font-bold text-white">Fast Setup & Injection Guide</h3>
                            <p class="text-xs text-neutral-400 mt-1">Follow these steps carefully to ensure 100% clean and undetected injection.</p>
                        </div>

                        <div class="space-y-4">
                            <!-- Step 1 -->
                            <div class="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                                <div class="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">1</div>
                                <div>
                                    <h4 class="text-xs font-semibold text-white">Disable Windows Defender & Antivirus</h4>
                                    <p class="text-xs text-neutral-400 mt-0.5">Turn off Real-time Protection or add your Loader folder to the Exclusions list. Custom game drivers get falsely flagged by generic heuristic scanners.</p>
                                </div>
                            </div>

                            <!-- Step 2 -->
                            <div class="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                                <div class="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">2</div>
                                <div>
                                    <h4 class="text-xs font-semibold text-white">Run Loader.exe as Administrator</h4>
                                    <p class="text-xs text-neutral-400 mt-0.5">Right-click <span class="font-mono text-purple-300">Loader.exe</span> and select <strong>Run as administrator</strong>.</p>
                                </div>
                            </div>

                            <!-- Step 3 -->
                            <div class="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                                <div class="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">3</div>
                                <div>
                                    <h4 class="text-xs font-semibold text-white">Enter Your License Key</h4>
                                    <p class="text-xs text-neutral-400 mt-0.5">Paste your key from the Dashboard. The loader will perform a zero-knowledge handshake with our server and stream the driver into kernel memory.</p>
                                </div>
                            </div>

                            <!-- Step 4 -->
                            <div class="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                                <div class="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">4</div>
                                <div>
                                    <h4 class="text-xs font-semibold text-white">Launch Fortnite & Press INSERT</h4>
                                    <p class="text-xs text-neutral-400 mt-0.5">When the loader displays "Waiting for Fortnite", launch the game. In the lobby or match, press <span class="font-mono text-purple-300">INSERT</span> to toggle the menu.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    </div>

    <!-- CLIENT LOGIC SCRIPT -->
    <script>
        let currentCustomer = null;
        let currentLicense = null;
        let isKeyVisible = false;
        let pendingRegData = null;

        function showToast(msg, isError = false) {
            const toast = document.getElementById('toast');
            const dot = document.getElementById('toastDot');
            const txt = document.getElementById('toastMsg');
            if (!toast) return;

            txt.textContent = msg;
            dot.className = isError ? 'w-2 h-2 rounded-full bg-rose-500 shrink-0' : 'w-2 h-2 rounded-full bg-emerald-400 shrink-0';
            toast.className = 'fixed top-5 right-5 z-50 transform translate-y-0 opacity-100 pointer-events-auto transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-900/95 border ' + (isError ? 'border-rose-500/40 text-rose-200' : 'border-purple-500/30 text-neutral-100') + ' text-xs shadow-2xl';

            setTimeout(() => {
                toast.className = 'fixed top-5 right-5 z-50 transform -translate-y-12 opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-900/95 border border-purple-500/30 text-neutral-100 text-xs shadow-2xl';
            }, 3000);
        }

        function switchAuthTab(tab) {
            const btnIn = document.getElementById('tabSignInBtn');
            const btnReg = document.getElementById('tabRegisterBtn');
            const formIn = document.getElementById('signInForm');
            const formReg1 = document.getElementById('registerStep1Form');
            const formReg2 = document.getElementById('registerStep2Form');

            if (tab === 'signin') {
                btnIn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-white bg-purple-600 shadow-sm';
                btnReg.className = 'flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-neutral-400 hover:text-white';
                formIn.classList.remove('hidden');
                formReg1.classList.add('hidden');
                formReg2.classList.add('hidden');
            } else {
                btnReg.className = 'flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-white bg-purple-600 shadow-sm';
                btnIn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-neutral-400 hover:text-white';
                formIn.classList.add('hidden');
                formReg1.classList.remove('hidden');
                formReg2.classList.add('hidden');
            }
        }

        function backToStep1() {
            document.getElementById('registerStep2Form').classList.add('hidden');
            document.getElementById('registerStep1Form').classList.remove('hidden');
        }

        async function handleRequestOtp(e) {
            e.preventDefault();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const key = document.getElementById('regKey').value.trim();
            const errBox = document.getElementById('regStep1Error');
            const btn = document.getElementById('btnRequestOtp');

            errBox.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Validating key...';

            try {
                const res = await fetch('/api/customer/register/request-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, key })
                });
                const data = await res.json();

                if (!res.ok || !data.success) {
                    errBox.textContent = data.message || 'Validation failed.';
                    errBox.classList.remove('hidden');
                    return;
                }

                pendingRegData = { email, password, key };
                document.getElementById('displayOtpEmail').textContent = email;
                document.getElementById('registerStep1Form').classList.add('hidden');
                document.getElementById('registerStep2Form').classList.remove('hidden');
                document.getElementById('otpInput').focus();

                showToast(data.message || 'Verification code sent to your email!');
            } catch (err) {
                errBox.textContent = 'Network error: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Continue & Send Code</span><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>';
            }
        }

        async function handleVerifyOtp(e) {
            e.preventDefault();
            const code = document.getElementById('otpInput').value.trim();
            const errBox = document.getElementById('regStep2Error');
            const btn = document.getElementById('btnVerifyOtp');

            if (!pendingRegData || !code) return;

            errBox.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Creating account...';

            try {
                const res = await fetch('/api/customer/register/verify-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: pendingRegData.email, code })
                });
                const data = await res.json();

                if (!res.ok || !data.success) {
                    errBox.textContent = data.message || 'Invalid code.';
                    errBox.classList.remove('hidden');
                    return;
                }

                showToast('Account verified! Welcome to the portal.');
                await loadCustomerPortal();
            } catch (err) {
                errBox.textContent = 'Network error: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Verify & Enter Portal</span><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>';
            }
        }

        async function resendOtpCode() {
            if (!pendingRegData) return;
            const btn = document.getElementById('btnResendOtp');
            btn.disabled = true;
            btn.textContent = 'Sending...';

            try {
                const res = await fetch('/api/customer/register/request-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pendingRegData)
                });
                const data = await res.json();
                if (data.success) {
                    showToast('New code sent to your email!');
                } else {
                    showToast(data.message || 'Failed to resend code', true);
                }
            } catch (e) {
                showToast('Failed to resend: ' + e.message, true);
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = 'Resend code';
                }, 10000);
            }
        }

        async function handleSignIn(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const errBox = document.getElementById('loginError');
            const btn = document.getElementById('btnSignInSubmit');

            errBox.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Signing in...';

            try {
                const res = await fetch('/api/customer/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (!res.ok || !data.success) {
                    errBox.textContent = data.message || 'Invalid email or password.';
                    errBox.classList.remove('hidden');
                    return;
                }

                showToast('Signed in successfully.');
                await loadCustomerPortal();
            } catch (err) {
                errBox.textContent = 'Network error: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Sign In</span><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>';
            }
        }

        async function handleLogout() {
            try {
                await fetch('/api/customer/logout', { method: 'POST' });
            } catch (_) {}
            window.location.reload();
        }

        function switchPortalTab(tab) {
            const tabs = ['dashboard', 'downloads', 'hwid', 'guide'];
            tabs.forEach(t => {
                const btn = document.getElementById('pTab' + t.charAt(0).toUpperCase() + t.slice(1));
                const content = document.getElementById('content' + t.charAt(0).toUpperCase() + t.slice(1));
                if (t === tab) {
                    btn.className = 'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600/90 shadow-sm transition shrink-0';
                    content.classList.remove('hidden');
                } else {
                    btn.className = 'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition shrink-0';
                    content.classList.add('hidden');
                }
            });
        }

        function toggleKeyVisibility() {
            const keyEl = document.getElementById('dashKeyText');
            if (!currentLicense) return;
            isKeyVisible = !isKeyVisible;
            if (isKeyVisible) {
                keyEl.textContent = currentLicense.key;
            } else {
                keyEl.textContent = '••••••••••••••••••••••••';
            }
        }

        function copyLicenseKey() {
            if (!currentLicense || !currentLicense.key) return;
            navigator.clipboard.writeText(currentLicense.key).then(() => {
                showToast('License key copied to clipboard!');
            }).catch(() => {
                prompt('Copy key:', currentLicense.key);
            });
        }

        async function requestHwidReset() {
            const btn = document.getElementById('btnResetHwid');
            if (!confirm('Are you sure you want to reset your HWID? This will allow you to bind a new hardware configuration.')) return;

            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Resetting HWID...';

            try {
                const res = await fetch('/api/customer/hwid-reset', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    showToast('HWID reset successful!');
                    await loadCustomerPortal();
                } else {
                    showToast(data.message || 'HWID reset cooldown active', true);
                }
            } catch (err) {
                showToast('Network error: ' + err.message, true);
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Reset HWID Now</span>';
            }
        }

        async function loadCustomerPortal() {
            try {
                const res = await fetch('/api/customer/me');
                if (!res.ok) {
                    // Not authenticated -> show Auth View
                    document.getElementById('authView').classList.remove('hidden');
                    document.getElementById('portalView').classList.add('hidden');
                    return;
                }

                const data = await res.json();
                if (!data || !data.success) {
                    document.getElementById('authView').classList.remove('hidden');
                    document.getElementById('portalView').classList.add('hidden');
                    return;
                }

                currentCustomer = data.customer;
                currentLicense = data.license;

                // Populate Header
                document.getElementById('headerUserEmail').textContent = currentCustomer.email;

                // Populate Dashboard Key & License
                const keyEl = document.getElementById('dashKeyText');
                keyEl.textContent = '••••••••••••••••••••••••';
                isKeyVisible = false;

                const isLifetime = !currentLicense.expires_at || currentLicense.duration_days === 0;
                document.getElementById('dashDuration').textContent = isLifetime ? 'Lifetime' : currentLicense.duration_days + ' Days';

                if (isLifetime) {
                    document.getElementById('dashExpires').textContent = 'Never (Permanent)';
                } else {
                    document.getElementById('dashExpires').textContent = new Date(currentLicense.expires_at).toLocaleDateString();
                }

                const hwidText = currentLicense.hwid ? (currentLicense.hwid.substring(0, 12) + '...') : 'Unbound';
                document.getElementById('dashHwid').textContent = hwidText;
                document.getElementById('hwidCurrentDisplay').textContent = currentLicense.hwid || 'Unbound (Ready to link)';

                // HWID Cooldown calculation (24h)
                const lastReset = currentLicense.hwid_last_reset || 0;
                const now = Date.now();
                const cooldownMs = 24 * 60 * 60 * 1000;
                const cooldownEl = document.getElementById('hwidCooldownDisplay');
                const resetBtn = document.getElementById('btnResetHwid');

                if (now - lastReset < cooldownMs) {
                    const remainingHours = Math.ceil((cooldownMs - (now - lastReset)) / (60 * 60 * 1000));
                    cooldownEl.textContent = 'Cooldown Active (' + remainingHours + 'h remaining)';
                    cooldownEl.className = 'text-amber-400 font-semibold font-mono';
                    resetBtn.disabled = true;
                    resetBtn.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    cooldownEl.textContent = 'Available Now';
                    cooldownEl.className = 'text-emerald-400 font-semibold font-mono';
                    resetBtn.disabled = false;
                    resetBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }

                // Show Portal, Hide Auth
                document.getElementById('authView').classList.add('hidden');
                document.getElementById('portalView').classList.remove('hidden');

            } catch (err) {
                console.error('Failed to load customer portal:', err);
                document.getElementById('authView').classList.remove('hidden');
                document.getElementById('portalView').classList.add('hidden');
            }
        }

        // Initialize on page load
        window.addEventListener('DOMContentLoaded', loadCustomerPortal);
    </script>
</body>
</html>`;