// ============================================================
// FireFly — app logic
// ============================================================

const isLite = /CrOS/i.test(navigator.userAgent) || navigator.connection?.saveData === true;
if (isLite) document.documentElement.classList.add('is-lite');

// ---- Loading screen -------------------------------------------
// Known files only. Lite devices skip the photo cycle entirely.
const LoadingScreen = (() => {
  const FRAMES = [
    'loading images/1.jpg',
    'loading images/2.jpg',
    'loading images/3.jpg',
    'loading images/4.jpg',
    'loading images/5.jpg',
    'loading images/6.jpg',
    'loading images/7.jpg',
    'loading images/8.jpg',
    'loading images/9.jpg',
    'loading images/10.webp',
    'loading images/11.jpg',
    'loading images/12.jpg',
    'loading images/13.jpg',
    'loading images/14.jpg',
  ];
  const FADE_MS = 250;
  const CYCLE_MS = 1750;
  const MIN_VISIBLE_MS = isLite ? 180 : 400;
  const MAX_WAIT_MS = 8000;

  const screenEl = document.getElementById('loadingScreen');
  const imgEl = document.getElementById('loadingImg');

  let cycleTimer = null;
  let fadeTimer = null;
  let frameIndex = 0;
  let hasShownFrame = false;
  let hidden = false;
  const startedAt = Date.now();

  function showFrame(index) {
    if (!FRAMES.length || !imgEl) return;

    function applyFrame() {
      imgEl.src = FRAMES[index];
      imgEl.onload = () => {
        void imgEl.offsetWidth;
        imgEl.classList.add('is-shown');
        hasShownFrame = true;
      };
    }

    if (!hasShownFrame) {
      applyFrame();
      return;
    }

    imgEl.classList.remove('is-shown');
    fadeTimer = setTimeout(applyFrame, FADE_MS);
  }

  function startCycling() {
    if (cycleTimer || !imgEl) return;
    frameIndex = 0;
    showFrame(frameIndex);
    cycleTimer = setInterval(() => {
      frameIndex = (frameIndex + 1) % FRAMES.length;
      showFrame(frameIndex);
    }, CYCLE_MS);
  }

  function stopCycling() {
    if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
  }

  function hide() {
    if (hidden) return;
    hidden = true;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt));
    setTimeout(() => {
      stopCycling();
      screenEl.classList.add('is-hidden');
    }, wait);
  }

  function init() {
    if (!screenEl) return;
    setTimeout(hide, MAX_WAIT_MS);
    startCycling();
  }

  init();

  return { hide };
})();

// ---- Library ------------------------------------------------
// Add more tracks here later — every list in the app is built from this array.
const LIBRARY = [
  {
    id: 'fireflies',
    title: 'Fireflies',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/Fireflies.mp3',
  },
  {
    id: 'ontopoftheworld',
    title: 'On Top Of The World',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/On Top Of The World.mp3',
  },
  {
    id: 'heatwaves',
    title: 'Heat Waves',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/Heat Waves.mp3',
  },
  {
    id: 'somenights',
    title: 'Some Nights',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/Some Nights.mp3',
  },
  {
    id: 'houseofmemories',
    title: 'House Of Memories',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/House Of Memories.mp3',
  },
  {
    id: 'weareyoung',
    title: 'We Are Young',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/We Are Young.mp3',
  },
  {
    id: 'safeandsound',
    title: 'Safe And Sound',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/Safe And Sound.mp3',
  },
  {
    id: 'payphone',
    title: 'Payphone',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/Payphone.mp3',
  },
  {
    id: 'halloffame',
    title: 'Hall of Fame',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/Hall of Fame.mp3',
  },
  {
    id: 'monody',
    title: 'Monody',
    artist: 'TheFatRat (feat. Laura Brehm)',
    src: 'music/Monody.mp3',
  },
  {
    id: 'unity',
    title: 'Unity',
    artist: 'TheFatRat',
    src: 'music/Unity.mp3',
  },
  {
    id: 'flyaway',
    title: 'Fly Away',
    artist: 'TheFatRat (feat. Anjulie)',
    src: 'music/Fly Away.mp3',
  },
  {
    id: 'windfall',
    title: 'Windfall',
    artist: 'TheFatRat',
    src: 'music/Windfall.mp3',
  },
  {
    id: 'play',
    title: 'PLAY',
    artist: 'Alan Walker, K-391, Tungevaag, Mangoo',
    src: 'music/PLAY.mp3',
  },
  {
    id: 'ignite',
    title: 'Ignite',
    artist: 'Alan Walker & K-391 (ft. Julie Bergan & Seungri)',
    src: 'music/Ignite.mp3',
  },
  {
    id: 'darkside',
    title: 'Darkside',
    artist: 'Alan Walker (feat. AuRa and Tomine Harket)',
    src: 'music/Darkside.mp3',
  },
  {
    id: 'endoftime',
    title: 'End of Time',
    artist: 'K-391, Alan Walker & Ahrix',
    src: 'music/End of Time.mp3',
  },
  {
    id: 'lily',
    title: 'Lily',
    artist: 'Alan Walker, K-391 & Emelie Hollow',
    src: 'music/Lily.mp3',
  },
  {
    id: 'ineedyourlove',
    title: 'I Need Your Love',
    artist: 'Calvin Harris, Ellie Goulding',
    src: 'music/I Need Your Love.mp3',
  },
  {
    id: 'alone',
    title: 'Alone',
    artist: 'Alan Walker',
    src: 'music/Alone.mp3',
  },
  {
    id: 'thespectre',
    title: 'The Spectre',
    artist: 'Alan Walker',
    src: 'music/The Spectre.mp3',
  },
  {
    id: 'faded',
    title: 'Faded',
    artist: 'Alan Walker',
    src: 'music/Faded.mp3',
  },
  {
    id: 'dontletmedown',
    title: "Don't Let Me Down",
    artist: 'The Chainsmokers (ft. Daya)',
    src: "music/Don't Let Me Down.mp3",
  },
  {
    id: 'outside',
    title: 'Outside',
    artist: 'Calvin Harris (ft. Ellie Goulding)',
    src: 'music/Outside.mp3',
  },
];

