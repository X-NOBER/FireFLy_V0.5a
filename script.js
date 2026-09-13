// ============================================================
// FireFly — app logic
// ============================================================

// ---- Loading screen -------------------------------------------
// Cycles through "loading images/1.png", "2.png", "3.png"... The folder
// has no manifest, so we discover the count by probing sequential
// numbers until one fails to load. Since "numbered 1-inf" implies
// the folder could hold a lot of images, probing is batched and
// run in parallel rather than one-at-a-time: cycling starts as
// soon as the first batch resolves, and the rest of the sequence
// is discovered in the background and folded into the rotation as
// it arrives, so a large folder never delays the first frame.
// Call LoadingScreen.hide() once the app has real data to show;
// it also enforces a minimum display time so the screen never
// just flashes on a fast load.
const LoadingScreen = (() => {
  const FOLDER = 'loading images';
  const EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
  const BATCH_SIZE = 6; // numbers probed in parallel per round
  const MAX_PROBE = 500; // hard ceiling so a misconfigured folder can't probe forever
  const FADE_MS = 250; // must match .loading-img's opacity transition duration in main.css
  const ZOOM_MS = 600; // must match .loading-img's transform transition duration in main.css
  const HOLD_MS = 900; // how long a fully zoomed-in frame sits before the next cycle
  const CYCLE_MS = FADE_MS + ZOOM_MS + HOLD_MS;
  const MIN_VISIBLE_MS = 1000 + Math.random() * 9000; // random floor, 1s-10s, picked once per load
  const MAX_WAIT_MS = 29000; // safety net if loadGames() ever hangs

  const screenEl = document.getElementById('loadingScreen');
  const imgEl = document.getElementById('loadingImg');

  let frames = [];
  let cycleTimer = null;
  let fadeTimer = null; // pending setTimeout from an in-flight showFrame() fade-out
  let frameIndex = 0;
  let hasShownFrame = false; // becomes true after the very first frame is applied
  let hidden = false;
  const startedAt = Date.now();

  function probeOne(number) {
    return new Promise((resolve) => {
      let remaining = EXTENSIONS.length;
      let found = null;
      let settled = false;

      EXTENSIONS.forEach((ext) => {
        const testImg = new Image();
        testImg.onload = () => {
          if (!found) found = `${FOLDER}/${number}.${ext}`;
          remaining -= 1;
          if (remaining === 0 && !settled) { settled = true; resolve(found); }
        };
        testImg.onerror = () => {
          remaining -= 1;
          if (remaining === 0 && !settled) { settled = true; resolve(found); }
        };
        testImg.src = encodeURI(`${FOLDER}/${number}.${ext}`);
      });
    });
  }

  // Probes numbers in fixed-size parallel batches (1-6, then 7-12, ...).
  // Within a batch, order is preserved even though requests race, since
  // each slot's result is placed by its position, not arrival order.
  // A batch is only accepted in full if every slot up to the first gap
  // succeeded — the moment one slot in a batch is empty, everything
  // from that slot onward (including later, unrelated batches) is
  // discarded, so a gap still reliably ends the sequence rather than
  // leaving a hole that gets skipped over.
  // onBatch(newFrames) fires after each accepted batch so the caller
  // can start showing images without waiting for the full folder.
  async function discoverFrames(onBatch) {
    const found = [];
    let start = 1;
    let hitGap = false;

    while (!hitGap && start <= MAX_PROBE) {
      const numbers = [];
      for (let i = 0; i < BATCH_SIZE && start + i <= MAX_PROBE; i += 1) {
        numbers.push(start + i);
      }
      const results = await Promise.all(numbers.map(probeOne));

      const newlyFound = [];
      for (const path of results) {
        if (!path) { hitGap = true; break; }
        newlyFound.push(path);
      }

      if (newlyFound.length) {
        found.push(...newlyFound);
        onBatch(newlyFound);
      }
      start += BATCH_SIZE;
    }

    return found;
  }

  function showFrame(index) {
    if (!frames.length) return;

    function applyFrame() {
      imgEl.src = frames[index];
      imgEl.onload = () => {
        // Force a style flush right before re-adding the class, so the
        // browser can't coalesce this with the earlier removal even if
        // onload resolves immediately (every frame is already preloaded
        // by probeOne() during discovery, so there's no real network
        // delay here to naturally separate the two states).
        void imgEl.offsetWidth;
        imgEl.classList.add('is-shown');
        hasShownFrame = true;
      };
    }

    if (!hasShownFrame) {
      // Cold start: transform is already at its CSS default (scale 1.02)
      // and nothing needs to be reversed first, so the full zoom-in can
      // play immediately once the image loads.
      applyFrame();
      return;
    }

    // Every later frame reuses this same <img> element, so its transform
    // is already sitting at the previous frame's zoomed-in value (scale
    // 1.08) when a new cycle starts. Removing .is-shown starts a reverse
    // transition back toward 1.02 — but if we swap the src and re-add the
    // class right away, that reverse transition gets interrupted only a
    // few milliseconds in and immediately reverses again, so the zoom
    // never travels far enough to be visible; it looks like the image
    // just sits there instead of zooming. Waiting out the full fade
    // duration (matching main.css's opacity transition) before swapping
    // means the image has actually faded to invisible AND settled back
    // at scale(1.02) by the time we bring the next frame in, so every
    // frame's zoom-in starts from a real, settled baseline — same as the
    // first frame — instead of a value still in motion from the last one.
    imgEl.classList.remove('is-shown');
    fadeTimer = setTimeout(applyFrame, FADE_MS);
  }

  function startCycling() {
    if (!frames.length || cycleTimer) return;
    frameIndex = 0;
    showFrame(frameIndex);
    cycleTimer = setInterval(() => {
      // frames.length is read live each tick, so images discovered
      // in later background batches join the rotation automatically.
      if (frames.length <= 1) return;
      frameIndex = (frameIndex + 1) % frames.length;
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
    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      stopCycling();
      screenEl.classList.add('is-hidden');
    }, wait);
  }

  async function init() {
    if (!screenEl || !imgEl) return;
    // Absolute ceiling so a stuck network request (discovery or
    // loadGames) can't strand the user forever. Starts counting
    // immediately, not after discovery finishes, since discovery
    // itself is one of the things this ceiling guards against.
    setTimeout(hide, MAX_WAIT_MS);

    await discoverFrames((newFrames) => {
      frames.push(...newFrames);
      startCycling(); // no-op after the first successful call
    });

    if (!frames.length) {
      // No images found under that folder/naming — don't block the app on an empty cycle.
      console.warn(`Loading screen: no images found at "${FOLDER}/1.<ext>"`);
      hide();
    }
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
    title: 'House of Memoires',
    artist: 'Ported By $h4rky to FireFly',
    src: 'music/House of Memoires.mp3',
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

const themeToggle = document.getElementById('themeToggle');
const themeOpts = document.querySelectorAll('[data-theme-choice]');

const musicListEl = document.getElementById('musicList');
const queueListEl = document.getElementById('queueList');
const homeRecentListEl = document.getElementById('homeRecentList');
const homeFeaturedGamesEl = document.getElementById('homeFeaturedGames');
const shuffleFeaturedBtn = document.getElementById('shuffleFeaturedBtn');

const playAllBtn = document.getElementById('playAllBtn');
const shuffleAllBtn = document.getElementById('shuffleAllBtn');

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

  if (tabName === 'home') {
    renderFeaturedGames();
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

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeOpts.forEach((opt) => {
    opt.classList.toggle('is-active', opt.dataset.themeChoice === theme);
  });
  try {
    localStorage.setItem('firefly-theme', theme);
  } catch (e) {
    // localStorage unavailable — theme just won't persist across reloads
  }
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'ember' ? 'blank' : 'ember');
});

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
  setTheme(saved === 'blank' ? 'blank' : 'ember');
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
      ${
        isCurrentTrack && state.isPlaying
          ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
      }
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
    musicListEl.appendChild(makeTrackRow(track, i));
  });
}

