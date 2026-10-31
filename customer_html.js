export const CUSTOMER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UDvengers • Customer Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #07070a;
            color: #ececed;
            letter-spacing: -0.01em;
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
        }
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
        .panel {
            background: #0f0d17;
            border: 1px solid rgba(168, 85, 247, 0.16);
            border-radius: 14px;
        }
        .input-field {
            background: #0b0912;
            border: 1px solid rgba(168, 85, 247, 0.22);
            color: #ffffff;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .input-field:focus {
            outline: none;
            border-color: #a855f7;
            box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.35);
        }
        .btn-primary {
            background: #9333ea;
            color: #ffffff;
            transition: background 0.15s ease, opacity 0.15s ease;
        }
        .btn-primary:hover {
            background: #a855f7;
        }
        .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    </style>
</head>
<body class="selection:bg-purple-900/60 selection:text-white flex flex-col justify-between">

    <!-- TOAST NOTIFICATION CONTAINER -->
    <div id="toast" class="fixed top-5 right-5 z-50 transform -translate-y-12 opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-neutral-900 border border-purple-500/30 text-neutral-100 text-xs shadow-2xl">
        <span id="toastDot" class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span id="toastMsg">Notification</span>
    </div>

    <!-- ============================================================ -->
    <!-- 1. AUTH MODAL VIEW (SHOWN IF USER IS NOT LOGGED IN) -->
    <!-- ============================================================ -->
    <div id="authView" class="hidden min-h-screen flex items-center justify-center p-4">
        <div class="panel w-full max-w-sm p-6 relative overflow-hidden">

            <!-- Brand Header -->
            <div class="text-center mb-6">
                <div class="inline-flex items-center gap-2 mb-1">
                    <span class="font-bold text-base tracking-tight text-white">UDvengers</span>
                    <span class="text-[10px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">Customer</span>
                </div>
                <p class="text-xs text-neutral-400">Sign in or register your license key.</p>
            </div>

            <!-- Tab Switcher: Sign In / Register -->
            <div class="flex p-1 bg-neutral-900/80 rounded-lg border border-neutral-800 mb-5">
                <button type="button" id="tabSignInBtn" onclick="switchAuthTab('signin')" class="flex-1 py-1.5 text-xs font-medium rounded-md transition text-white bg-purple-600/90 shadow-sm">
                    Sign In
                </button>
                <button type="button" id="tabRegisterBtn" onclick="switchAuthTab('register')" class="flex-1 py-1.5 text-xs font-medium rounded-md transition text-neutral-400 hover:text-white">
                    Register Key
                </button>
            </div>

            <!-- TAB A: SIGN IN FORM -->
            <form id="signInForm" onsubmit="handleSignIn(event)" class="space-y-3.5">
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">Email</label>
                    <input type="email" id="loginEmail" required placeholder="you@domain.com" class="input-field w-full px-3 py-2 rounded-lg text-xs placeholder-neutral-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">Password</label>
                    <input type="password" id="loginPassword" required placeholder="••••••••••••" class="input-field w-full px-3 py-2 rounded-lg text-xs placeholder-neutral-500">
                </div>

                <div id="loginError" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5"></div>

                <button type="submit" id="btnSignInSubmit" class="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 mt-2">
                    <span>Sign In</span>
                </button>
            </form>

            <!-- TAB B: REGISTER STEP 1 (Email, Discord ID, Password, Key) -->
            <form id="registerStep1Form" onsubmit="handleRequestOtp(event)" class="hidden space-y-3.5">
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">Email</label>
                    <input type="email" id="regEmail" required placeholder="you@domain.com" class="input-field w-full px-3 py-2 rounded-lg text-xs placeholder-neutral-500">
                </div>
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="text-xs font-medium text-neutral-300">Discord User ID</label>
                        <span class="text-[10px] text-neutral-500">For server roles</span>
                    </div>
                    <input type="text" id="regDiscordId" required placeholder="e.g. 1415022792214052915" class="input-field w-full px-3 py-2 rounded-lg text-xs font-mono placeholder-neutral-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">Password</label>
                    <input type="password" id="regPassword" required minlength="6" placeholder="At least 6 characters" class="input-field w-full px-3 py-2 rounded-lg text-xs placeholder-neutral-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">License Key</label>
                    <input type="text" id="regKey" required placeholder="LIFETIME-XXXX-XXXX-XXXX" class="input-field w-full px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider placeholder-neutral-500">
                </div>

                <div id="regStep1Error" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5"></div>

                <button type="submit" id="btnRequestOtp" class="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 mt-2">
                    <span>Continue & Send Code</span>
                </button>
            </form>

            <!-- TAB B: REGISTER STEP 2 (Enter OTP Code) -->
            <form id="registerStep2Form" onsubmit="handleVerifyOtp(event)" class="hidden space-y-4">
                <div class="text-center py-1">
                    <h3 class="text-xs font-semibold text-white">Verification Code Sent</h3>
                    <p class="text-[11px] text-neutral-400 mt-1">Check your inbox at <span id="displayOtpEmail" class="text-purple-300 font-medium"></span></p>
                </div>

                <div>
                    <input type="text" id="otpInput" required maxlength="6" pattern="[0-9]{6}" placeholder="123456" class="input-field w-full px-4 py-2.5 rounded-lg text-center text-lg font-mono tracking-[0.4em] placeholder-neutral-600 focus:tracking-[0.4em]">
                </div>

                <div id="regStep2Error" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-center"></div>

                <button type="submit" id="btnVerifyOtp" class="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5">
                    <span>Verify & Enter Portal</span>
                </button>

                <div class="flex items-center justify-between text-[11px] pt-1">
                    <button type="button" onclick="backToStep1()" class="text-neutral-400 hover:text-white transition">← Change details</button>
                    <button type="button" id="btnResendOtp" onclick="resendOtpCode()" class="text-purple-400 hover:text-purple-300 transition">Resend code</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ============================================================ -->
    <!-- 2. CUSTOMER DASHBOARD PANEL (SHOWN WHEN LOGGED IN) -->
    <!-- ============================================================ -->
    <div id="portalView" class="hidden min-h-screen flex flex-col">
        <!-- TOP NAVIGATION BAR -->
        <header class="border-b border-neutral-800 bg-[#09080e]/90 backdrop-blur-md sticky top-0 z-30">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-sm tracking-tight text-white">UDvengers</span>
                    <span class="text-[10px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">Customer</span>
                </div>

                <!-- User Email & Minimalist Logout -->
                <div class="flex items-center gap-3">
                    <span id="headerUserEmail" class="text-xs text-neutral-300 font-medium">user@email.com</span>
                    <span class="text-neutral-700">•</span>
                    <button onclick="handleLogout()" class="text-xs text-neutral-400 hover:text-rose-400 transition">Log out</button>
                </div>
            </div>

            <!-- SUB-NAV: SLEEK HORIZONTAL TABS -->
            <div class="border-t border-neutral-800/60 bg-[#07060b]">
                <div class="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1.5">
                    <button onclick="switchPortalTab('dashboard')" id="pTabDashboard" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-purple-600/25 border border-purple-500/40 transition shrink-0">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        <span>Dashboard</span>
                    </button>
                    <button onclick="switchPortalTab('downloads')" id="pTabDownloads" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-400 hover:text-white transition shrink-0">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        <span>Downloads</span>
                    </button>
                    <button onclick="switchPortalTab('hwid')" id="pTabHwid" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-400 hover:text-white transition shrink-0">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <span>HWID Reset</span>
                    </button>
                    <button onclick="switchPortalTab('guide')" id="pTabGuide" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-400 hover:text-white transition shrink-0">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        <span>Setup Guide</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- MAIN LAYOUT -->
        <main class="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5 flex-1">

            <!-- 1. TAB: DASHBOARD OVERVIEW -->
            <div id="contentDashboard" class="space-y-4">
                <div class="panel p-5 space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-neutral-800">
                        <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Active License</h3>
                        <span id="dashLicenseBadge" class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                    </div>

                    <!-- Masked Key Display -->
                    <div class="bg-[#0b0912] border border-neutral-800 rounded-lg p-3.5 flex items-center justify-between">
                        <div>
                            <span class="text-[10px] text-neutral-500 block mb-0.5">KEY</span>
                            <span id="dashKeyText" class="text-xs font-mono text-neutral-200 tracking-wider">••••••••••••••••••••••••</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <button onclick="toggleKeyVisibility()" class="p-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition" title="Show/Hide">
                                <svg id="eyeIcon" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </button>
                            <button onclick="copyLicenseKey()" class="p-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-purple-300 transition" title="Copy Key">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Subscription Details Grid -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                        <div class="bg-neutral-900/40 border border-neutral-800/80 rounded-lg p-3">
                            <span class="text-neutral-500 text-[10px] block mb-0.5">DURATION</span>
                            <span id="dashDuration" class="text-white font-medium">Lifetime</span>
                        </div>
                        <div class="bg-neutral-900/40 border border-neutral-800/80 rounded-lg p-3">
                            <span class="text-neutral-500 text-[10px] block mb-0.5">EXPIRES</span>
                            <span id="dashExpires" class="text-white font-medium">Never</span>
                        </div>
                        <div class="bg-neutral-900/40 border border-neutral-800/80 rounded-lg p-3">
                            <span class="text-neutral-500 text-[10px] block mb-0.5">DISCORD ID</span>
                            <span id="dashDiscordId" class="font-mono text-purple-300 text-xs truncate block">Linked</span>
                        </div>
                        <div class="bg-neutral-900/40 border border-neutral-800/80 rounded-lg p-3">
                            <span class="text-neutral-500 text-[10px] block mb-0.5">HARDWARE (HWID)</span>
                            <span id="dashHwid" class="font-mono text-neutral-300 text-xs truncate block">Unbound</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. TAB: DOWNLOADS -->
            <div id="contentDownloads" class="hidden space-y-4">
                <div class="panel p-5 space-y-4">
                    <div class="border-b border-neutral-800 pb-3">
                        <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Client Download</h3>
                        <p class="text-xs text-neutral-400 mt-0.5">Run as Administrator on Windows 10/11.</p>
                    </div>

                    <div class="bg-[#0b0912] border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-semibold text-white font-mono">Loader.exe</span>
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">Release</span>
                            </div>
                            <p class="text-xs text-neutral-400 mt-0.5">64-bit Executable • Size: 8.2 MB</p>
                        </div>
                        <a href="/assets/Loader.exe" download="Loader.exe" class="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shrink-0">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span>Download Loader</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- 3. TAB: HWID RESET -->
            <div id="contentHwid" class="hidden space-y-4">
                <div class="panel p-5 space-y-4">
                    <div class="border-b border-neutral-800 pb-3">
                        <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Hardware Management</h3>
                        <p class="text-xs text-neutral-400 mt-0.5">Reset your hardware link once every 24 hours.</p>
                    </div>

                    <div class="bg-[#0b0912] border border-neutral-800 rounded-lg p-4 space-y-3 text-xs">
                        <div class="flex items-center justify-between">
                            <span class="text-neutral-400">Current HWID:</span>
                            <span id="hwidCurrentDisplay" class="font-mono text-purple-300">Unbound</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-neutral-400">Status:</span>
                            <span id="hwidCooldownDisplay" class="text-emerald-400 font-medium">Available</span>
                        </div>

                        <div class="pt-2">
                            <button onclick="requestHwidReset()" id="btnResetHwid" class="w-full py-2.5 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-semibold transition">
                                Reset Hardware Link
                            </button>
                        </div>
                    </div>

                    <p class="text-[11px] text-neutral-500">Launching the Loader on your new PC will automatically bind your hardware configuration.</p>
                </div>
            </div>

            <!-- 4. TAB: SETUP GUIDE -->
            <div id="contentGuide" class="hidden space-y-4">
                <div class="panel p-5 space-y-4">
                    <div class="border-b border-neutral-800 pb-3">
                        <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Setup Instructions</h3>
                        <p class="text-xs text-neutral-400 mt-0.5">Follow these 3 quick steps to run the client.</p>
                    </div>

                    <div class="space-y-3">
                        <div class="flex items-start gap-3 p-3.5 rounded-lg bg-[#0b0912] border border-neutral-800">
                            <span class="w-5 h-5 rounded bg-purple-500/10 text-purple-400 text-xs font-semibold flex items-center justify-center shrink-0 border border-purple-500/20">1</span>
                            <div>
                                <div class="text-xs font-medium text-white">Extract & Exclude</div>
                                <div class="text-xs text-neutral-400 mt-0.5">Download Loader.exe and place it in a designated folder or USB drive. Add the folder to your antivirus exclusions.</div>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 p-3.5 rounded-lg bg-[#0b0912] border border-neutral-800">
                            <span class="w-5 h-5 rounded bg-purple-500/10 text-purple-400 text-xs font-semibold flex items-center justify-center shrink-0 border border-purple-500/20">2</span>
                            <div>
                                <div class="text-xs font-medium text-white">Run as Administrator</div>
                                <div class="text-xs text-neutral-400 mt-0.5">Right-click <span class="text-purple-300 font-mono">Loader.exe</span> and click <strong>Run as administrator</strong>.</div>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 p-3.5 rounded-lg bg-[#0b0912] border border-neutral-800">
                            <span class="w-5 h-5 rounded bg-purple-500/10 text-purple-400 text-xs font-semibold flex items-center justify-center shrink-0 border border-purple-500/20">3</span>
                            <div>
                                <div class="text-xs font-medium text-white">Activate & Launch Game</div>
                                <div class="text-xs text-neutral-400 mt-0.5">Paste your license key. Once the loader prompts, start Fortnite and press <kbd class="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-purple-300 font-mono text-[10px]">INSERT</kbd> in-game.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
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
            toast.className = 'fixed top-5 right-5 z-50 transform translate-y-0 opacity-100 pointer-events-auto transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-neutral-900 border ' + (isError ? 'border-rose-500/40 text-rose-200' : 'border-purple-500/30 text-neutral-100') + ' text-xs shadow-2xl';

            setTimeout(() => {
                toast.className = 'fixed top-5 right-5 z-50 transform -translate-y-12 opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-neutral-900 border border-purple-500/30 text-neutral-100 text-xs shadow-2xl';
            }, 3000);
        }

        function switchAuthTab(tab) {
            const btnIn = document.getElementById('tabSignInBtn');
            const btnReg = document.getElementById('tabRegisterBtn');
            const formIn = document.getElementById('signInForm');
            const formReg1 = document.getElementById('registerStep1Form');
            const formReg2 = document.getElementById('registerStep2Form');

            if (tab === 'signin') {
                btnIn.className = 'flex-1 py-1.5 text-xs font-medium rounded-md transition text-white bg-purple-600/90 shadow-sm';
                btnReg.className = 'flex-1 py-1.5 text-xs font-medium rounded-md transition text-neutral-400 hover:text-white';
                formIn.classList.remove('hidden');
                formReg1.classList.add('hidden');
                formReg2.classList.add('hidden');
            } else {
                btnReg.className = 'flex-1 py-1.5 text-xs font-medium rounded-md transition text-white bg-purple-600/90 shadow-sm';
                btnIn.className = 'flex-1 py-1.5 text-xs font-medium rounded-md transition text-neutral-400 hover:text-white';
                formIn.classList.add('hidden');
                formReg1.classList.remove('hidden');
                formReg2.classList.add('hidden');
            }
        }

        function backToStep1() {
            document.getElementById('registerStep1Form').classList.remove('hidden');
            document.getElementById('registerStep2Form').classList.add('hidden');
        }

        async function handleRequestOtp(e) {
            e.preventDefault();
            const email = document.getElementById('regEmail').value.trim();
            const discordId = document.getElementById('regDiscordId').value.trim();
            const password = document.getElementById('regPassword').value;
            const key = document.getElementById('regKey').value.trim();
            const errBox = document.getElementById('regStep1Error');
            const btn = document.getElementById('btnRequestOtp');

            if (!discordId) {
                errBox.textContent = 'Please provide your numeric Discord User ID.';
                errBox.classList.remove('hidden');
                return;
            }

            errBox.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Validating...';

            try {
                const res = await fetch('/api/customer/register/request-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, key, discord_id: discordId })
                });
                const data = await res.json();

                if (!res.ok || !data.success) {
                    errBox.textContent = data.message || 'Validation failed.';
                    errBox.classList.remove('hidden');
                    return;
                }

                pendingRegData = { email, password, key, discord_id: discordId };
                document.getElementById('displayOtpEmail').textContent = email;
                document.getElementById('registerStep1Form').classList.add('hidden');
                document.getElementById('registerStep2Form').classList.remove('hidden');
                document.getElementById('otpInput').focus();

                showToast(data.message || 'Verification code sent to your email.');
            } catch (err) {
                errBox.textContent = 'Network error: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Continue & Send Code</span>';
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
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Verifying...';

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

                showToast('Registration successful! Roles assigned in Discord.');
                await loadCustomerPortal();
            } catch (err) {
                errBox.textContent = 'Network error: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Verify & Enter Portal</span>';
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
                    showToast('New code sent to your email.');
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
                btn.innerHTML = '<span>Sign In</span>';
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
                    btn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-purple-600/25 border border-purple-500/40 transition shrink-0';
                    content.classList.remove('hidden');
                } else {
                    btn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-400 hover:text-white transition shrink-0';
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
                showToast('License key copied to clipboard.');
            }).catch(() => {
                prompt('Copy key:', currentLicense.key);
            });
        }

        async function requestHwidReset() {
            const btn = document.getElementById('btnResetHwid');
            if (!confirm('Are you sure you want to reset your HWID?')) return;

            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Resetting...';

            try {
                const res = await fetch('/api/customer/hwid-reset', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    showToast('HWID reset successfully.');
                    await loadCustomerPortal();
                } else {
                    showToast(data.message || 'HWID reset cooldown active', true);
                }
            } catch (err) {
                showToast('Network error: ' + err.message, true);
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Reset Hardware Link</span>';
            }
        }

        async function loadCustomerPortal() {
            try {
                const res = await fetch('/api/customer/me');
                if (!res.ok) {
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

                // Header
                document.getElementById('headerUserEmail').textContent = currentCustomer.email;

                // License Card
                const keyEl = document.getElementById('dashKeyText');
                keyEl.textContent = '••••••••••••••••••••••••';
                isKeyVisible = false;

                const isLifetime = !currentLicense.expires_at || currentLicense.duration_days === 0;
                document.getElementById('dashDuration').textContent = isLifetime ? 'Lifetime' : currentLicense.duration_days + ' Days';
                document.getElementById('dashExpires').textContent = isLifetime ? 'Never' : new Date(currentLicense.expires_at).toLocaleDateString();

                const hwidText = currentLicense.hwid ? (currentLicense.hwid.substring(0, 10) + '...') : 'Unbound';
                document.getElementById('dashHwid').textContent = hwidText;
                document.getElementById('hwidCurrentDisplay').textContent = currentLicense.hwid || 'Unbound (Ready to link)';

                // Discord ID
                const discordEl = document.getElementById('dashDiscordId');
                if (discordEl) {
                    discordEl.textContent = currentCustomer.discord_id || (currentLicense && currentLicense.discord_id) || 'Linked';
                }

                // HWID Cooldown calculation (24h)
                const lastReset = currentLicense.hwid_last_reset || 0;
                const now = Date.now();
                const cooldownMs = 24 * 60 * 60 * 1000;
                const cooldownEl = document.getElementById('hwidCooldownDisplay');
                const resetBtn = document.getElementById('btnResetHwid');

                if (now - lastReset < cooldownMs) {
                    const remainingHours = Math.ceil((cooldownMs - (now - lastReset)) / (60 * 60 * 1000));
                    cooldownEl.textContent = 'Cooldown (' + remainingHours + 'h remaining)';
                    cooldownEl.className = 'text-amber-400 font-medium font-mono';
                    resetBtn.disabled = true;
                    resetBtn.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    cooldownEl.textContent = 'Available';
                    cooldownEl.className = 'text-emerald-400 font-medium';
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

        window.addEventListener('DOMContentLoaded', loadCustomerPortal);
    </script>
</body>
</html>`;