const PHONK = [
  {
    id: 'screams',
    title: 'SCREAMS!',
    artist: 'Phonk',
    src: 'music/SCREAMS!.mp3',
  },
];

// ---- State ----------------------------------------------------
const state = {
  queue: [...LIBRARY],      // ordered list currently playing through
  queueIndex: -1,           // index into state.queue of the current track
  isPlaying: false,
  isShuffled: false,
  repeatMode: 'off',        // 'off' | 'all' | 'one'
  isMuted: false,
  volume: 0.8,
  isDraggingProgress: false,
  isDraggingVolume: false,
};

// ---- DOM refs ---------------------------------------------------
const audioEl = document.getElementById('audioEl');

const railBtns = document.querySelectorAll('.rail-btn[data-tab]');
const panels = document.querySelectorAll('.panel');
const jumpCards = document.querySelectorAll('[data-jump]');

const themeOpts = document.querySelectorAll('[data-theme-choice]');

const musicListEl = document.getElementById('musicList');
const phonkListEl = document.getElementById('phonkList');
const homeRecentListEl = document.getElementById('homeRecentList');
const homeFeaturedGamesEl = document.getElementById('homeFeaturedGames');
const shuffleFeaturedBtn = document.getElementById('shuffleFeaturedBtn');

const playAllBtn = document.getElementById('playAllBtn');
const shuffleAllBtn = document.getElementById('shuffleAllBtn');

const playerBar = document.getElementById('playerBar');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');

const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');

const progressTrack = document.getElementById('progressTrack');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');

const muteBtn = document.getElementById('muteBtn');
const volumeTrack = document.getElementById('volumeTrack');
const volumeFill = document.getElementById('volumeFill');
const volumeHandle = document.getElementById('volumeHandle');

const autoplayToggle = document.getElementById('autoplayToggle');
const defaultVolumeSlider = document.getElementById('defaultVolumeSlider');

// ============================================================
// Tab navigation
// ============================================================

function activateTab(tabName) {
  railBtns.forEach((btn) => {
    const isMatch = btn.dataset.tab === tabName;
    btn.classList.toggle('is-active', isMatch);
    btn.setAttribute('aria-selected', String(isMatch));
  });

  panels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.id === `panel-${tabName}`);
  });

  if (tabName === 'home' && homeFeaturedGamesEl && !homeFeaturedGamesEl.querySelector('.game-card')) {
    renderFeaturedGames();
  }

  if (tabName === 'games') {
    requestAnimationFrame(() => showGamesTab());
  }
}