function renderHomeRecent() {
  homeRecentListEl.innerHTML = '';
  LIBRARY.forEach((track, i) => {
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
    const card = document.createElement('div');
    card.className = 'game-card' + (compressedMode ? ' compact' : '');

    if (compressedMode) {
      card.innerHTML = `<div class="game-card-name"></div>`;
    } else {
      const img = document.createElement('img');
      img.src = game.cover || 'https://placehold.co/400x225';
      img.loading = 'lazy';
      img.alt = '';
      card.appendChild(img);
      const name = document.createElement('div');
      name.className = 'game-card-name';
      card.appendChild(name);
    }

    card.querySelector('.game-card-name').textContent = game.name;
    card.addEventListener('click', () => openGame(game));
    homeFeaturedGamesEl.appendChild(card);
  });
}

shuffleFeaturedBtn?.addEventListener('click', renderFeaturedGames);

function renderQueueList() {
  queueListEl.innerHTML = '';
  const upcoming = state.queue.slice(state.queueIndex + 1);

  if (upcoming.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = 'var(--text-mid)';
    empty.style.fontSize = '0.88rem';
    empty.style.padding = '8px 14px';
    empty.textContent = 'Queue is empty — add tracks from the list above.';
    queueListEl.appendChild(empty);
    return;
  }

  upcoming.forEach((track, i) => {
    queueListEl.appendChild(makeTrackRow(track, i, { showAdd: false }));
  });
}

