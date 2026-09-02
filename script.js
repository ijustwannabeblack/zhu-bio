const LANYARD_USER_ID = "1415022792214052915";
const LANYARD_WS_URL = "wss://api.lanyard.rest/socket";
const LANYARD_REST_URL = `https://api.lanyard.rest/v1/users/${LANYARD_USER_ID}`;

let lanyardSocket = null;
let heartbeatTimer = null;
let spotifyInterval = null;
let userBadges = [
  "verified.png",
  "Nitro Gold.png",
  "Developer.png",
  "Booster.png",
  "Gifted.png"
];
let songPlaylist = [
  "Addison Rae - Fame is a Gun (Official Video).mp3",
  "Julia Wolf - In My Room Official Lyric Video.mp3",
  "Kelly Clarkson - Since U Been Gone (VIDEO).mp3",
  "Legendary Lovers.mp3"
];

function initMedia() {
  const backgroundMusic = document.getElementById('background-music');
  const backgroundVideo = document.getElementById('background');
  if (!backgroundMusic || !backgroundVideo) return;
  backgroundMusic.volume = 0.3;
  backgroundVideo.muted = true;
  backgroundVideo.play().catch(() => {});
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

  // Guns.lol Anti-Bot & Anti-Incognito View Counter (Starts at 0)
  const COUNTER_NAMESPACE = 'larpifyy_asia';
  const COUNTER_KEY = 'views_v0';
  let hasRecordedViewThisSession = false;

  async function getDeviceFingerprint() {
    try {
      const parts = [
        screen.width,
        screen.height,
        screen.colorDepth,
        navigator.hardwareConcurrency || 2,
        navigator.language,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.userAgent
      ];
      // Canvas rendering fingerprint
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('larpifyy,asia', 2, 15);
        parts.push(canvas.toDataURL());
      }
      const raw = parts.join('###');
      const msgUint8 = new TextEncoder().encode(raw);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    } catch (e) {
      return 'fp_' + screen.width + 'x' + screen.height;
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
    const fp = await getDeviceFingerprint();
    const storageKey = `viewed_${COUNTER_KEY}_${fp}`;

    // Check if device has already viewed
    if (localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey)) {
      fetchLiveViewCount();
      return;
    }

    try {
      // Optional IP verification to block incognito replay on same network
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

      // First genuine human view: increment counter!
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

  if (backgroundMusic) {
    backgroundMusic.volume = 0.5;
    backgroundMusic.addEventListener('ended', () => {
      // Pick another random song when track ends
      selectRandomSong();
      backgroundMusic.play().catch(() => {});
    });
  }

  // Top-Left Volume Controls
  const volumeControlWidget = document.getElementById('volume-control-widget');
  const volumeToggleBtn = document.getElementById('volume-toggle-btn');
  const volumeSliderBar = document.getElementById('volume-slider-bar');
  const volumeIconHigh = document.getElementById('volume-icon-high');
  const volumeIconMute = document.getElementById('volume-icon-mute');
  let savedVolume = 0.5;

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
        setVolume(savedVolume || 0.5, true);
      } else {
        savedVolume = backgroundMusic.volume || 0.5;
        backgroundMusic.muted = true;
        if (volumeSliderBar) volumeSliderBar.value = 0;
        updateVolumeUI(0, true);
      }
    });
  }

  // Start Screen Click
  function handleEnter() {
    if (!startScreen || startScreen.classList.contains('hidden')) return;
    startScreen.classList.add('hidden');
    if (backgroundMusic) {
      backgroundMusic.muted = false;
      backgroundMusic.play().catch(() => {});
    }
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
    startScreen.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleEnter();
    });
  }

  // Username (Static, no typing animation)
  let userNameStr = "zhu";

  // Typewriter Bio (Loops between anja my world and owner of /larpifyy)
  const bioMessages = [
    "anja my world",
    "owner of /larpifyy"
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

    // Sort order: Verified (1) -> Nitro (2) -> Developer (3) -> Booster (4) -> Gifted (5) -> Others
    const sortedBadges = userBadges.slice().sort((a, b) => {
      const getPriority = (filename) => {
        const lower = filename.toLowerCase();
        if (lower.includes('verified')) return 1;
        if (lower.includes('nitro')) return 2;
        if (lower.includes('developer')) return 3;
        if (lower.includes('booster')) return 4;
        if (lower.includes('gifted')) return 5;
        return 6;
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
      if (spotifyArt) spotifyArt.src = data.spotify.album_art_url || '';
      if (spotifySong) {
        spotifySong.textContent = data.spotify.song || 'Unknown Track';
        spotifySong.href = data.spotify.track_id ? `https://open.spotify.com/track/${data.spotify.track_id}` : '#';
      }
      if (spotifyArtist) {
        spotifyArtist.textContent = `${data.spotify.artist || ''} • ${data.spotify.album || ''}`;
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

    const particleCount = Math.min(Math.max(Math.floor((w * h) / 14000), 45), 90);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.5 + 0.3
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
        ctx.shadowBlur = 6;
        ctx.shadowColor = themeColor;
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