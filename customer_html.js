export const CUSTOMER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #07080a;
            color: #f8fafc;
            letter-spacing: -0.01em;
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
        }
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
        .card-dark {
            background: #0f1117;
            border: 1px solid #1e222d;
            border-radius: 14px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .input-dark {
            background: #090a0e;
            border: 1px solid #232735;
            color: #ffffff;
            transition: all 0.15s ease;
        }
        .input-dark:focus {
            outline: none;
            border-color: #ffffff;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
        }
        .btn-saas {
            background-color: #ffffff;
            color: #000000;
            font-weight: 600;
            transition: all 0.15s ease;
        }
        .btn-saas:hover {
            background-color: #e5e5e5;
        }
        .btn-saas:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    </style>
</head>
<body class="selection:bg-white/20 selection:text-white">

    <!-- TOAST NOTIFICATION CONTAINER -->
    <div id="toast" class="fixed top-5 right-5 z-50 transform -translate-y-12 opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#14161f] border border-[#262a38] text-white text-xs shadow-2xl">
        <span id="toastDot" class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span id="toastMsg" class="font-medium">Notification</span>
    </div>

    <!-- ============================================================ -->
    <!-- 1. AUTH MODAL VIEW (PURE BLACK & WHITE MONOCHROME)           -->
    <!-- ============================================================ -->
    <div id="authView" class="hidden min-h-screen bg-[#07080a] flex items-center justify-center p-4">
        <div class="card-dark w-full max-w-sm p-8 shadow-2xl relative bg-[#0f1117]">

            <!-- Title & Logo Header with Witch Hat Icon -->
            <div class="text-center mb-6">
                <div class="inline-flex items-center gap-2 mb-2">
                    <img src="https://cdn.discordapp.com/attachments/1526175746169503854/1566118441050578995/Glossy_Purple_UD_Witch_Hat_Logo.png?ex=6ae760f5&is=6ae60f75&hm=08104390c4e5a763abf9eaa0f48733b84ef7f92f0d06bf7b0d84630bb103f257&" alt="UDvengers" class="w-8 h-8 object-contain">
                    <span class="font-bold text-lg tracking-tight text-white">UDvengers</span>
                </div>
                <h1 id="authTitle" class="text-2xl font-bold text-white tracking-tight">Welcome back!</h1>
                <p id="authSubtitle" class="text-xs text-neutral-400 mt-1">Sign in to your customer dashboard</p>
            </div>

            <!-- Tab Switcher: Log In / Register (Hidden in Reset Mode) -->
            <div id="authTabSwitcher" class="flex p-1 bg-[#090a0e] rounded-lg mb-6 border border-[#1e222d]">
                <button type="button" id="tabSignInBtn" onclick="switchAuthTab('signin')" class="flex-1 py-1.5 text-xs font-semibold rounded-md transition text-white bg-[#181b24] shadow-sm">
                    Log in
                </button>
                <button type="button" id="tabRegisterBtn" onclick="switchAuthTab('register')" class="flex-1 py-1.5 text-xs font-medium rounded-md transition text-neutral-400 hover:text-white">
                    Register
                </button>
            </div>

            <!-- TAB A: SIGN IN FORM (EMAIL & PASSWORD ONLY, NO '?') -->
            <form id="signInForm" onsubmit="handleSignIn(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">Email address</label>
                    <input type="email" id="loginEmail" required placeholder="you@domain.com" class="input-dark w-full px-3.5 py-2.5 rounded-lg text-xs placeholder-neutral-500">
                </div>

                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">Password</label>
                    <div class="flex items-stretch rounded-lg border border-[#232735] focus-within:border-white focus-within:ring-2 focus-within:ring-white/15 bg-[#090a0e] transition overflow-hidden">
                        <input type="password" id="loginPassword" required placeholder="Password" class="w-full px-3.5 py-2.5 text-xs text-white bg-transparent outline-none placeholder-neutral-500">
                        <button type="button" onclick="toggleInputPassword('loginPassword', this)" class="px-3 border-l border-[#232735] text-neutral-400 hover:text-white bg-[#11131a] flex items-center justify-center transition" title="Show/Hide Password">
                            <svg class="w-4 h-4 eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                    </div>
                </div>

                <div id="loginError" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5"></div>

                <button type="submit" id="btnSignInSubmit" class="btn-saas w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide shadow-sm flex items-center justify-center gap-1.5 mt-2">
                    <span>Log in</span>
                </button>

                <div class="text-center pt-2">
                    <span class="text-xs text-neutral-400">Forgot password? </span>
                    <button type="button" onclick="showResetPasswordFlow()" class="text-xs text-white font-medium hover:underline">Reset</button>
                </div>
            </form>

            <!-- TAB B: REGISTER STEP 1 (Email, Discord User ID, Password, License Key) -->
            <form id="registerStep1Form" onsubmit="handleRequestOtp(event)" class="hidden space-y-3.5">
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">Email address</label>
                    <input type="email" id="regEmail" required placeholder="you@domain.com" class="input-dark w-full px-3.5 py-2.5 rounded-lg text-xs placeholder-neutral-500">
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="text-xs font-medium text-neutral-300">Discord User ID</label>
                        <span class="text-[10px] text-neutral-400">For Discord roles</span>
                    </div>
                    <input type="text" id="regDiscordId" required placeholder="e.g. 1415022792214052915" class="input-dark w-full px-3.5 py-2.5 rounded-lg text-xs font-mono placeholder-neutral-500">
                </div>

                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">Password</label>
                    <div class="flex items-stretch rounded-lg border border-[#232735] focus-within:border-white focus-within:ring-2 focus-within:ring-white/15 bg-[#090a0e] transition overflow-hidden">
                        <input type="password" id="regPassword" required minlength="6" placeholder="At least 6 characters" class="w-full px-3.5 py-2.5 text-xs text-white bg-transparent outline-none placeholder-neutral-500">
                        <button type="button" onclick="toggleInputPassword('regPassword', this)" class="px-3 border-l border-[#232735] text-neutral-400 hover:text-white bg-[#11131a] flex items-center justify-center transition">
                            <svg class="w-4 h-4 eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">License Key</label>
                    <input type="text" id="regKey" required placeholder="LIFETIME-XXXX-XXXX-XXXX" class="input-dark w-full px-3.5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider placeholder-neutral-500">
                </div>

                <div id="regStep1Error" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5"></div>

                <button type="submit" id="btnRequestOtp" class="btn-saas w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide shadow-sm flex items-center justify-center gap-1.5 mt-2">
                    <span>Register</span>
                </button>
            </form>

            <!-- TAB B: REGISTER STEP 2 (Enter OTP Code) -->
            <form id="registerStep2Form" onsubmit="handleVerifyOtp(event)" class="hidden space-y-4">
                <div class="text-center py-1">
                    <h3 class="text-xs font-semibold text-white">Verification Code Sent</h3>
                    <p class="text-[11px] text-neutral-400 mt-1">Check your inbox at <span id="displayOtpEmail" class="text-white font-semibold"></span></p>
                </div>

                <div>
                    <input type="text" id="otpInput" required maxlength="6" pattern="[0-9]{6}" placeholder="123456" class="input-dark w-full px-4 py-3 rounded-lg text-center text-lg font-mono tracking-[0.4em] placeholder-neutral-600 focus:tracking-[0.4em]">
                </div>

                <div id="regStep2Error" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-center"></div>

                <button type="submit" id="btnVerifyOtp" class="btn-saas w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide shadow-sm flex items-center justify-center gap-1.5">
                    <span>Verify & Enter Dashboard</span>
                </button>

                <div class="flex items-center justify-between text-[11px] pt-1">
                    <button type="button" onclick="backToStep1()" class="text-neutral-400 hover:text-white transition">← Change details</button>
                    <button type="button" id="btnResendOtp" onclick="resendOtpCode()" class="text-neutral-300 hover:text-white underline font-semibold transition">Resend code</button>
                </div>
            </form>

            <!-- TAB C: RESET PASSWORD STEP 1 (Enter Email) -->
            <form id="resetStep1Form" onsubmit="handleRequestResetCode(event)" class="hidden space-y-4">
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">Your account email</label>
                    <input type="email" id="resetEmail" required placeholder="you@domain.com" class="input-dark w-full px-3.5 py-2.5 rounded-lg text-xs placeholder-neutral-500">
                </div>

                <div id="resetStep1Error" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5"></div>

                <button type="submit" id="btnRequestReset" class="btn-saas w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide shadow-sm flex items-center justify-center gap-1.5 mt-2">
                    <span>Send Reset Code</span>
                </button>

                <div class="text-center pt-2">
                    <button type="button" onclick="cancelResetFlow()" class="text-xs text-neutral-400 hover:text-white transition">← Back to Log in</button>
                </div>
            </form>

            <!-- TAB C: RESET PASSWORD STEP 2 (Code & New Password) -->
            <form id="resetStep2Form" onsubmit="handleVerifyResetCode(event)" class="hidden space-y-4">
                <div class="text-center py-1">
                    <h3 class="text-xs font-semibold text-white">Reset Code Sent</h3>
                    <p class="text-[11px] text-neutral-400 mt-1">We sent a 6-digit code to <span id="displayResetEmail" class="text-white font-semibold"></span></p>
                </div>

                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">6-digit code</label>
                    <input type="text" id="resetOtpInput" required maxlength="6" pattern="[0-9]{6}" placeholder="123456" class="input-dark w-full px-4 py-2.5 rounded-lg text-center text-lg font-mono tracking-[0.3em] placeholder-neutral-600">
                </div>

                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">New password</label>
                    <div class="flex items-stretch rounded-lg border border-[#232735] focus-within:border-white focus-within:ring-2 focus-within:ring-white/15 bg-[#090a0e] transition overflow-hidden">
                        <input type="password" id="resetNewPassword" required minlength="6" placeholder="At least 6 characters" class="w-full px-3.5 py-2.5 text-xs text-white bg-transparent outline-none placeholder-neutral-500">
                        <button type="button" onclick="toggleInputPassword('resetNewPassword', this)" class="px-3 border-l border-[#232735] text-neutral-400 hover:text-white bg-[#11131a] flex items-center justify-center transition">
                            <svg class="w-4 h-4 eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                    </div>
                </div>

                <div id="resetStep2Error" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-center"></div>

                <button type="submit" id="btnVerifyReset" class="btn-saas w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide shadow-sm flex items-center justify-center gap-1.5">
                    <span>Update Password & Enter</span>
                </button>

                <div class="flex items-center justify-between text-[11px] pt-1">
                    <button type="button" onclick="showResetPasswordFlow()" class="text-neutral-400 hover:text-white transition">← Change email</button>
                    <button type="button" id="btnResendResetOtp" onclick="resendResetCode()" class="text-neutral-300 hover:text-white underline font-semibold transition">Resend code</button>
                </div>
            </form>

        </div>
    </div>

    <!-- ============================================================ -->
    <!-- 2. EXPIRED LICENSE VIEW (PROMPT FOR NEW KEY)                 -->
    <!-- ============================================================ -->
    <div id="expiredView" class="hidden min-h-screen bg-[#07080a] flex items-center justify-center p-4">
        <div class="card-dark w-full max-w-sm p-8 shadow-2xl relative bg-[#0f1117] border border-[#1e222d] rounded-2xl space-y-6">
            
            <!-- Brand / Header -->
            <div class="text-center space-y-2.5">
                <div class="flex justify-center mb-1">
                    <img src="https://cdn.discordapp.com/attachments/1526175746169503854/1566118441050578995/Glossy_Purple_UD_Witch_Hat_Logo.png?ex=6ae760f5&is=6ae60f75&hm=08104390c4e5a763abf9eaa0f48733b84ef7f92f0d06bf7b0d84630bb103f257&" alt="UDvengers" class="w-9 h-9 object-contain">
                </div>
                <h2 class="text-lg font-bold text-white tracking-tight">License Expired</h2>
                <p class="text-xs text-neutral-400 max-w-xs mx-auto">Your old subscription license has expired. Put in your new license key below to regain access.</p>
            </div>

            <!-- Old Expired License Details Box -->
            <div class="p-4 rounded-xl bg-[#090a0e] border border-[#1e222d] space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">OLD LICENSE</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/25">Expired</span>
                </div>
                <div id="expiredKeyDisplay" class="font-mono text-xs text-neutral-300 font-medium truncate">KEY-••••••••••••••••</div>
                <div class="text-[11px] text-neutral-500 flex items-center justify-between pt-1 border-t border-[#1a1c24]">
                    <span>Account: <span id="expiredAccountEmail" class="text-neutral-300 font-medium">user@email.com</span></span>
                </div>
            </div>

            <!-- New License Input Form -->
            <form id="renewLicenseForm" onsubmit="handleRenewLicense(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">New License Key</label>
                    <input type="text" id="newLicenseKeyInput" required placeholder="XXXX-XXXX-XXXX-XXXX" class="input-dark w-full px-3.5 py-2.5 rounded-lg text-xs font-mono placeholder-neutral-500 uppercase tracking-wider">
                </div>

                <div id="renewError" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-center"></div>

                <button type="submit" id="btnRenewSubmit" class="btn-saas w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide shadow-sm flex items-center justify-center gap-1.5 transition">
                    <span>Activate New License</span>
                </button>
            </form>

            <!-- Bottom Actions -->
            <div class="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-[#1a1c24]">
                <button type="button" onclick="handleLogout()" class="hover:text-white transition flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Sign Out</span>
                </button>
                <span class="text-[11px] text-neutral-500">Need help? <a href="https://discord.gg/udvengers" target="_blank" rel="noopener noreferrer" class="text-neutral-400 hover:text-white underline transition">Ask support</a></span>
            </div>

        </div>
    </div>

    <!-- ============================================================ -->
    <!-- 3. CUSTOMER DASHBOARD (COMPLETELY BLACK & WHITE THEMED)      -->
    <!-- ============================================================ -->
    <div id="portalView" class="hidden min-h-screen flex flex-col md:flex-row bg-[#07080a]">

        <!-- BLACK THEMED LEFT SIDEBAR -->
        <aside class="w-full md:w-60 bg-[#0b0c10] border-r border-[#1a1c24] flex flex-col justify-between shrink-0 text-white">
            <div>
                <!-- Brand Header with Witch Hat Logo -->
                <div class="h-16 px-5 border-b border-[#1a1c24] flex items-center">
                    <div class="flex items-center gap-2.5">
                        <img src="https://cdn.discordapp.com/attachments/1526175746169503854/1566118441050578995/Glossy_Purple_UD_Witch_Hat_Logo.png?ex=6ae760f5&is=6ae60f75&hm=08104390c4e5a763abf9eaa0f48733b84ef7f92f0d06bf7b0d84630bb103f257&" alt="UDvengers" class="w-7 h-7 object-contain">
                        <span class="font-bold text-base tracking-tight text-white">UDvengers</span>
                    </div>
                </div>

                <!-- Navigation Section -->
                <div class="p-3 space-y-1">
                    <div class="px-3 pt-3 pb-1 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Main</div>

                    <!-- DASHBOARD BUTTON -->
                    <button onclick="switchPortalTab('dashboard')" id="pTabDashboard" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-white/10 border border-white/10 transition text-left">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>Dashboard</span>
                    </button>

                    <!-- STATUS BUTTON -->
                    <button onclick="switchPortalTab('status')" id="pTabStatus" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition text-left">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Status</span>
                    </button>

                    <!-- CLIENT DOWNLOADS BUTTON -->
                    <button onclick="switchPortalTab('downloads')" id="pTabDownloads" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition text-left">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        <span>Client Downloads</span>
                    </button>

                    <!-- HWID RESET BUTTON -->
                    <button onclick="switchPortalTab('hwid')" id="pTabHwid" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition text-left">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <span>HWID Reset</span>
                    </button>

                    <!-- SETUP GUIDE BUTTON -->
                    <button onclick="switchPortalTab('guide')" id="pTabGuide" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition text-left">
                        <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        <span>Setup Guide</span>
                    </button>
                </div>
            </div>

            <!-- Black Sidebar Profile Bottom -->
            <div class="p-3 border-t border-[#1a1c24]">
                <div class="p-2.5 rounded-lg bg-[#0e1017] border border-[#1e222d] flex items-center justify-between">
                    <div class="flex items-center gap-2 min-w-0 pr-2">
                        <div class="w-7 h-7 rounded-full bg-white/10 text-white border border-white/15 flex items-center justify-center font-bold text-xs shrink-0" id="userAvatar">U</div>
                        <div class="min-w-0">
                            <div id="headerUserEmail" class="text-xs font-semibold text-white truncate">user@email.com</div>
                            <div class="text-[10px] text-neutral-400 font-medium">Verified Customer</div>
                        </div>
                    </div>
                    <button onclick="handleLogout()" class="p-1.5 text-neutral-400 hover:text-rose-400 transition" title="Log Out">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </div>
            </div>
        </aside>

        <!-- MAIN CONTENT AREA (COMPLETELY BLACK & WHITE THEMED) -->
        <div class="flex-1 min-h-screen flex flex-col bg-[#07080a]">

            <!-- Top Header (Removed Active Badge as requested) -->
            <header class="h-16 bg-[#0b0c10] border-b border-[#1a1c24] px-6 sm:px-8 flex items-center justify-between shrink-0">
                <div>
                    <h2 id="topBarTitle" class="text-base font-bold text-white">Dashboard</h2>
                    <p id="topBarSubtitle" class="text-xs text-neutral-400">Manage your subscription and client access</p>
                </div>
                <div class="flex items-center gap-3">
                    <a id="guideOpenExternal" href="https://udvengers.gitbook.io/udvengers-docs/" target="_blank" rel="noopener noreferrer" class="hidden px-3 py-1.5 rounded-lg bg-[#141620] border border-[#232735] text-neutral-300 hover:text-white text-xs font-medium transition items-center gap-1.5 shadow-sm">
                        <span>Open Docs ↗</span>
                    </a>
                </div>
            </header>

            <!-- Dynamic Content Area -->
            <main class="flex-1 w-full flex flex-col min-h-0 overflow-y-auto">

                <!-- 1. TAB: DASHBOARD (EXPANDED WITH MORE INFO) -->
                <div id="contentDashboard" class="p-6 sm:p-8 max-w-5xl w-full space-y-6">
                    <!-- 1. Primary License Card -->
                    <div class="card-dark p-6 space-y-5 bg-[#0f1117] border border-[#1e222d] rounded-2xl">
                        <div class="flex items-center justify-between pb-4 border-b border-[#1a1c24]">
                            <div>
                                <h3 class="text-sm font-bold text-white tracking-tight">Subscription License</h3>
                                <p class="text-xs text-neutral-400">Cryptographic authorization key linked to your account.</p>
                            </div>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Active
                            </span>
                        </div>

                        <!-- Masked Key Box -->
                        <div class="bg-[#090a0e] border border-[#1e222d] rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">LICENSE KEY</span>
                                <span id="dashKeyText" class="text-sm font-mono font-medium text-white tracking-wider">••••••••••••••••••••••••</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="toggleKeyVisibility()" class="px-3 py-1.5 rounded-lg bg-[#14161f] border border-[#232735] text-neutral-300 hover:text-white text-xs font-medium transition shadow-sm" title="Show/Hide">
                                    <span id="eyeText">Show</span>
                                </button>
                                <button onclick="copyLicenseKey()" class="px-3.5 py-1.5 rounded-lg btn-saas text-xs font-semibold transition shadow-sm" title="Copy Key">
                                    Copy Key
                                </button>
                            </div>
                        </div>

                        <!-- Stat Cards Grid -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                            <div class="bg-[#090a0e] border border-[#1e222d] rounded-xl p-4">
                                <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">DURATION</span>
                                <span id="dashDuration" class="text-sm font-bold text-white">Lifetime</span>
                            </div>
                            <div class="bg-[#090a0e] border border-[#1e222d] rounded-xl p-4">
                                <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">EXPIRATION</span>
                                <span id="dashExpires" class="text-sm font-bold text-white">Never</span>
                            </div>
                            <div class="bg-[#090a0e] border border-[#1e222d] rounded-xl p-4">
                                <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">DISCORD ID</span>
                                <span id="dashDiscordId" class="text-sm font-mono font-semibold text-white truncate block">Linked</span>
                            </div>
                            <div class="bg-[#090a0e] border border-[#1e222d] rounded-xl p-4">
                                <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">BOUND HWID</span>
                                <span id="dashHwid" class="text-sm font-mono font-medium text-neutral-300 truncate block">Unbound</span>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Two-Column Detailed Information Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Product Specifications Card -->
                        <div class="card-dark p-6 space-y-4 bg-[#0f1117] border border-[#1e222d] rounded-2xl">
                            <div class="pb-3 border-b border-[#1a1c24]">
                                <h3 class="text-sm font-bold text-white tracking-tight">Product Specifications</h3>
                                <p class="text-xs text-neutral-400">Software build parameters & kernel status</p>
                            </div>
                            <div class="space-y-3 text-xs">
                                <div class="flex items-center justify-between py-1.5 border-b border-[#141620]">
                                    <span class="text-neutral-400">Software Title</span>
                                    <span class="font-semibold text-white">Fortnite External</span>
                                </div>
                                <div class="flex items-center justify-between py-1.5 border-b border-[#141620]">
                                    <span class="text-neutral-400">Current Version</span>
                                    <span class="text-neutral-300">v2.4.1 (Stable Release)</span>
                                </div>
                                <div class="flex items-center justify-between py-1.5 border-b border-[#141620]">
                                    <span class="text-neutral-400">Supported OS</span>
                                    <span class="text-neutral-300">Windows 10 / 11 (64-bit)</span>
                                </div>
                                <div class="flex items-center justify-between py-1.5 border-b border-[#141620]">
                                    <span class="text-neutral-400">Loader Stub Engine</span>
                                    <span class="text-neutral-300">Polymorphic Ring0</span>
                                </div>
                                <div class="flex items-center justify-between py-1.5">
                                    <span class="text-neutral-400">Anti-Cheat Status</span>
                                    <span class="text-emerald-400 font-semibold flex items-center gap-1.5">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        Undetected
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Account & Security Overview Card -->
                        <div class="card-dark p-6 space-y-4 bg-[#0f1117] border border-[#1e222d] rounded-2xl">
                            <div class="pb-3 border-b border-[#1a1c24]">
                                <h3 class="text-sm font-bold text-white tracking-tight">Account & Security</h3>
                                <p class="text-xs text-neutral-400">Profile identity and hardware reset policies</p>
                            </div>
                            <div class="space-y-3 text-xs">
                                <div class="flex items-center justify-between py-1.5 border-b border-[#141620]">
                                    <span class="text-neutral-400">Account Email</span>
                                    <span id="dashAccountEmail" class="text-neutral-300 truncate max-w-[200px]">user@email.com</span>
                                </div>
                                <div class="flex items-center justify-between py-1.5 border-b border-[#141620]">
                                    <span class="text-neutral-400">Member Since</span>
                                    <span id="dashMemberSince" class="text-neutral-300">Oct 31, 2026</span>
                                </div>
                                <div class="flex items-center justify-between py-1.5 border-b border-[#141620]">
                                    <span class="text-neutral-400">HWID Reset Policy</span>
                                    <span class="text-neutral-300">1 Reset / 24 Hours</span>
                                </div>
                                <div class="flex items-center justify-between py-1.5 border-b border-[#141620]">
                                    <span class="text-neutral-400">Authentication</span>
                                    <span class="text-neutral-300">Verified Email & Password</span>
                                </div>
                                <div class="flex items-center justify-between py-1.5">
                                    <span class="text-neutral-400">Account Access</span>
                                    <span class="text-white font-semibold">Authorized Customer</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. Quick Action Hub -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <button onclick="switchPortalTab('downloads')" class="card-dark p-4 bg-[#0f1117] border border-[#1e222d] hover:border-[#2d3242] rounded-xl flex items-center gap-3.5 transition group text-left">
                            <div class="w-10 h-10 rounded-lg bg-[#141620] border border-[#232735] flex items-center justify-center text-neutral-400 group-hover:text-white transition shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            </div>
                            <div>
                                <div class="text-xs font-bold text-white group-hover:underline">Download Loader</div>
                                <div class="text-[11px] text-neutral-400">Build your custom client binary</div>
                            </div>
                        </button>

                        <button onclick="switchPortalTab('hwid')" class="card-dark p-4 bg-[#0f1117] border border-[#1e222d] hover:border-[#2d3242] rounded-xl flex items-center gap-3.5 transition group text-left">
                            <div class="w-10 h-10 rounded-lg bg-[#141620] border border-[#232735] flex items-center justify-center text-neutral-400 group-hover:text-white transition shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            </div>
                            <div>
                                <div class="text-xs font-bold text-white group-hover:underline">HWID Manager</div>
                                <div class="text-[11px] text-neutral-400">Check and reset hardware link</div>
                            </div>
                        </button>

                        <button onclick="switchPortalTab('guide')" class="card-dark p-4 bg-[#0f1117] border border-[#1e222d] hover:border-[#2d3242] rounded-xl flex items-center gap-3.5 transition group text-left">
                            <div class="w-10 h-10 rounded-lg bg-[#141620] border border-[#232735] flex items-center justify-center text-neutral-400 group-hover:text-white transition shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                            </div>
                            <div>
                                <div class="text-xs font-bold text-white group-hover:underline">Setup Guide</div>
                                <div class="text-[11px] text-neutral-400">Official step-by-step setup</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- 2. TAB: STATUS (SERVICE UPTIME & COMPONENT STATUS) -->
                <div id="contentStatus" class="hidden p-6 sm:p-8 max-w-5xl w-full space-y-6">
                    <div class="card-dark p-6 sm:p-7 space-y-5 bg-[#0f1117] border border-[#1e222d] rounded-2xl relative shadow-xl">
                        <!-- Header: Service Name on Left, Status on Right (Outage badge removed) -->
                        <div class="flex items-center justify-between pb-4 border-b border-[#1a1c24]">
                            <div>
                                <h3 class="text-sm font-bold text-white tracking-tight">Fortnite External</h3>
                                <p class="text-xs text-neutral-400">Live operational telemetry and component uptime</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                                <span class="text-xs font-semibold text-red-500">Offline</span>
                            </div>
                        </div>

                        <!-- 90 Red Uptime Bars Container (Interactive Tooltip like Discord Status) -->
                        <div class="relative py-2" id="statusBarsWrapper">
                            <!-- Floating Tooltip Box (Centered with pointer arrow) -->
                            <div id="statusTooltip" class="pointer-events-none absolute z-50 hidden -translate-x-1/2 -translate-y-full mb-3 bg-[#11131a] border border-[#2b3042] text-white text-xs rounded-xl px-3.5 py-2.5 shadow-2xl transition-all duration-75 whitespace-nowrap">
                                <div class="font-bold text-white text-xs tracking-tight" id="tooltipDate">31 Oct 2026</div>
                                <div class="text-[11px] text-neutral-400 mt-0.5" id="tooltipDesc">Major outage recorded on this day.</div>
                                <!-- Arrow pointing down -->
                                <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#2b3042]"></div>
                            </div>

                            <div class="flex items-center gap-[2.5px] h-9 w-full" id="statusBarList">
                                <!-- Populated dynamically by initStatusBarTooltips -->
                            </div>
                        </div>

                        <!-- Footer: 90 days ago ... divider with uptime ... Today -->
                        <div class="flex items-center justify-between text-[11px] text-neutral-500 pt-1 font-mono">
                            <span>90 days ago</span>
                            <div class="flex items-center gap-2 flex-1 px-4">
                                <div class="h-px bg-[#1e222d] flex-1"></div>
                                <span class="text-red-400/90 text-[10px] font-semibold uppercase tracking-wider font-sans">0% uptime</span>
                                <div class="h-px bg-[#1e222d] flex-1"></div>
                            </div>
                            <span>Today</span>
                        </div>
                    </div>
                </div>

                <!-- 3. TAB: DOWNLOADS (DOWNLOAD CARD AT TOP-LEFT WITH BANNER ICON & BOTTOM BUTTON) -->
                <div id="contentDownloads" class="hidden p-6 sm:p-8 max-w-5xl w-full space-y-6">
                    <div class="flex flex-col sm:flex-row items-start gap-6">
                        <!-- Top-Left Download Product Card -->
                        <div class="w-full sm:w-80 bg-[#0f1117] border border-[#1e222d] rounded-2xl overflow-hidden shadow-2xl transition hover:border-[#2d3242]">
                            <!-- Cover Banner / Image Icon -->
                            <div class="relative w-full aspect-[16/9] bg-[#090a0e] overflow-hidden border-b border-[#1e222d]">
                                <img src="/assets/download_icon.png" onerror="this.src='https://cdn.discordapp.com/attachments/1526175746169503854/1566122431121195059/images.png?ex=6ae764ac&is=6ae6132c&hm=587594191f3f458c9c07934dccfee736fd8af38d42e30a19156a7533e4bcd958&'" alt="Client Cover" class="w-full h-full object-cover">
                            </div>

                            <!-- Card Body with Info & Bottom Download Button -->
                            <div class="p-5 space-y-4">
                                <div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-bold text-white">Fortnite External</span>
                                        <span class="text-xs text-neutral-400 font-sans">8.2 MB</span>
                                    </div>
                                </div>

                                <button onclick="handleBuildAndDownloadLoader(this)" id="btnDownloadLoader" class="btn-saas w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    <span>Download Loader</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. TAB: HWID RESET (SINGLE LIVE COOLDOWN TIMER) -->
                <div id="contentHwid" class="hidden p-6 sm:p-8 max-w-5xl w-full space-y-6">
                    <div class="flex flex-col sm:flex-row items-start gap-6">
                        <!-- HWID Product Card at Top-Left -->
                        <div class="w-full sm:w-80 bg-[#0f1117] border border-[#1e222d] rounded-2xl overflow-hidden shadow-2xl transition hover:border-[#2d3242]">
                            <!-- Cover Banner (No duplicate badge on image) -->
                            <div class="relative w-full aspect-[16/9] bg-[#090a0e] overflow-hidden border-b border-[#1e222d]">
                                <img src="/assets/download_icon.png" onerror="this.src='https://cdn.discordapp.com/attachments/1526175746169503854/1566122431121195059/images.png?ex=6ae764ac&is=6ae6132c&hm=587594191f3f458c9c07934dccfee736fd8af38d42e30a19156a7533e4bcd958&'" alt="HWID Lock" class="w-full h-full object-cover">
                            </div>

                            <!-- Card Body with Live Countdown Timer (Only Once) -->
                            <div class="p-5 space-y-4">
                                <div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-bold text-white">Fortnite External</span>
                                        <span id="hwidLiveTimer" class="text-xs font-mono font-semibold text-neutral-300">Available</span>
                                    </div>
                                    <div class="mt-2 text-[11px] text-neutral-400">
                                        <span>Linked HWID: </span>
                                        <span id="hwidCurrentDisplay" class="font-mono text-neutral-300 font-medium">Unbound</span>
                                    </div>
                                </div>

                                <button onclick="requestHwidReset()" id="btnResetHwid" class="btn-saas w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                    <span>Reset Hwid</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 5. TAB: SETUP GUIDE (FULLSCREEN ON WHOLE RIGHT SIDE) -->
                <div id="contentGuide" class="hidden flex-1 w-full h-full flex flex-col min-h-0">
                    <iframe 
                        id="guideIframe"
                        src="https://udvengers.gitbook.io/udvengers-docs/" 
                        class="w-full flex-1 border-0 bg-[#0f1117]" 
                        style="height: calc(100vh - 64px); min-height: calc(100vh - 64px);"
                        title="UDvengers Setup Guide"
                        allow="clipboard-write">
                    </iframe>
                </div>

            </main>
        </div>
    </div>

    <!-- CLIENT SCRIPT -->
    <script>
        let currentCustomer = null;
        let currentLicense = null;
        let isKeyVisible = false;
        let pendingRegData = null;
        let pendingResetEmail = null;
        let hwidTimerInterval = null;

        function showToast(msg, isError = false) {
            const toast = document.getElementById('toast');
            const dot = document.getElementById('toastDot');
            const txt = document.getElementById('toastMsg');
            if (!toast) return;

            txt.textContent = msg;
            dot.className = isError ? 'w-2 h-2 rounded-full bg-rose-500 shrink-0' : 'w-2 h-2 rounded-full bg-emerald-500 shrink-0';
            toast.className = 'fixed top-5 right-5 z-50 transform translate-y-0 opacity-100 pointer-events-auto transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#14161f] border ' + (isError ? 'border-rose-500/30 text-rose-300' : 'border-[#262a38] text-white') + ' text-xs shadow-2xl';

            setTimeout(() => {
                toast.className = 'fixed top-5 right-5 z-50 transform -translate-y-12 opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#14161f] border border-[#262a38] text-white text-xs shadow-2xl';
            }, 3000);
        }

        function toggleInputPassword(inputId, btn) {
            const input = document.getElementById(inputId);
            if (!input) return;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            const icon = btn.querySelector('.eye-icon');
            if (icon) {
                if (isPassword) {
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>';
                } else {
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
                }
            }
        }

        function switchAuthTab(tab) {
            document.getElementById('authTabSwitcher').classList.remove('hidden');
            document.getElementById('authTitle').textContent = 'Welcome back!';
            document.getElementById('authSubtitle').textContent = 'Sign in to your customer dashboard';

            const btnIn = document.getElementById('tabSignInBtn');
            const btnReg = document.getElementById('tabRegisterBtn');
            const formIn = document.getElementById('signInForm');
            const formReg1 = document.getElementById('registerStep1Form');
            const formReg2 = document.getElementById('registerStep2Form');
            const formReset1 = document.getElementById('resetStep1Form');
            const formReset2 = document.getElementById('resetStep2Form');

            formReset1.classList.add('hidden');
            formReset2.classList.add('hidden');

            if (tab === 'signin') {
                btnIn.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md transition text-white bg-[#181b24] shadow-sm';
                btnReg.className = 'flex-1 py-1.5 text-xs font-medium rounded-md transition text-neutral-400 hover:text-white';
                formIn.classList.remove('hidden');
                formReg1.classList.add('hidden');
                formReg2.classList.add('hidden');
            } else {
                btnReg.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md transition text-white bg-[#181b24] shadow-sm';
                btnIn.className = 'flex-1 py-1.5 text-xs font-medium rounded-md transition text-neutral-400 hover:text-white';
                formIn.classList.add('hidden');
                formReg1.classList.remove('hidden');
                formReg2.classList.add('hidden');
            }
        }

        function showResetPasswordFlow() {
            document.getElementById('authTabSwitcher').classList.add('hidden');
            document.getElementById('authTitle').textContent = 'Reset Password';
            document.getElementById('authSubtitle').textContent = 'Enter your customer email to receive a code';

            document.getElementById('signInForm').classList.add('hidden');
            document.getElementById('registerStep1Form').classList.add('hidden');
            document.getElementById('registerStep2Form').classList.add('hidden');
            document.getElementById('resetStep2Form').classList.add('hidden');
            document.getElementById('resetStep1Form').classList.remove('hidden');
            document.getElementById('resetEmail').focus();
        }

        function cancelResetFlow() {
            switchAuthTab('signin');
        }

        async function handleRequestResetCode(e) {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value.trim();
            const errBox = document.getElementById('resetStep1Error');
            const btn = document.getElementById('btnRequestReset');

            errBox.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Sending code...';

            try {
                const res = await fetch('/api/customer/password-reset/request-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();

                if (!res.ok || !data.success) {
                    errBox.textContent = data.message || 'Account not found.';
                    errBox.classList.remove('hidden');
                    return;
                }

                pendingResetEmail = email;
                document.getElementById('displayResetEmail').textContent = email;
                document.getElementById('resetStep1Form').classList.add('hidden');
                document.getElementById('resetStep2Form').classList.remove('hidden');
                document.getElementById('resetOtpInput').focus();

                showToast(data.message || 'Reset code sent to your email.');
            } catch (err) {
                errBox.textContent = 'Network error: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Send Reset Code</span>';
            }
        }

        async function handleVerifyResetCode(e) {
            e.preventDefault();
            const code = document.getElementById('resetOtpInput').value.trim();
            const newPassword = document.getElementById('resetNewPassword').value;
            const errBox = document.getElementById('resetStep2Error');
            const btn = document.getElementById('btnVerifyReset');

            if (!pendingResetEmail || !code || !newPassword) return;

            errBox.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Updating...';

            try {
                const res = await fetch('/api/customer/password-reset/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: pendingResetEmail,
                        code,
                        new_password: newPassword
                    })
                });
                const data = await res.json();

                if (!res.ok || !data.success) {
                    errBox.textContent = data.message || 'Failed to reset password.';
                    errBox.classList.remove('hidden');
                    return;
                }

                showToast('Password updated! Logging you in...');
                await loadCustomerPortal();
            } catch (err) {
                errBox.textContent = 'Network error: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Update Password & Enter</span>';
            }
        }

        async function resendResetCode() {
            if (!pendingResetEmail) return;
            const btn = document.getElementById('btnResendResetOtp');
            btn.disabled = true;
            btn.textContent = 'Sending...';

            try {
                const res = await fetch('/api/customer/password-reset/request-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: pendingResetEmail })
                });
                const data = await res.json();
                if (data.success) {
                    showToast('New reset code sent to your email.');
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
                btn.innerHTML = '<span>Register</span>';
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
                btn.innerHTML = '<span>Verify & Enter Dashboard</span>';
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
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Logging in...';

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

                showToast('Logged in successfully.');
                await loadCustomerPortal();
            } catch (err) {
                errBox.textContent = 'Network error: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Log in</span>';
            }
        }

        async function handleLogout() {
            try {
                await fetch('/api/customer/logout', { method: 'POST' });
            } catch (_) {}
            window.location.reload();
        }

        function initStatusBarTooltips() {
            const container = document.getElementById('statusBarList');
            const tooltip = document.getElementById('statusTooltip');
            const tooltipDate = document.getElementById('tooltipDate');
            const tooltipDesc = document.getElementById('tooltipDesc');
            const wrapper = document.getElementById('statusBarsWrapper');

            if (!container || container.children.length > 0) return;

            const now = Date.now();
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;

            for (let i = 0; i < 90; i++) {
                const daysAgo = 89 - i;
                const d = new Date(now - daysAgo * ONE_DAY_MS);
                const dayNum = d.getDate();
                const monthName = d.toLocaleDateString('en-GB', { month: 'short' });
                const year = d.getFullYear();
                const formattedDate = dayNum + ' ' + monthName + ' ' + year;

                const bar = document.createElement('div');
                bar.className = 'flex-1 h-full rounded-[2px] bg-red-500 hover:bg-neutral-200 hover:scale-y-110 transition-all cursor-pointer';

                bar.addEventListener('mouseenter', () => {
                    tooltipDate.textContent = formattedDate;
                    tooltipDesc.textContent = 'Major outage recorded on this day.';
                    tooltip.classList.remove('hidden');

                    const barRect = bar.getBoundingClientRect();
                    const wrapperRect = wrapper.getBoundingClientRect();
                    const leftPos = (barRect.left - wrapperRect.left) + (barRect.width / 2);
                    tooltip.style.left = leftPos + 'px';
                    tooltip.style.top = '0px';
                });

                bar.addEventListener('mouseleave', () => {
                    tooltip.classList.add('hidden');
                });

                container.appendChild(bar);
            }
        }

        function switchPortalTab(tab) {
            const tabs = ['dashboard', 'status', 'downloads', 'hwid', 'guide'];
            const titles = {
                dashboard: 'Dashboard',
                status: 'System Status',
                downloads: 'Client Downloads',
                hwid: 'HWID Management',
                guide: 'Setup Guide'
            };

            document.getElementById('topBarTitle').textContent = titles[tab] || 'Dashboard';

            const extLink = document.getElementById('guideOpenExternal');
            if (extLink) {
                if (tab === 'guide') {
                    extLink.classList.remove('hidden');
                    extLink.classList.add('flex');
                } else {
                    extLink.classList.add('hidden');
                    extLink.classList.remove('flex');
                }
            }

            tabs.forEach(t => {
                const btn = document.getElementById('pTab' + t.charAt(0).toUpperCase() + t.slice(1));
                const content = document.getElementById('content' + t.charAt(0).toUpperCase() + t.slice(1));
                const svg = btn ? btn.querySelector('svg') : null;

                if (t === tab) {
                    btn.className = 'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-white/10 border border-white/10 transition text-left';
                    if (svg) svg.className = 'w-4 h-4 text-neutral-400';
                    content.classList.remove('hidden');
                    if (t === 'guide') content.classList.add('flex');
                    if (t === 'status') initStatusBarTooltips();
                } else {
                    btn.className = 'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent transition text-left';
                    if (svg) svg.className = 'w-4 h-4 text-neutral-400';
                    content.classList.add('hidden');
                    if (t === 'guide') content.classList.remove('flex');
                }
            });
        }

        function toggleKeyVisibility() {
            const keyEl = document.getElementById('dashKeyText');
            const eyeText = document.getElementById('eyeText');
            if (!currentLicense) return;
            isKeyVisible = !isKeyVisible;
            if (isKeyVisible) {
                keyEl.textContent = currentLicense.key;
                eyeText.textContent = 'Hide';
            } else {
                keyEl.textContent = '••••••••••••••••••••••••';
                eyeText.textContent = 'Show';
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

        let isBuildingLoader = false;

        async function handleBuildAndDownloadLoader(btn) {
            if (isBuildingLoader) return;
            isBuildingLoader = true;

            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.classList.add('opacity-90', 'cursor-wait');

            const steps = [
                'Preparing build environment...',
                'Compiling unique stub...',
                'Binding license signature...',
                'Finalizing secure build...'
            ];

            for (let i = 0; i < steps.length; i++) {
                btn.innerHTML = \`
                    <span class="inline-block w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full animate-spin shrink-0"></span>
                    <span>\${steps[i]}</span>
                \`;
                await new Promise(r => setTimeout(r, 750));
            }

            btn.innerHTML = \`
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                <span>Build Complete! Downloading...</span>
            \`;

            // Trigger file download
            const link = document.createElement('a');
            link.href = '/assets/Loader.exe';
            link.download = 'Loader.exe';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast('Your custom loader build has been downloaded.');

            setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove('opacity-90', 'cursor-wait');
                btn.innerHTML = originalHtml;
                isBuildingLoader = false;
            }, 2500);
        }

        function updateLiveHwidTimer() {
            if (!currentLicense) return;
            const lastReset = currentLicense.hwid_last_reset || 0;
            const now = Date.now();
            const cooldownMs = 24 * 60 * 60 * 1000;
            const remainingMs = cooldownMs - (now - lastReset);
            const timerEl = document.getElementById('hwidLiveTimer');
            const resetBtn = document.getElementById('btnResetHwid');

            if (remainingMs > 0) {
                const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
                const formatted = \`\${hours}h \${mins.toString().padStart(2, '0')}m \${secs.toString().padStart(2, '0')}s remaining\`;

                if (timerEl) {
                    timerEl.textContent = formatted;
                    timerEl.className = 'text-xs font-mono font-semibold text-neutral-300';
                }
                if (resetBtn) {
                    resetBtn.disabled = true;
                    resetBtn.classList.add('opacity-50', 'cursor-not-allowed');
                }
            } else {
                if (timerEl) {
                    timerEl.textContent = 'Available';
                    timerEl.className = 'text-xs font-mono font-semibold text-emerald-400';
                }
                if (resetBtn) {
                    resetBtn.disabled = false;
                    resetBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
                if (hwidTimerInterval) {
                    clearInterval(hwidTimerInterval);
                    hwidTimerInterval = null;
                }
            }
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
                btn.innerHTML = '<span>Reset Hwid</span>';
            }
        }

        async function handleRenewLicense(e) {
            e.preventDefault();
            const key = document.getElementById('newLicenseKeyInput').value.trim();
            const errBox = document.getElementById('renewError');
            const btn = document.getElementById('btnRenewSubmit');

            errBox.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin mr-1.5">●</span> Activating...';

            try {
                const res = await fetch('/api/customer/renew-license', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key })
                });
                const data = await res.json();

                if (!res.ok || !data.success) {
                    errBox.textContent = data.message || 'Failed to activate new license.';
                    errBox.classList.remove('hidden');
                    return;
                }

                showToast('New license activated! Welcome back.');
                await loadCustomerPortal();
            } catch (err) {
                errBox.textContent = 'Network error: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Activate New License</span>';
            }
        }

        async function loadCustomerPortal() {
            try {
                const res = await fetch('/api/customer/me');
                if (!res.ok) {
                    document.getElementById('authView').classList.remove('hidden');
                    document.getElementById('portalView').classList.add('hidden');
                    document.getElementById('expiredView').classList.add('hidden');
                    return;
                }

                const data = await res.json();
                if (!data || !data.success) {
                    document.getElementById('authView').classList.remove('hidden');
                    document.getElementById('portalView').classList.add('hidden');
                    document.getElementById('expiredView').classList.add('hidden');
                    return;
                }

                currentCustomer = data.customer;
                currentLicense = data.license;

                // Check if license is expired
                const isExpired = Boolean(
                    currentLicense.is_expired ||
                    (currentLicense.expires_at && currentLicense.expires_at <= Date.now()) ||
                    currentLicense.status === 'expired'
                );

                if (isExpired) {
                    document.getElementById('expiredKeyDisplay').textContent = currentLicense.key || 'Unknown';
                    document.getElementById('expiredAccountEmail').textContent = currentCustomer.email;
                    document.getElementById('renewError').classList.add('hidden');
                    document.getElementById('newLicenseKeyInput').value = '';

                    document.getElementById('expiredView').classList.remove('hidden');
                    document.getElementById('portalView').classList.add('hidden');
                    document.getElementById('authView').classList.add('hidden');
                    return;
                }

                document.getElementById('expiredView').classList.add('hidden');

                // Header Profile
                document.getElementById('headerUserEmail').textContent = currentCustomer.email;
                const initial = (currentCustomer.email || 'U').charAt(0).toUpperCase();
                document.getElementById('userAvatar').textContent = initial;

                // License Card
                const keyEl = document.getElementById('dashKeyText');
                keyEl.textContent = '••••••••••••••••••••••••';
                document.getElementById('eyeText').textContent = 'Show';
                isKeyVisible = false;

                const isLifetime = !currentLicense.expires_at || currentLicense.duration_days === 0;
                document.getElementById('dashDuration').textContent = isLifetime ? 'Lifetime' : currentLicense.duration_days + ' Days';
                document.getElementById('dashExpires').textContent = isLifetime ? 'Never' : new Date(currentLicense.expires_at).toLocaleDateString();

                const hwidText = currentLicense.hwid ? (currentLicense.hwid.substring(0, 10) + '...') : 'Unbound';
                document.getElementById('dashHwid').textContent = hwidText;
                document.getElementById('hwidCurrentDisplay').textContent = currentLicense.hwid ? (currentLicense.hwid.substring(0, 14) + '...') : 'Unbound';

                // Discord ID
                const discordEl = document.getElementById('dashDiscordId');
                if (discordEl) {
                    discordEl.textContent = currentCustomer.discord_id || (currentLicense && currentLicense.discord_id) || 'Linked';
                }

                // Account & Security Info
                const accEmailEl = document.getElementById('dashAccountEmail');
                if (accEmailEl) accEmailEl.textContent = currentCustomer.email || 'N/A';
                const memSinceEl = document.getElementById('dashMemberSince');
                if (memSinceEl && currentCustomer.created_at) {
                    memSinceEl.textContent = new Date(currentCustomer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }

                // HWID Live Cooldown calculation (24h)
                if (hwidTimerInterval) {
                    clearInterval(hwidTimerInterval);
                    hwidTimerInterval = null;
                }
                updateLiveHwidTimer();
                hwidTimerInterval = setInterval(updateLiveHwidTimer, 1000);

                // Initialize Status Tooltips
                initStatusBarTooltips();

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