railBtns.forEach((btn) => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

jumpCards.forEach((card) => {
  card.addEventListener('click', () => activateTab(card.dataset.jump));
});

// ============================================================
// Theme
// ============================================================

const THEMES = ['ember', 'shark-blue', 'blank'];

let pendingTheme = null;
let themeFadeTimer = null;

function setTheme(theme, { animate = true } = {}) {
  if (!THEMES.includes(theme)) theme = 'ember';
  const root = document.documentElement;
  const current = root.getAttribute('data-theme');

  function paint(next) {
    root.setAttribute('data-theme', next);
    themeOpts.forEach((opt) => {
      opt.classList.toggle('is-active', opt.dataset.themeChoice === next);
    });
    try {
      localStorage.setItem('firefly-theme', next);
    } catch (e) {
      // localStorage unavailable — theme just won't persist across reloads
    }
  }

  if (!animate || current === theme) {
    paint(theme);
    return;
  }

  pendingTheme = theme;
  if (themeFadeTimer) return;

  root.classList.add('is-theme-fading');
  themeFadeTimer = window.setTimeout(() => {
    paint(pendingTheme);
    pendingTheme = null;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('is-theme-fading');
        themeFadeTimer = null;
      });
    });
  }, 360);
}

themeOpts.forEach((opt) => {
  opt.addEventListener('click', () => setTheme(opt.dataset.themeChoice));
});

(function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem('firefly-theme');
  } catch (e) {
    // ignore
  }
  setTheme(THEMES.includes(saved) ? saved : 'ember', { animate: false });
})();

// ============================================================
// Time formatting
// ============================================================

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// ============================================================
// Rendering track lists
// ============================================================

function makeTrackRow(track, indexInList, { showAdd = true } = {}) {
  const row = document.createElement('div');
  row.className = 'track-row';
  row.dataset.trackId = track.id;

  const isCurrentTrack = state.queue[state.queueIndex]?.id === track.id;
  if (isCurrentTrack) row.classList.add('is-playing');

  row.innerHTML = `
    <span class="track-index">${indexInList + 1}</span>
    <span class="track-play-icon">
      <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
    </span>
    <span class="track-art">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18V6l11-2v12" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.6"/><circle cx="17.5" cy="16" r="2.6"/></svg>
    </span>
    <span class="track-info">
      <span class="track-name">${track.title}</span>
      <span class="track-artist">${track.artist}</span>
    </span>
    <span class="track-dur">${track.durationLabel || '--:--'}</span>
    ${
      showAdd
        ? `<button class="track-add" title="Add to queue" data-add-id="${track.id}">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
           </button>`
        : ''
    }
  `;

  row.addEventListener('click', (e) => {
    if (e.target.closest('[data-add-id]')) return; // handled separately below
    playTrackById(track.id, { fromLibrary: true });
  });

  const addBtn = row.querySelector('[data-add-id]');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToQueue(track);
    });
  }

  return row;
}

function renderMusicList() {
  musicListEl.innerHTML = '';
  LIBRARY.forEach((track, i) => {
    musicListEl.appendChild(makeTrackRow(track, i, { showAdd: false }));
  });
}

function renderPhonkList() {
  if (!phonkListEl) return;
  phonkListEl.innerHTML = '';
  PHONK.forEach((track, i) => {
    phonkListEl.appendChild(makeTrackRow(track, i, { showAdd: false }));
  });
}

function renderHomeRecent() {
  homeRecentListEl.innerHTML = '';
  const recent = LIBRARY.slice(-8);
  recent.forEach((track, i) => {
    homeRecentListEl.appendChild(makeTrackRow(track, i, { showAdd: false }));
  });
}

const HOME_FEATURED_COUNT = 4;

function pickRandomGames(list, count) {
  const pool = [...list];
  const picks = [];
  while (pool.length && picks.length < count) {
    const i = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(i, 1)[0]);
  }
  return picks;
}

function renderFeaturedGames() {
  if (!homeFeaturedGamesEl) return;
  homeFeaturedGamesEl.innerHTML = '';

  if (!games.length) {
    const empty = document.createElement('div');
    empty.className = 'home-games-empty';
    empty.textContent = 'Loading games…';
    homeFeaturedGamesEl.appendChild(empty);
    return;
  }

  pickRandomGames(games, HOME_FEATURED_COUNT).forEach((game) => {
    homeFeaturedGamesEl.appendChild(makeGameCard(game, -1, { bindClick: true, compact: false }));
  });
}

shuffleFeaturedBtn?.addEventListener('click', renderFeaturedGames);

function catalogForTrack(trackId) {
  if (LIBRARY.some((t) => t.id === trackId)) return LIBRARY;
  if (PHONK.some((t) => t.id === trackId)) return PHONK;
  return LIBRARY;
}