function refreshAllLists() {
  renderMusicList();
  renderHomeRecent();
  renderFeaturedGames();
  renderQueueList();
}

// ============================================================
// Queue & playback
// ============================================================

function addToQueue(track) {
  state.queue.push({ ...track });
  renderQueueList();
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

  if (autoplay) {
    audioEl.play().catch(() => {
      // Autoplay can be blocked by the browser until the user interacts —
      // the UI will just show the paused state, which is still correct.
    });
  }

  refreshAllLists();
}

function playTrackById(trackId, { fromLibrary = false } = {}) {
  if (fromLibrary) {
    // Starting a library track resets the queue to "this track, then the rest of the library"
    const startIdx = LIBRARY.findIndex((t) => t.id === trackId);
    if (startIdx === -1) return;
    state.queue = [...LIBRARY.slice(startIdx), ...LIBRARY.slice(0, startIdx)];
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
  refreshAllLists();
}

function updateProgressUI() {
  if (state.isDraggingProgress) return;
  const duration = audioEl.duration || 0;
  const current = audioEl.currentTime || 0;
  const pct = duration > 0 ? (current / duration) * 100 : 0;

  progressFill.style.width = `${pct}%`;
  progressHandle.style.left = `${pct}%`;
  currentTimeEl.textContent = formatTime(current);
  durationTimeEl.textContent = formatTime(duration);
}

function updateVolumeUI() {
  const pct = state.isMuted ? 0 : state.volume * 100;
  volumeFill.style.width = `${pct}%`;
  volumeHandle.style.left = `${pct}%`;
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

audioEl.addEventListener('timeupdate', updateProgressUI);
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
function seekFromEvent(clientX) {
  const rect = progressTrack.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  const duration = audioEl.duration || 0;
  audioEl.currentTime = pct * duration;
  progressFill.style.width = `${pct * 100}%`;
  progressHandle.style.left = `${pct * 100}%`;
  currentTimeEl.textContent = formatTime(pct * duration);
}

progressTrack.addEventListener('pointerdown', (e) => {
  state.isDraggingProgress = true;
  seekFromEvent(e.clientX);
});

window.addEventListener('pointermove', (e) => {
  if (state.isDraggingProgress) seekFromEvent(e.clientX);
  if (state.isDraggingVolume) setVolumeFromEvent(e.clientX);
});

window.addEventListener('pointerup', () => {
  state.isDraggingProgress = false;
  state.isDraggingVolume = false;
});

// ---- Volume ----
function setVolumeFromEvent(clientX) {
  const rect = volumeTrack.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  state.volume = pct;
  state.isMuted = false;
  audioEl.volume = pct;
  audioEl.muted = false;
  updateVolumeUI();
}

volumeTrack.addEventListener('pointerdown', (e) => {
  state.isDraggingVolume = true;
  setVolumeFromEvent(e.clientX);
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
let currentGame = null;
let compressedMode = localStorage.getItem('compressedMode') === 'true';

// ============================================================
// Init
// ============================================================

audioEl.volume = state.volume;
refreshAllLists();
updateVolumeUI();
updateProgressUI();

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

  try {
    const zones = await fetch(ZONES_URL).then((r) => r.json());

    zones.forEach((game) => {
      allGames.push({
        name: game.name,
        cover: game.cover
          ? game.cover.replace('{COVER_URL}', COVER_BASE)
          : null,
        url: game.url.replace('{HTML_URL}', HTML_BASE)
      });
    });
  } catch (err) {
    console.error('Failed to load FROG zones', err);
  }

  try {
    const xadenGames = await fetch(XADEN_JSON).then((r) => r.json());

    xadenGames.forEach((game) => {
      allGames.push({
        name: game.name,
        cover: game.cover,
        url: game.url,
        source: 'xaden'
      });
    });
  } catch (err) {
    console.error('Failed to load Xaden games', err);
  }

  try {
    const text = await fetch(ABMINN_LIST).then((r) => r.text());
    const names = parseGameList(text);

    names.forEach((name) => {
      allGames.push({
        name,
        cover: ABMINN_IMAGES + encodeURIComponent(name) + '.png',
        url: ABMINN_BASE + encodeURIComponent(name) + '/index.html'
      });
    });
  } catch (err) {
    console.error('Failed to load ABMINN games', err);
  }

  games = allGames
    .filter((game) => game.name && !game.name.startsWith('[!]'))
    .sort((a, b) => a.name.localeCompare(b.name));

  renderGames(games);
  renderFeaturedGames();
}

function renderGames(list) {
  gameListEl.innerHTML = '';

  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'game-empty';
    empty.textContent = 'No games found.';
    gameListEl.appendChild(empty);
    return;
  }

  list.forEach((game) => {
    const card = document.createElement('div');
    card.className = 'game-card' + (compressedMode ? ' compact' : '');

    if (compressedMode) {
      card.innerHTML = `<div class="game-card-name"></div>`;
    } else {
      const img = document.createElement('img');
      img.src = game.cover || 'https://placehold.co/400x225';
      img.loading = 'lazy';
      img.alt = '';
      card.appendChild(img);
      const name = document.createElement('div');
      name.className = 'game-card-name';
      card.appendChild(name);
    }

    card.querySelector('.game-card-name').textContent = game.name;
    card.addEventListener('click', () => openGame(game));
    gameListEl.appendChild(card);
  });
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

gameSearchEl.addEventListener('input', () => {
  const query = gameSearchEl.value.toLowerCase().trim();
  renderGames(
    games.filter((game) => game.name.toLowerCase().includes(query))
  );
});

compressedBtn.addEventListener('click', () => {
  compressedMode = !compressedMode;
  localStorage.setItem('compressedMode', compressedMode);
  compressedBtn.textContent = `Compressed Mode: ${compressedMode ? 'ON' : 'OFF'}`;
  renderGames(
    games.filter((game) =>
      game.name.toLowerCase().includes(gameSearchEl.value.toLowerCase().trim())
    )
  );
});

gameMenuButton.addEventListener('click', toggleGameMenu);
closeGameBtn.addEventListener('click', closeGame);
reloadGameBtn.addEventListener('click', reloadGame);
openBlankBtn.addEventListener('click', openBlank);

loadGames().then(() => LoadingScreen.hide());

window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "Do you really want to close this tab?";
});