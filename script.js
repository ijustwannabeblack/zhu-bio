const LANYARD_USER_ID = "1415022792214052915";
const LANYARD_WS_URL = "wss://api.lanyard.rest/socket";
const LANYARD_REST_URL = `https://api.lanyard.rest/v1/users/${LANYARD_USER_ID}`;

let lanyardSocket = null;
let heartbeatTimer = null;
let spotifyInterval = null;
let userBadges = [
  "Nitro Gold.png",
  "Developer.png",
  "Booster.png",
  "Gifted.png"
];
let songPlaylist = [
  "Addison Rae - Fame is a Gun (Official Video).mp3",
  "Drake - Janice STFU.mp3",
  "Jay-Z Kanye West - Ni as In Paris (Explicit).mp3",
  "Julia Wolf - In My Room Official Lyric Video.mp3",
  "Kanye West - All Falls Down ft. Syleena Johnson.mp3",
  "Kanye West - All Of The Lights.mp3",
  "Kelly Clarkson - Since U Been Gone (VIDEO).mp3",
  "Legendary Lovers.mp3",
  "Trippie Redd, Travis Scott - Dark Knight Dummo ft. Travis Scott.mp3"
];

function initMedia() {
  const backgroundVideo = document.getElementById('background');
  if (backgroundVideo) {
    backgroundVideo.muted = true;
    backgroundVideo.play().catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const startScreen = document.getElementById('start-screen');
  const startText = document.getElementById('start-text');
  const profileName = document.getElementById('profile-name');
  const profileBio = document.getElementById('profile-bio');
  const profilePicture = document.getElementById('profile-picture');
  const avatarDecoration = document.getElementById('avatar-decoration');
  const statusDot = document.getElementById('status-dot');
  const visitorCount = document.getElementById('visitor-count');
  const backgroundMusic = document.getElementById('background-music');
  const hackerMusic = document.getElementById('hacker-music');
  const rainMusic = document.getElementById('rain-music');
  const animeMusic = document.getElementById('anime-music');
  const carMusic = document.getElementById('car-music');
  const homeButton = document.getElementById('home-theme');
  const hackerButton = document.getElementById('hacker-theme');
  const rainButton = document.getElementById('rain-theme');
  const animeButton = document.getElementById('anime-theme');
  const carButton = document.getElementById('car-theme');
  const resultsButtonContainer = document.getElementById('results-button-container');
  const resultsButton = document.getElementById('results-theme');
  const volumeIcon = document.getElementById('volume-icon');
  const volumeSlider = document.getElementById('volume-slider');
  const transparencySlider = document.getElementById('transparency-slider');
  const backgroundVideo = document.getElementById('background');
  const hackerOverlay = document.getElementById('hacker-overlay');
  const snowOverlay = document.getElementById('snow-overlay');
  const glitchOverlay = document.querySelector('.glitch-overlay');
  const profileBlock = document.getElementById('profile-block');
  const skillsBlock = document.getElementById('skills-block');
  const pythonBar = document.getElementById('python-bar');
  const cppBar = document.getElementById('cpp-bar');
  const csharpBar = document.getElementById('csharp-bar');
  const resultsHint = document.getElementById('results-hint');
  const profileContainer = document.querySelector('.profile-container');
  const badgeGroup = document.getElementById('badge-group');
  const spotifyPlayer = document.getElementById('spotify-player');
  const spotifyArt = document.getElementById('spotify-art');
  const spotifyArtLink = document.getElementById('spotify-art-link');
  const spotifySong = document.getElementById('spotify-song');
  const spotifyArtist = document.getElementById('spotify-artist');
  const spotifyBarFill = document.getElementById('spotify-bar-fill');
  const spotifyTimeCur = document.getElementById('spotify-time-cur');
  const spotifyTimeDur = document.getElementById('spotify-time-dur');

  // Custom Cursor handled natively via CSS url('assets/cursor.png') 0 0, auto

  // Typewriter Start Text
  const startMessage = "Click here to see the motion baby";
  let startTextContent = '';
  let startIndex = 0;
  let startCursorVisible = true;

  function typeWriterStart() {
    if (startIndex < startMessage.length) {
      startTextContent = startMessage.slice(0, startIndex + 1);
      startIndex++;
    }
    if (startText) startText.textContent = startTextContent + (startCursorVisible ? '|' : ' ');
    setTimeout(typeWriterStart, 100);
  }

  setInterval(() => {
    startCursorVisible = !startCursorVisible;
    if (startText) startText.textContent = startTextContent + (startCursorVisible ? '|' : ' ');
  }, 500);

  // Live Germany (Berlin) Time Clock
  function updateBerlinTime() {
    const timeEl = document.getElementById('berlin-time');
    if (!timeEl) return;
    try {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      timeEl.textContent = formatter.format(new Date());
    } catch (e) {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString();
    }
  }
  updateBerlinTime();
  setInterval(updateBerlinTime, 1000);

  // Guns.lol Strict HWID & Anti-Incognito View Counter (Starts at 0)
  const COUNTER_NAMESPACE = 'larpifyy_asia';
  const COUNTER_KEY = 'views_hwid_v1';
  let hasRecordedViewThisSession = false;

  function getGPUHWID() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no_gl';
      const dbgRenderInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!dbgRenderInfo) return 'no_dbg';
      const vendor = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL) || '';
      const renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL) || '';
      return `${vendor}__${renderer}`;
    } catch (e) {
      return 'gl_err';
    }
  }

  async function isIncognitoMode() {
    try {
      // 1. Chrome / Chromium / Edge storage estimate check
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const { quota } = await navigator.storage.estimate();
        if (quota && quota < 130 * 1024 * 1024) {
          return true;
        }
      }
      // 2. WebKit FileSystem check
      if ('webkitRequestFileSystem' in window) {
        const isIncog = await new Promise(resolve => {
          window.webkitRequestFileSystem(
            window.TEMPORARY,
            100,
            () => resolve(false),
            () => resolve(true)
          );
        });
        if (isIncog) return true;
      }
      // 3. Safari Private Browsing
      if (window.safari && !window.safari.pushNotification) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  async function getDeviceHWID() {
    try {
      const parts = [
        getGPUHWID(),
        screen.width,
        screen.height,
        screen.colorDepth,
        window.devicePixelRatio || 1,
        navigator.hardwareConcurrency || 2,
        navigator.maxTouchPoints || 0,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.platform || '',
        navigator.language
      ];
      // Canvas HWID fingerprint
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = '#f60';
        ctx.fillRect(10, 10, 80, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('hwid_larpifyy', 15, 15);
        parts.push(canvas.toDataURL());
      }
      const raw = parts.join('###');
      const msgUint8 = new TextEncoder().encode(raw);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
    } catch (e) {
      return 'hwid_' + screen.width + 'x' + screen.height;
    }
  }

  async function fetchLiveViewCount() {
    const countEl = document.getElementById('visitor-count');
    try {
      const res = await fetch(`https://abacus.jasoncameron.dev/get/${COUNTER_NAMESPACE}/${COUNTER_KEY}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.value === 'number') {
          if (countEl) countEl.textContent = data.value.toLocaleString();
          return data.value;
        }
      }
    } catch (e) {}
    if (countEl && (!countEl.textContent || countEl.textContent === '')) {
      countEl.textContent = '0';
    }
    return 0;
  }

  async function recordHumanView() {
    if (hasRecordedViewThisSession) return;
    hasRecordedViewThisSession = true;

    const countEl = document.getElementById('visitor-count');

    // Block Incognito / Private browsing from incrementing views
    const incognito = await isIncognitoMode();
    if (incognito) {
      fetchLiveViewCount();
      return;
    }

    const hwid = await getDeviceHWID();
    const storageKey = `hwid_viewed_${COUNTER_KEY}_${hwid}`;

    // Check if this physical device/HWID has already viewed
    if (localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey)) {
      fetchLiveViewCount();
      return;
    }

    try {
      // IP verification to block multiple tabs / reloads on same IP
      let ip = '';
      try {
        const ipRes = await fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          ip = ipData.ip || '';
        }
      } catch (e) {}

      const ipKey = ip ? `viewed_ip_${ip.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      if (ipKey && localStorage.getItem(ipKey)) {
        fetchLiveViewCount();
        return;
      }

      // First genuine human non-incognito view: increment counter!
      const res = await fetch(`https://abacus.jasoncameron.dev/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.value === 'number') {
          localStorage.setItem(storageKey, Date.now().toString());
          sessionStorage.setItem(storageKey, 'true');
          if (ipKey) localStorage.setItem(ipKey, Date.now().toString());
          if (countEl) countEl.textContent = data.value.toLocaleString();
          return;
        }
      }
    } catch (e) {}

    fetchLiveViewCount();
  }

  // Fetch initial live count on load (without incrementing)
  fetchLiveViewCount();

  // Dynamic Random Song Selector from songs/ folder
  let currentSong = null;

  async function initSongs() {
    try {
      const res = await fetch('/api/songs');
      if (res.ok) {
        const songs = await res.json();
        if (Array.isArray(songs) && songs.length > 0) {
          songPlaylist = songs;
        }
      }
    } catch (e) {}

    selectRandomSong();
  }

  function selectRandomSong() {
    if (!backgroundMusic) return;
    if (songPlaylist.length > 0) {
      const randomSong = songPlaylist[Math.floor(Math.random() * songPlaylist.length)];
      currentSong = randomSong;
      backgroundMusic.src = `songs/${encodeURIComponent(randomSong)}`;
    } else {
      backgroundMusic.src = `songs/Legendary%20Lovers.mp3`;
    }
    backgroundMusic.load();
  }

  // Pre-select song immediately so audio source is loaded before interaction
  selectRandomSong();

  if (backgroundMusic) {
    backgroundMusic.volume = 1.0;
    backgroundMusic.addEventListener('ended', () => {
      // Pick another random song when track ends
      selectRandomSong();
      if (backgroundMusic) {
        backgroundMusic.volume = savedVolume;
        backgroundMusic.play().catch(() => {});
      }
    });
  }

  // Top-Left Volume Controls
  const volumeControlWidget = document.getElementById('volume-control-widget');
  const volumeToggleBtn = document.getElementById('volume-toggle-btn');
  const volumeSliderBar = document.getElementById('volume-slider-bar');
  const volumeIconHigh = document.getElementById('volume-icon-high');
  const volumeIconMute = document.getElementById('volume-icon-mute');
  let savedVolume = 1.0;

  function setVolume(val, updateInput = true) {
    const clamped = Math.max(0, Math.min(1, val));
    if (backgroundMusic) {
      backgroundMusic.volume = clamped;
      backgroundMusic.muted = clamped === 0;
      if (clamped > 0) savedVolume = clamped;
      updateVolumeUI(clamped, backgroundMusic.muted);
    }
    if (updateInput && volumeSliderBar) {
      volumeSliderBar.value = clamped;
    }
  }

  function updateVolumeUI(vol, isMuted) {
    if (isMuted || vol === 0) {
      if (volumeIconHigh) volumeIconHigh.classList.add('hidden');
      if (volumeIconMute) volumeIconMute.classList.remove('hidden');
    } else {
      if (volumeIconHigh) volumeIconHigh.classList.remove('hidden');
      if (volumeIconMute) volumeIconMute.classList.add('hidden');
    }
  }

  if (volumeControlWidget) {
    volumeControlWidget.addEventListener('click', (e) => e.stopPropagation());
    volumeControlWidget.addEventListener('mousedown', (e) => e.stopPropagation());
    volumeControlWidget.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
  }

  if (volumeSliderBar) {
    const handleSliderChange = (e) => {
      const val = parseFloat(e.target.value);
      setVolume(val, false);
    };
    volumeSliderBar.addEventListener('input', handleSliderChange);
    volumeSliderBar.addEventListener('change', handleSliderChange);
  }

  if (volumeToggleBtn) {
    volumeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!backgroundMusic) return;
      if (backgroundMusic.muted || backgroundMusic.volume === 0) {
        setVolume(savedVolume || 1.0, true);
      } else {
        savedVolume = backgroundMusic.volume || 1.0;
        backgroundMusic.muted = true;
        if (volumeSliderBar) volumeSliderBar.value = 0;
        updateVolumeUI(0, true);
      }
    });
  }

  // Solana Address Copy & Toast Notification
  const solanaCopyBtn = document.getElementById('solana-copy-btn');
  const toastNotification = document.getElementById('toast-notification');
  let toastTimeout = null;

  function showToast(message = "Copied to clipboard!") {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 2500);
  }

  if (solanaCopyBtn) {
    solanaCopyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const solanaAddress = "JE1kHDbcEebg7sMJvZ5ory8fNck51hSccRNnvFMqv16x";
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(solanaAddress);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = solanaAddress;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        showToast("Copied to clipboard!");
      } catch (err) {
        showToast("Copied to clipboard!");
      }
    });
  }

  // Top Projects Button (Nothing happens first as requested)
  const projectsBtn = document.getElementById('projects-btn');
  const projectsWidget = document.getElementById('projects-widget');
  const handleProjectsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  if (projectsBtn) projectsBtn.addEventListener('click', handleProjectsClick);
  if (projectsWidget) projectsWidget.addEventListener('click', handleProjectsClick);

  // Mobile & Desktop Reliable Audio Starter
  let audioStarted = false;
  function startBackgroundAudio() {
    if (!backgroundMusic) return;
    try {
      backgroundMusic.muted = false;
      backgroundMusic.volume = savedVolume || 1.0;
    } catch (e) {}

    // Unlock Web Audio API context for iOS Safari & Android Chrome
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!window._appAudioCtx) window._appAudioCtx = new AudioCtx();
        if (window._appAudioCtx.state === 'suspended') {
          window._appAudioCtx.resume();
        }
      }
    } catch (e) {}

    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        audioStarted = true;
      }).catch((err) => {
        console.warn("Mobile autoplay policy deferred audio:", err);
        // Fallback: unlock and play on next user tap anywhere
        const fallbackUnlock = () => {
          if (!backgroundMusic) return;
          backgroundMusic.muted = false;
          backgroundMusic.play().then(() => {
            audioStarted = true;
          }).catch(() => {});
          document.removeEventListener('touchend', fallbackUnlock);
          document.removeEventListener('click', fallbackUnlock);
        };
        document.addEventListener('touchend', fallbackUnlock, { once: true, passive: true });
        document.addEventListener('click', fallbackUnlock, { once: true, passive: true });
      });
    }
  }

  // Start Screen Click / Touch
  let enterHandled = false;
  function handleEnter() {
    if (enterHandled || !startScreen || startScreen.classList.contains('hidden')) return;
    enterHandled = true;
    startScreen.classList.add('hidden');
    startBackgroundAudio();

    if (profileBlock) {
      profileBlock.classList.remove('hidden');
      if (window.gsap) {
        gsap.fromTo(profileBlock,
          { opacity: 0, y: -40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out', onComplete: () => {
            if (profileContainer) profileContainer.classList.add('orbit');
          }}
        );
      } else {
        profileBlock.style.opacity = '1';
      }
    }
    if (profileName) profileName.textContent = userNameStr;
    typeWriterBio();
    recordHumanView();
  }

  if (startScreen) {
    startScreen.addEventListener('click', handleEnter);
    startScreen.addEventListener('touchend', handleEnter, { passive: true });
  }

  // Username (Static, no typing animation)
  let userNameStr = "zhu";

  // Typewriter Bio (Loops between anja my world, owner of /larpifyy, and i trade on axiom.trade btw)
  const bioMessages = [
    "anja my world",
    "owner of /larpifyy",
    "i trade on axiom.trade btw"
  ];
  let bioText = '';
  let bioIndex = 0;
  let bioMessageIndex = 0;
  let isBioDeleting = false;
  let bioCursorVisible = true;

  function typeWriterBio() {
    if (!profileBio) return;
    if (!isBioDeleting && bioIndex < bioMessages[bioMessageIndex].length) {
      bioText = bioMessages[bioMessageIndex].slice(0, bioIndex + 1);
      bioIndex++;
    } else if (isBioDeleting && bioIndex > 0) {
      bioText = bioMessages[bioMessageIndex].slice(0, bioIndex - 1);
      bioIndex--;
    } else if (bioIndex === bioMessages[bioMessageIndex].length) {
      isBioDeleting = true;
      setTimeout(typeWriterBio, 2500);
      return;
    } else if (bioIndex === 0 && isBioDeleting) {
      isBioDeleting = false;
      bioMessageIndex = (bioMessageIndex + 1) % bioMessages.length;
    }
    profileBio.textContent = bioText + (bioCursorVisible ? '|' : ' ');
    if (Math.random() < 0.1) {
      profileBio.classList.add('glitch');
      setTimeout(() => profileBio.classList.remove('glitch'), 200);
    }
    setTimeout(typeWriterBio, isBioDeleting ? 60 : 120);
  }

  setInterval(() => {
    bioCursorVisible = !bioCursorVisible;
    if (profileBio) profileBio.textContent = bioText + (bioCursorVisible ? '|' : ' ');
  }, 500);

  // (Tilt and controls removed)

  // Fast orbit on avatar click
  if (profilePicture && profileContainer) {
    profilePicture.addEventListener('click', () => {
      profileContainer.classList.add('fast-orbit');
      setTimeout(() => profileContainer.classList.remove('fast-orbit'), 500);
    });
  }

  // Load Badges from badges/ folder only
  async function loadUserBadges() {
    try {
      const res = await fetch('/api/badges');
      if (res.ok) {
        const files = await res.json();
        if (Array.isArray(files) && files.length > 0) {
          userBadges = files;
        }
      }
    } catch (e) {}
    renderBadges();
  }

  function renderBadges() {
    if (!badgeGroup) return;
    badgeGroup.innerHTML = '';

    // Filter out verified badge completely
    const validBadges = userBadges.filter(f => !f.toLowerCase().includes('verified'));

    // Sort order: Nitro (1) -> Developer (2) -> Booster (3) -> Gifted (4) -> Others
    const sortedBadges = validBadges.slice().sort((a, b) => {
      const getPriority = (filename) => {
        const lower = filename.toLowerCase();
        if (lower.includes('nitro')) return 1;
        if (lower.includes('developer')) return 2;
        if (lower.includes('booster')) return 3;
        if (lower.includes('gifted')) return 4;
        return 5;
      };
      const pA = getPriority(a);
      const pB = getPriority(b);
      if (pA !== pB) return pA - pB;
      return a.localeCompare(b);
    });

    const seen = new Set();
    sortedBadges.forEach(file => {
      const name = file.replace(/\.[^/.]+$/, "");
      const baseKey = name.toLowerCase();
      if (seen.has(baseKey)) return;
      seen.add(baseKey);

      const container = document.createElement('div');
      container.className = 'badge-container';
      container.innerHTML = `
        <img src="badges/${encodeURIComponent(file)}" alt="${name}" class="badge">
        <span class="tooltip">${name}</span>
      `;
      badgeGroup.appendChild(container);
    });
  }

  // Lanyard Integration
  async function fetchLanyard() {
    try {
      const res = await fetch(LANYARD_REST_URL);
      const json = await res.json();
      if (json.success && json.data) {
        applyLanyardData(json.data);
      }
    } catch (e) {}
  }

  function connectLanyard() {
    if (lanyardSocket) lanyardSocket.close();
    lanyardSocket = new WebSocket(LANYARD_WS_URL);

    lanyardSocket.onmessage = (event) => {
      try {
        const { op, t, d } = JSON.parse(event.data);
        if (op === 1) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = setInterval(() => {
            if (lanyardSocket.readyState === WebSocket.OPEN) {
              lanyardSocket.send(JSON.stringify({ op: 3 }));
            }
          }, d.heartbeat_interval);

          lanyardSocket.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: LANYARD_USER_ID }
          }));
        } else if (op === 0 && (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE')) {
          applyLanyardData(d);
        }
      } catch (e) {}
    };

    lanyardSocket.onclose = () => {
      setTimeout(connectLanyard, 5000);
    };
  }

  function applyLanyardData(data) {
    if (!data) return;
    const user = data.discord_user;

    // Discord Banner
    const bannerImg = document.getElementById('profile-banner-img');
    const bannerContainer = document.getElementById('profile-banner');
    if (user && bannerContainer) {
      if (user.banner) {
        const isGif = user.banner.startsWith('a_');
        if (bannerImg) {
          bannerImg.src = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${isGif ? 'gif' : 'png'}?size=1024`;
          bannerImg.classList.remove('hidden');
        }
      } else if (user.banner_color) {
        bannerContainer.style.background = user.banner_color;
      }
    }

    // Avatar
    if (user && profilePicture) {
      const isGif = user.avatar && user.avatar.startsWith('a_');
      profilePicture.src = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isGif ? 'gif' : 'png'}?size=512`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
    }

    // Avatar Decoration
    if (user && user.avatar_decoration_data && avatarDecoration) {
      avatarDecoration.src = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=240&passthrough=true`;
      avatarDecoration.classList.remove('hidden');
    }

    // Name & Clan Tag
    if (user) {
      userNameStr = user.global_name || user.display_name || user.username || "zhu";
      if (profileName) profileName.textContent = userNameStr;

      const clanTagEl = document.getElementById('clan-tag');
      const clanTagName = document.getElementById('clan-tag-name');
      const clanBadgeIcon = document.getElementById('clan-badge-icon');

      if (user.primary_guild && user.primary_guild.tag) {
        if (clanTagName) clanTagName.textContent = user.primary_guild.tag;
        if (clanBadgeIcon && user.primary_guild.badge) {
          clanBadgeIcon.src = `https://cdn.discordapp.com/clan-badges/${user.primary_guild.identity_guild_id}/${user.primary_guild.badge}.png?size=64`;
          clanBadgeIcon.style.display = 'inline-block';
        } else if (clanBadgeIcon) {
          clanBadgeIcon.style.display = 'none';
        }
        if (clanTagEl) clanTagEl.style.display = 'inline-flex';
      } else if (clanTagEl) {
        clanTagEl.style.display = 'none';
      }
    }

    // Status
    const statusIconImg = document.getElementById('status-icon-img');
    const st = data.discord_status || 'offline';
    if (statusDot) {
      statusDot.className = 'status-dot ' + st;
    }
    if (statusIconImg) {
      if (st === 'dnd') statusIconImg.src = 'discord/dnd.png';
      else if (st === 'idle') statusIconImg.src = 'discord/idle.png';
      else if (st === 'offline') statusIconImg.src = 'discord/Offline.png';
      else if (st === 'online') statusIconImg.src = 'discord/dnd.png';
    }

    // Spotify
    if (data.listening_to_spotify && data.spotify && spotifyPlayer) {
      spotifyPlayer.classList.remove('hidden');
      const trackUrl = data.spotify.track_id ? `https://open.spotify.com/track/${data.spotify.track_id}` : '#';
      if (spotifyArt) spotifyArt.src = data.spotify.album_art_url || '';
      if (spotifyArtLink) spotifyArtLink.href = trackUrl;
      if (spotifySong) {
        spotifySong.textContent = data.spotify.song || 'Unknown Track';
        spotifySong.title = data.spotify.song || 'Unknown Track';
        spotifySong.href = trackUrl;
      }
      if (spotifyArtist) {
        const artistAlbum = `${data.spotify.artist || ''} • ${data.spotify.album || ''}`;
        spotifyArtist.textContent = artistAlbum;
        spotifyArtist.title = artistAlbum;
      }

      // Progress bar & Time counters
      clearInterval(spotifyInterval);
      const start = data.spotify.timestamps.start;
      const end = data.spotify.timestamps.end;
      const total = end - start;

      const formatMmSs = (ms) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
      };

      if (spotifyTimeDur) spotifyTimeDur.textContent = formatMmSs(total);

      const updateTicker = () => {
        const now = Date.now();
        const elapsed = Math.max(0, Math.min(now - start, total));
        const pct = Math.min((elapsed / total) * 100, 100);
        if (spotifyBarFill) spotifyBarFill.style.width = pct + '%';
        if (spotifyTimeCur) spotifyTimeCur.textContent = formatMmSs(elapsed);
      };

      updateTicker();
      spotifyInterval = setInterval(updateTicker, 500);
    } else if (spotifyPlayer) {
      spotifyPlayer.classList.add('hidden');
      clearInterval(spotifyInterval);
    }
  }

  // Ambient Starfield & Connecting Constellation Canvas
  function initAmbient() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const mouse = {
      x: null,
      y: null,
      radius: 170
    };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 26 : Math.min(Math.max(Math.floor((w * h) / 16000), 35), 65);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.4 + 0.3
      });
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);

      const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#00CED1';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = themeColor;
        ctx.globalAlpha = p.alpha;
        if (!isMobile) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = themeColor;
        }
        ctx.fill();

        // Connect particle to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const lineAlpha = (1 - dist / mouse.radius) * 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = themeColor;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Connect particles to each other
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 115;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = themeColor;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      requestAnimationFrame(loop);
    }
    loop();
  }

  // Start everything
  initSongs();
  typeWriterStart();
  loadUserBadges();
  fetchLanyard();
  connectLanyard();
  initAmbient();
});