function refreshAllLists() {
  renderMusicList();
  renderPhonkList();
  renderHomeRecent();
  highlightPlayingTracks();
}

function highlightPlayingTracks() {
  const id = state.queue[state.queueIndex]?.id;
  document.querySelectorAll('.track-row').forEach((row) => {
    row.classList.toggle('is-playing', row.dataset.trackId === id);
  });
  document.documentElement.classList.toggle('is-audio-playing', state.isPlaying);
}

// ============================================================
// Queue & playback
// ============================================================

function addToQueue(track) {
  state.queue.push({ ...track });
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadTrackAtIndex(index, { autoplay = true } = {}) {
  if (index < 0 || index >= state.queue.length) return;

  state.queueIndex = index;
  const track = state.queue[index];

  audioEl.src = track.src;
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist;
  playerTitle.title = `${track.title} — ${track.artist}`;
  updatePlayerRail();

  if (autoplay) {
    audioEl.play().catch(() => {
      // Autoplay can be blocked by the browser until the user interacts —
      // the UI will just show the paused state, which is still correct.
    });
  }

  highlightPlayingTracks();
}

function playTrackById(trackId, { fromLibrary = false } = {}) {
  if (fromLibrary) {
    // Starting a catalog track resets the queue to "this track, then the rest of its section"
    const catalog = catalogForTrack(trackId);
    const startIdx = catalog.findIndex((t) => t.id === trackId);
    if (startIdx === -1) return;
    state.queue = [...catalog.slice(startIdx), ...catalog.slice(0, startIdx)];
    loadTrackAtIndex(0);
    return;
  }

  const idx = state.queue.findIndex((t) => t.id === trackId);
  if (idx !== -1) loadTrackAtIndex(idx);
}

function playAll() {
  state.queue = [...LIBRARY];
  loadTrackAtIndex(0);
}

function shuffleAll() {
  state.queue = shuffleArray(LIBRARY);
  state.isShuffled = true;
  shuffleBtn.classList.add('is-active');
  shuffleAllBtn.classList.add('is-active');
  loadTrackAtIndex(0);
}

function goNext() {
  if (state.repeatMode === 'one') {
    loadTrackAtIndex(state.queueIndex);
    return;
  }

  const nextIdx = state.queueIndex + 1;

  if (nextIdx < state.queue.length) {
    loadTrackAtIndex(nextIdx);
  } else if (state.repeatMode === 'all') {
    loadTrackAtIndex(0);
  } else {
    // End of queue — stop rather than looping silently
    state.isPlaying = false;
    updatePlayButtonUI();
  }
}

function goPrev() {
  // If we're more than 3s into the track, restart it instead of going back
  if (audioEl.currentTime > 3) {
    audioEl.currentTime = 0;
    return;
  }
  const prevIdx = state.queueIndex - 1;
  if (prevIdx >= 0) {
    loadTrackAtIndex(prevIdx);
  } else {
    audioEl.currentTime = 0;
  }
}

function togglePlayPause() {
  if (state.queueIndex === -1) {
    playAll();
    return;
  }
  if (audioEl.paused) {
    audioEl.play().catch(() => {});
  } else {
    audioEl.pause();
  }
}

function cycleRepeatMode() {
  const order = ['off', 'all', 'one'];
  const current = order.indexOf(state.repeatMode);
  state.repeatMode = order[(current + 1) % order.length];

  repeatBtn.classList.toggle('is-active', state.repeatMode !== 'off');
  repeatBtn.title =
    state.repeatMode === 'off' ? 'Repeat off'
    : state.repeatMode === 'all' ? 'Repeat all'
    : 'Repeat one';
}

// ============================================================
// Player UI sync
// ============================================================

function updatePlayButtonUI() {
  playBtn.classList.toggle('is-playing', state.isPlaying);
  playBtn.title = state.isPlaying ? 'Pause' : 'Play';
  updatePlayerRail();
  highlightPlayingTracks();
}

function updatePlayerRail() {
  const open = state.queueIndex !== -1;
  playerBar.classList.toggle('is-open', open);
  playerBar.setAttribute('aria-hidden', String(!open));
}

function updateProgressUI() {
  if (state.isDraggingProgress) return;
  const duration = audioEl.duration || 0;
  const current = audioEl.currentTime || 0;
  const pct = duration > 0 ? (current / duration) * 100 : 0;

  progressFill.style.height = `${pct}%`;
  progressHandle.style.top = `${pct}%`;
  currentTimeEl.textContent = formatTime(current);
  durationTimeEl.textContent = formatTime(duration);
}

function updateVolumeUI() {
  const pct = state.isMuted ? 0 : state.volume * 100;
  volumeFill.style.height = `${pct}%`;
  volumeHandle.style.top = `${100 - pct}%`;
  muteBtn.querySelector('.icon-vol-on').style.display = state.isMuted ? 'none' : 'block';
  muteBtn.querySelector('.icon-vol-off').style.display = state.isMuted ? 'block' : 'none';
}

// ---- Audio element events ----
audioEl.addEventListener('play', () => {
  state.isPlaying = true;
  updatePlayButtonUI();
});

audioEl.addEventListener('pause', () => {
  state.isPlaying = false;
  updatePlayButtonUI();
});

let progressRaf = 0;
audioEl.addEventListener('timeupdate', () => {
  if (progressRaf) return;
  progressRaf = requestAnimationFrame(() => {
    progressRaf = 0;
    updateProgressUI();
  });
});
audioEl.addEventListener('loadedmetadata', updateProgressUI);

audioEl.addEventListener('ended', () => {
  if (autoplayToggle.classList.contains('is-on')) {
    goNext();
  } else {
    state.isPlaying = false;
    updatePlayButtonUI();
  }
});

// ---- Transport buttons ----
playBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', goNext);
prevBtn.addEventListener('click', goPrev);
repeatBtn.addEventListener('click', cycleRepeatMode);

shuffleBtn.addEventListener('click', () => {
  if (state.isShuffled) {
    state.isShuffled = false;
    shuffleBtn.classList.remove('is-active');
    shuffleAllBtn.classList.remove('is-active');
  } else {
    shuffleAll();
  }
});

playAllBtn.addEventListener('click', playAll);
shuffleAllBtn.addEventListener('click', shuffleAll);

// ---- Progress bar scrubbing ----
function seekFromEvent(clientY) {
  const rect = progressTrack.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
  const duration = audioEl.duration || 0;
  audioEl.currentTime = pct * duration;
  progressFill.style.height = `${pct * 100}%`;
  progressHandle.style.top = `${pct * 100}%`;
  currentTimeEl.textContent = formatTime(pct * duration);
}

progressTrack.addEventListener('pointerdown', (e) => {
  state.isDraggingProgress = true;
  seekFromEvent(e.clientY);
});

window.addEventListener('pointermove', (e) => {
  if (state.isDraggingProgress) seekFromEvent(e.clientY);
  if (state.isDraggingVolume) setVolumeFromEvent(e.clientY);
});

window.addEventListener('pointerup', () => {
  state.isDraggingProgress = false;
  state.isDraggingVolume = false;
});

// ---- Volume ----
function setVolumeFromEvent(clientY) {
  const rect = volumeTrack.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height));
  state.volume = pct;
  state.isMuted = false;
  audioEl.volume = pct;
  audioEl.muted = false;
  updateVolumeUI();
}

volumeTrack.addEventListener('pointerdown', (e) => {
  state.isDraggingVolume = true;
  setVolumeFromEvent(e.clientY);
});

muteBtn.addEventListener('click', () => {
  state.isMuted = !state.isMuted;
  audioEl.muted = state.isMuted;
  updateVolumeUI();
});

// ============================================================
// Settings tab
// ============================================================

autoplayToggle.addEventListener('click', () => {
  autoplayToggle.classList.toggle('is-on');
  autoplayToggle.setAttribute(
    'aria-checked',
    String(autoplayToggle.classList.contains('is-on'))
  );
});

defaultVolumeSlider.addEventListener('input', (e) => {
  const pct = Number(e.target.value) / 100;
  state.volume = pct;
  audioEl.volume = pct;
  state.isMuted = false;
  audioEl.muted = false;
  updateVolumeUI();
});

// ============================================================
// Games state (declared early — referenced during initial render)
// ============================================================

let games = [];
let visibleGames = [];
let currentGame = null;
const compressedSaved = (() => {
  try { return localStorage.getItem('compressedMode'); } catch (e) { return null; }
})();
let compressedMode = compressedSaved === 'true';
let virtualRange = { start: -1, end: -1, cols: 0, compact: null };
let virtualRaf = 0;

// ============================================================
// Init
// ============================================================

audioEl.volume = state.volume;
refreshAllLists();
updateVolumeUI();
updateProgressUI();
updatePlayerRail();

// ============================================================
// Games
// ============================================================

const ZONES_URL = 'https://cdn.jsdelivr.net/gh/freebuisness/assets@latest/zones.json';
const COVER_BASE = 'https://cdn.jsdelivr.net/gh/freebuisness/covers@latest';
const HTML_BASE = 'https://cdn.jsdelivr.net/gh/freebuisness/html@latest';
const ABMINN_LIST = 'https://cdn.jsdelivr.net/gh/abminn/Nexus-Games@latest/Games/all.js';
const ABMINN_BASE = 'https://cdn.jsdelivr.net/gh/abminn/Nexus-Games@latest/Games/';
const ABMINN_IMAGES = 'https://cdn.jsdelivr.net/gh/abminn/Nexus-Games@latest/Images/';
const XADEN_JSON = 'https://cdn.jsdelivr.net/gh/X-NOBER/My-My-What-else-can-you-do-with-those-shadows-Xaden-@main/Xadenv4.json';

const gameListEl = document.getElementById('gameList');
const gameSearchEl = document.getElementById('gameSearch');
const compressedBtn = document.getElementById('compressedBtn');
const gamePlayer = document.getElementById('gamePlayer');
const gameFrame = document.getElementById('gameFrame');
const gameMenuButton = document.getElementById('gameMenuButton');
const gameMenuDropdown = document.getElementById('gameMenuDropdown');
const closeGameBtn = document.getElementById('closeGameBtn');
const reloadGameBtn = document.getElementById('reloadGameBtn');
const openBlankBtn = document.getElementById('openBlankBtn');

function parseGameList(text) {
  const match = text.match(/\[([\s\S]*?)\]/);
  if (!match) return [];

  return match[1]
    .split(',')
    .map((x) => x.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

async function loadGames() {
  const allGames = [];
  const [zonesResult, xadenResult, abminnResult] = await Promise.allSettled([
    fetch(ZONES_URL).then((r) => r.json()),
    fetch(XADEN_JSON).then((r) => r.json()),
    fetch(ABMINN_LIST).then((r) => r.text()),
  ]);

  if (zonesResult.status === 'fulfilled') {
    zonesResult.value.forEach((game) => {
      allGames.push({
        name: game.name,
        cover: game.cover
          ? game.cover.replace('{COVER_URL}', COVER_BASE)
          : null,
        url: game.url.replace('{HTML_URL}', HTML_BASE)
      });
    });
  } else {
    console.error('Failed to load FROG zones', zonesResult.reason);
  }

  if (xadenResult.status === 'fulfilled') {
    xadenResult.value.forEach((game) => {
      allGames.push({
        name: game.name,
        cover: game.cover,
        url: game.url,
        source: 'xaden'
      });
    });
  } else {
    console.error('Failed to load Xaden games', xadenResult.reason);
  }

  if (abminnResult.status === 'fulfilled') {
    parseGameList(abminnResult.value).forEach((name) => {
      allGames.push({
        name,
        cover: ABMINN_IMAGES + encodeURIComponent(name) + '.png',
        url: ABMINN_BASE + encodeURIComponent(name) + '/index.html'
      });
    });
  } else {
    console.error('Failed to load ABMINN games', abminnResult.reason);
  }

  games = uniqueGames(
    allGames
      .filter((game) => game.name && !game.name.startsWith('[!]'))
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  renderFeaturedGames();
  if (document.getElementById('panel-games')?.classList.contains('is-active')) {
    showGamesTab();
  }
}

function uniqueGames(list) {
  const seen = new Set();
  const out = [];
  for (const game of list) {
    const key = game.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(game);
  }
  return out;
}

const GAME_GAP = 8;
const GAME_MIN_W = isLite ? 210 : 190;
const GAME_MIN_W_COMPACT = 140;
const GAME_ROW_BUFFER = isLite ? 0 : 1;

function setCoverSrc(img, src) {
  const next = src || '';
  if (!next) {
    if (img.dataset.src) {
      img.dataset.src = '';
      img.removeAttribute('src');
    }
    return;
  }
  if (img.dataset.src === next) return;
  img.dataset.src = next;
  img.src = next;
}

function makeCoverImg() {
  const img = document.createElement('img');
  img.alt = '';
  img.decoding = 'async';
  return img;
}

function makeGameCard(game, index, { bindClick = false, compact = compressedMode } = {}) {
  const card = document.createElement('div');
  card.className = 'game-card' + (compact ? ' compact' : '');
  if (index >= 0) card.dataset.index = String(index);

  let img = null;
  if (!compact) {
    img = makeCoverImg();
    card.appendChild(img);
    if (game.cover) setCoverSrc(img, game.cover);
  }

  const name = document.createElement('div');
  name.className = 'game-card-name';
  name.textContent = game.name;
  card.appendChild(name);
  card._img = img;
  card._name = name;

  if (bindClick) {
    card.addEventListener('click', () => openGame(game));
  }

  return card;
}

function updateGameCard(card, game, index) {
  if (card.dataset.index === String(index) && card._game === game) return;

  card.dataset.index = String(index);
  card._game = game;
  card.classList.toggle('compact', compressedMode);

  const name = card._name || card.querySelector('.game-card-name');
  card._name = name;
  if (name && name.textContent !== game.name) name.textContent = game.name;

  let img = card._img || card.querySelector('img');
  if (compressedMode) {
    if (img) {
      img.remove();
      card._img = null;
    }
    return;
  }

  if (!img) {
    img = makeCoverImg();
    card.insertBefore(img, name);
  }
  card._img = img;
  setCoverSrc(img, game.cover || '');
}

function gameCardMetrics() {
  const width = gameListEl.clientWidth || 1;
  const minW = compressedMode ? GAME_MIN_W_COMPACT : GAME_MIN_W;
  const cols = Math.max(1, Math.floor((width + GAME_GAP) / (minW + GAME_GAP)));
  const cardW = (width - GAME_GAP * (cols - 1)) / cols;
  const imgH = compressedMode ? 0 : cardW * (9 / 16);
  const nameH = compressedMode ? 42 : 40;
  const cardH = imgH + nameH;
  return { cols, cardH, rowStride: cardH + GAME_GAP };
}

let gridSizer = null;
let gridWindow = null;
const gamesPanelEl = document.getElementById('panel-games');

function ensureGameGrid() {
  if (gridWindow && gameListEl.contains(gridWindow)) return;
  gameListEl.className = 'game-grid-host';
  gameListEl.replaceChildren();
  gridSizer = document.createElement('div');
  gridSizer.className = 'game-grid-sizer';
  gridWindow = document.createElement('div');
  gridWindow.className = 'game-grid game-grid-window';
  gameListEl.append(gridSizer, gridWindow);
}

function paintVirtualGames() {
  if (!visibleGames.length || !gameListEl) return;

  ensureGameGrid();
  gridWindow.classList.toggle('compact', compressedMode);

  const { cols, cardH, rowStride } = gameCardMetrics();
  const total = visibleGames.length;
  const rows = Math.ceil(total / cols);
  const nextHeight = `${Math.max(0, rows * cardH + Math.max(0, rows - 1) * GAME_GAP)}px`;
  if (gridSizer.style.height !== nextHeight) gridSizer.style.height = nextHeight;
  gridWindow.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

  const viewTop = Math.max(0, gamesPanelEl.scrollTop - gameListEl.offsetTop);
  const viewBottom = viewTop + gamesPanelEl.clientHeight;
  const startRow = Math.max(0, Math.floor(viewTop / rowStride) - GAME_ROW_BUFFER);
  const endRow = Math.min(rows, Math.ceil(viewBottom / rowStride) + GAME_ROW_BUFFER);
  const start = startRow * cols;
  const end = Math.min(total, endRow * cols);

  gridWindow.style.transform = `translate3d(0, ${startRow * rowStride}px, 0)`;

  const needed = end - start;
  const sameRange =
    virtualRange.start === start &&
    virtualRange.end === end &&
    virtualRange.cols === cols &&
    virtualRange.compact === compressedMode;

  if (sameRange && gridWindow.childElementCount === needed) return;

  virtualRange = { start, end, cols, compact: compressedMode };

  while (gridWindow.childElementCount > needed) {
    gridWindow.lastElementChild.remove();
  }

  for (let i = 0; i < needed; i += 1) {
    const gameIndex = start + i;
    const game = visibleGames[gameIndex];
    let card = gridWindow.children[i];
    if (!card) {
      card = makeGameCard(game, gameIndex);
      card._game = game;
      gridWindow.appendChild(card);
    } else {
      updateGameCard(card, game, gameIndex);
    }
  }
}

function scheduleVirtualPaint() {
  if (virtualRaf) return;
  virtualRaf = requestAnimationFrame(() => {
    virtualRaf = 0;
    paintVirtualGames();
  });
}

function renderGames(list) {
  visibleGames = list;
  virtualRange = { start: -1, end: -1, cols: 0, compact: null };
  gridSizer = null;
  gridWindow = null;

  if (!list.length) {
    gameListEl.className = 'game-grid-host';
    gameListEl.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'game-empty';
    empty.textContent = 'No games found.';
    gameListEl.appendChild(empty);
    return;
  }

  paintVirtualGames();
}

function filteredGames() {
  const query = gameSearchEl.value.toLowerCase().trim();
  if (!query) return games;
  return games.filter((game) => game.name.toLowerCase().includes(query));
}

function showGamesTab() {
  if (!gameListEl) return;
  if (!games.length) {
    if (gridWindow) return;
    gameListEl.className = 'game-grid-host';
    gameListEl.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'game-empty';
    empty.textContent = 'Loading games…';
    gameListEl.appendChild(empty);
    return;
  }

  if (gridWindow && gameListEl.contains(gridWindow) && !gameSearchEl.value.trim()) {
    scheduleVirtualPaint();
    return;
  }
  renderGames(filteredGames());
}

async function openGame(game) {
  currentGame = game;
  gameMenuDropdown.classList.remove('is-open');
  gamePlayer.classList.add('is-open');
  gamePlayer.setAttribute('aria-hidden', 'false');

  try {
    const response = await fetch(game.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    let html = await response.text();
    const baseUrl = game.url.substring(0, game.url.lastIndexOf('/') + 1);

    if (!html.toLowerCase().includes('<base')) {
      html = html.replace(
        /<head([^>]*)>/i,
        `<head$1><base href="${baseUrl}">`
      );
    }

    gameFrame.srcdoc = html;
  } catch (err) {
    console.error('Failed to load game HTML', err);
    gameFrame.src = game.url;
  }
}

function closeGame() {
  gameFrame.srcdoc = '';
  gameFrame.src = 'about:blank';
  gamePlayer.classList.remove('is-open');
  gamePlayer.setAttribute('aria-hidden', 'true');
  gameMenuDropdown.classList.remove('is-open');
  currentGame = null;
}

function reloadGame() {
  if (currentGame) openGame(currentGame);
}

async function openBlank() {
  if (!currentGame) return;

  const win = window.open('about:blank', '_blank');
  if (!win) {
    alert('Popup blocked');
    return;
  }

  try {
    const response = await fetch(currentGame.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    let html = await response.text();
    const baseUrl = currentGame.url.substring(0, currentGame.url.lastIndexOf('/') + 1);

    if (!html.toLowerCase().includes('<base')) {
      html = html.replace(
        /<head([^>]*)>/i,
        `<head$1><base href="${baseUrl}">`
      );
    }

    win.document.open();
    win.document.write(html);
    win.document.close();
  } catch (err) {
    console.error('Failed to open game in about:blank', err);
    win.location.href = currentGame.url;
  }
}

function toggleGameMenu() {
  gameMenuDropdown.classList.toggle('is-open');
}

compressedBtn.textContent = `Compressed Mode: ${compressedMode ? 'ON' : 'OFF'}`;

gameListEl.addEventListener('click', (e) => {
  const card = e.target.closest('.game-card');
  if (!card || !gameListEl.contains(card)) return;
  const game = visibleGames[Number(card.dataset.index)];
  if (game) openGame(game);
});

let searchTimer = null;
gameSearchEl.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    renderGames(filteredGames());
  }, 120);
});

compressedBtn.addEventListener('click', () => {
  compressedMode = !compressedMode;
  localStorage.setItem('compressedMode', compressedMode);
  compressedBtn.textContent = `Compressed Mode: ${compressedMode ? 'ON' : 'OFF'}`;
  renderGames(filteredGames());
});

gamesPanelEl.addEventListener('scroll', scheduleVirtualPaint, { passive: true });

let lastGridW = 0;
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver((entries) => {
    const w = Math.round(entries[0].contentRect.width);
    if (Math.abs(w - lastGridW) < 8) return;
    lastGridW = w;
    if (gamesPanelEl.classList.contains('is-active')) scheduleVirtualPaint();
  }).observe(gameListEl);
} else {
  window.addEventListener('resize', () => {
    if (gamesPanelEl.classList.contains('is-active')) scheduleVirtualPaint();
  });
}

gameMenuButton.addEventListener('click', toggleGameMenu);
closeGameBtn.addEventListener('click', closeGame);
reloadGameBtn.addEventListener('click', reloadGame);
openBlankBtn.addEventListener('click', openBlank);

LoadingScreen.hide();
loadGames();

window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "Do you really want to close this tab?";
});