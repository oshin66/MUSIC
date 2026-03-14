/* ══════════════════════════════════════════════════════════════════════════
   YOUTIFY — app.js
   YouTube-powered Music Streaming SPA
   Vanilla JS (ES6+) · No frameworks · No libraries

   ┌─ SETUP ──────────────────────────────────────────────────────────────┐
   │  1. Replace YOUTUBE_API_KEY with your Google Cloud API key.          │
   │     Console: https://console.cloud.google.com/                       │
   │     Enable: "YouTube Data API v3" in your project.                   │
   └──────────────────────────────────────────────────────────────────────┘
   ══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ══ 1. CONFIGURATION ═══════════════════════════════════════════════════════ */

const YOUTUBE_API_KEY = 'AIzaSyDHB1KhoAoeG52lOlDDgJIqefHNqqOFwmE';   // ← PLUG YOUR KEY IN HERE
const YT_SEARCH_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';
const LS_KEY = 'youtify_recently_played';
const MAX_HISTORY = 20;

/* ══ 2. MOCK DATA ════════════════════════════════════════════════════════════ */

const SPOTIFY_TRENDS = [
  { rank: 1, title: "Blinding Lights", artist: "The Weeknd", searchQuery: "The Weeknd Blinding Lights official audio" },
  { rank: 2, title: "Shape of You", artist: "Ed Sheeran", searchQuery: "Ed Sheeran Shape of You official video" },
  { rank: 3, title: "Stay", artist: "The Kid LAROI, Justin Bieber", searchQuery: "The Kid LAROI Justin Bieber Stay official" },
  { rank: 4, title: "Levitating", artist: "Dua Lipa ft. DaBaby", searchQuery: "Dua Lipa Levitating official video" },
  { rank: 5, title: "MONTERO (Call Me By Your Name)", artist: "Lil Nas X", searchQuery: "Lil Nas X MONTERO Call Me By Your Name official" },
  { rank: 6, title: "drivers license", artist: "Olivia Rodrigo", searchQuery: "Olivia Rodrigo drivers license official video" },
  { rank: 7, title: "Peaches", artist: "Justin Bieber ft. Daniel Caesar", searchQuery: "Justin Bieber Peaches official video" },
  { rank: 8, title: "good 4 u", artist: "Olivia Rodrigo", searchQuery: "Olivia Rodrigo good 4 u official video" },
  { rank: 9, title: "Butter", artist: "BTS", searchQuery: "BTS Butter official MV" },
  { rank: 10, title: "Bad Guy", artist: "Billie Eilish", searchQuery: "Billie Eilish bad guy official video" },
  { rank: 11, title: "Anti-Hero", artist: "Taylor Swift", searchQuery: "Taylor Swift Anti-Hero official video" },
  { rank: 12, title: "As It Was", artist: "Harry Styles", searchQuery: "Harry Styles As It Was official video" },
  { rank: 13, title: "Heat Waves", artist: "Glass Animals", searchQuery: "Glass Animals Heat Waves official video" },
  { rank: 14, title: "Flowers", artist: "Miley Cyrus", searchQuery: "Miley Cyrus Flowers official video" },
  { rank: 15, title: "Cruel Summer", artist: "Taylor Swift", searchQuery: "Taylor Swift Cruel Summer official" },
];

const GLOBAL_CHARTS = [
  { rank: 1, title: "Flowers", artist: "Miley Cyrus", searchQuery: "Miley Cyrus Flowers official video" },
  { rank: 2, title: "Kill Bill", artist: "SZA", searchQuery: "SZA Kill Bill official video" },
  { rank: 3, title: "Unholy", artist: "Sam Smith & Kim Petras", searchQuery: "Sam Smith Kim Petras Unholy official video" },
  { rank: 4, title: "Calm Down", artist: "Rema & Selena Gomez", searchQuery: "Rema Selena Gomez Calm Down official video" },
  { rank: 5, title: "Bzrp Music Sessions #53", artist: "Bizarrap & Shakira", searchQuery: "Bizarrap Shakira Music Session 53" },
  { rank: 6, title: "Creepin'", artist: "Metro Boomin, The Weeknd, 21 Savage", searchQuery: "Metro Boomin The Weeknd Creepin official" },
  { rank: 7, title: "La Bebe (Remix)", artist: "Yng Lvcas & Peso Pluma", searchQuery: "Yng Lvcas Peso Pluma La Bebe Remix" },
  { rank: 8, title: "About Damn Time", artist: "Lizzo", searchQuery: "Lizzo About Damn Time official video" },
  { rank: 9, title: "Tití Me Preguntó", artist: "Bad Bunny", searchQuery: "Bad Bunny Tití Me Preguntó official" },
  { rank: 10, title: "Running Up That Hill", artist: "Kate Bush", searchQuery: "Kate Bush Running Up That Hill official" },
  { rank: 11, title: "I Ain't Worried", artist: "OneRepublic", searchQuery: "OneRepublic I Aint Worried official video" },
  { rank: 12, title: "Lift Me Up", artist: "Rihanna", searchQuery: "Rihanna Lift Me Up official video" },
  { rank: 13, title: "Quevedo: Bzrp Music Sessions #52", artist: "Bizarrap & Quevedo", searchQuery: "Bizarrap Quevedo Music Session 52" },
  { rank: 14, title: "Shakira: Te Felicito", artist: "Shakira & Rauw Alejandro", searchQuery: "Shakira Rauw Alejandro Te Felicito" },
  { rank: 15, title: "Paint The Town Red", artist: "Doja Cat", searchQuery: "Doja Cat Paint The Town Red official" },
];

/* ══ 3. APP STATE ════════════════════════════════════════════════════════════ */

const state = {
  activeTab: 'home',
  ytPlayer: null,
  playerReady: false,
  isPlaying: false,
  currentTrack: null,
  progressTimer: null,
  isSeeking: false,
  searchResults: [],
  pendingRetries: [],
};

/* ══ 4. DOM CACHE ════════════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const dom = {
  // Tabs
  tabs: $$('.tab-section'),
  navItems: $$('.nav-item'),
  sidebarLinks: $$('.sidebar-link'),
  // Player bar
  progressTrack: $('progress-track'),
  progressFill: $('progress-fill'),
  progressKnob: $('progress-knob'),
  playPauseBtn: $('play-pause-btn'),
  iconPlay: $('icon-play'),
  iconPause: $('icon-pause'),
  prevBtn: $('prev-btn'),
  nextBtn: $('next-btn'),
  playerTitle: $('player-track-title'),
  playerArtist: $('player-track-artist'),
  playerThumbnail: $('player-thumbnail'),
  playerArtFallback: $('player-art-fallback'),
  // Header
  eqAnim: $('equalizer-anim'),
  eqAnimMobile: $('equalizer-anim-mobile'),
  // Desktop topbar
  breadcrumbLabel: $('breadcrumb-label'),
  desktopSearchInput: $('desktop-search-input'),
  // Now Playing panel
  npArtImg: $('np-art-img'),
  npArtFallback: $('np-art-fallback'),
  npTrackTitle: $('np-track-title'),
  npTrackArtist: $('np-track-artist'),
  npLyricsContent: $('np-lyrics-content'),
  npQueueList: $('np-queue-list'),
  // Home
  homeQuickPlays: $('home-quick-plays'),
  quickPlaysContainer: $('quick-plays-container'),
  // Charts
  chartsToggle: $('charts-toggle'),
  spotifyList: $('spotify-list'),
  globalList: $('global-list'),
  panelSpotify: $('panel-spotify'),
  panelGlobal: $('panel-global'),
  // YouTube Search
  searchInput: $('yt-search-input'),
  searchClearBtn: $('search-clear'),
  searchGoBtn: $('yt-search-btn'),
  searchBox: $('search-box'),
  apiKeyWarning: $('api-key-warning'),
  searchIdleState: $('search-idle-state'),
  searchLoading: $('search-loading'),
  searchResults: $('search-results'),
  // Library
  recentlyPlayedList: $('recently-played-list'),
  rpEmptyState: $('rp-empty-state'),
  clearHistoryBtn: $('clear-history-btn'),
  likedCount: $('liked-count'),
  // Time display
  pbTimeCurrent: $('pb-time-current'),
  pbTimeTotal: $('pb-time-total'),
  // Volume
  volumeSlider: $('volume-slider'),
  // Toast
  toast: $('toast'),
};

/* ══ 5. YOUTUBE IFRAME PLAYER API ════════════════════════════════════════════ */

window.onYouTubeIframeAPIReady = function () {
  state.ytPlayer = new YT.Player('yt-player', {
    height: '200',
    width: '200',
    videoId: '',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
};

function onPlayerReady() {
  state.playerReady = true;
  console.log('[Youtify] YouTube IFrame Player ready.');
  dom.playPauseBtn.disabled = false;
  // Set initial volume from slider
  if (dom.volumeSlider && state.ytPlayer) {
    state.ytPlayer.setVolume(parseInt(dom.volumeSlider.value));
  }
}

function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.PLAYING:
      state.isPlaying = true;
      setPlayPauseUI(true);
      startProgressTracking();
      setEqPlaying(true);
      break;
    case YT.PlayerState.PAUSED:
      state.isPlaying = false;
      setPlayPauseUI(false);
      stopProgressTracking();
      setEqPlaying(false);
      break;
    case YT.PlayerState.ENDED:
      state.isPlaying = false;
      setPlayPauseUI(false);
      stopProgressTracking();
      setEqPlaying(false);
      setProgressUI(0);
      break;
    case YT.PlayerState.BUFFERING:
      break;
  }
}

function onPlayerError(event) {
  const codes = { 2: 'Invalid video ID', 5: 'HTML5 player error', 100: 'Video not found', 101: 'Embedding disabled', 150: 'Embedding disabled', 153: 'Embedding disabled' };
  const msg = codes[event.data] || `Player error (${event.data})`;
  console.warn('[Youtify] Player error:', msg);

  // Auto-retry with next search result if embedding is blocked
  if ([101, 150, 153].includes(event.data)) {
    if (state.pendingRetries.length > 0) {
      const next = state.pendingRetries.shift();
      console.log('[Youtify] Retrying with:', next.title);
      // Silently retry instead of showing confusing toasts
      playTrack(next.videoId, state.currentTrack?.title || next.title, state.currentTrack?.artist || next.channel, state.currentTrack?.thumbnail || next.thumbnail);
      return;
    } else {
      showToast('⚠ Could not find a playable version for this track.');
    }
  } else {
    showToast(`⚠ ${msg}`);
  }

  state.isPlaying = false;
  setPlayPauseUI(false);
  stopProgressTracking();
  setEqPlaying(false);
}

function setEqPlaying(playing) {
  if (dom.eqAnim) dom.eqAnim.classList.toggle('playing', playing);
  if (dom.eqAnimMobile) dom.eqAnimMobile.classList.toggle('playing', playing);
}

/* Load the YouTube IFrame API script */
(function loadYTApi() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  tag.onerror = () => console.warn('[Youtify] Could not load YouTube IFrame API.');
  document.head.appendChild(tag);
})();

/* ══ 6. PLAYBACK CONTROLS ════════════════════════════════════════════════════ */

function playTrack(videoId, title, artist, thumbnail = '') {
  if (!state.ytPlayer || !state.playerReady) {
    showToast('Player not ready yet — please wait.');
    return;
  }
  if (!videoId) {
    showToast('No video ID available.');
    return;
  }

  state.currentTrack = { videoId, title, artist, thumbnail };

  // Update player bar UI
  dom.playerTitle.textContent = title || 'Unknown title';
  dom.playerArtist.textContent = artist || 'Unknown artist';

  if (thumbnail) {
    dom.playerThumbnail.src = thumbnail;
    dom.playerThumbnail.style.display = 'block';
    dom.playerArtFallback.style.display = 'none';
  } else {
    dom.playerThumbnail.style.display = 'none';
    dom.playerArtFallback.style.display = '';
  }

  dom.prevBtn.disabled = false;
  dom.nextBtn.disabled = false;
  dom.playPauseBtn.disabled = false;

  // Update Now Playing panel
  updateNowPlayingPanel(title, artist, thumbnail);

  // Load and play
  state.ytPlayer.loadVideoById(videoId);
  state.ytPlayer.playVideo();

  // Save to history
  saveToHistory({ videoId, title, artist, thumbnail });

  // Highlight now-playing rows
  highlightNowPlaying(videoId);
}

function updateNowPlayingPanel(title, artist, thumbnail) {
  if (dom.npTrackTitle) dom.npTrackTitle.textContent = title || 'Unknown title';
  if (dom.npTrackArtist) dom.npTrackArtist.textContent = artist || 'Unknown artist';

  // Fetch and display lyrics
  fetchAndDisplayLyrics(title, artist);

  if (dom.npArtImg) {
    if (thumbnail) {
      dom.npArtImg.src = thumbnail;
      dom.npArtImg.style.display = 'block';
      if (dom.npArtFallback) dom.npArtFallback.style.display = 'none';
    } else {
      dom.npArtImg.style.display = 'none';
      if (dom.npArtFallback) dom.npArtFallback.style.display = '';
    }
  }

  // Update queue with recent history
  renderNowPlayingQueue();
}

function renderNowPlayingQueue() {
  if (!dom.npQueueList) return;
  const history = loadHistory().slice(0, 5);
  if (!history.length) {
    dom.npQueueList.innerHTML = '<p style="font-size:0.78rem;color:var(--text-3);padding:8px;">No tracks in queue</p>';
    return;
  }

  dom.npQueueList.innerHTML = history.map(t => `
    <div class="np-queue-item" data-video-id="${escHtml(t.videoId)}">
      <div class="np-queue-art">
        ${t.thumbnail
      ? `<img src="${escHtml(t.thumbnail)}" alt="" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div style="width:100%;height:100%;display:grid;place-items:center;font-size:0.9rem;">🎵</div>`
    }
      </div>
      <div class="np-queue-info">
        <p class="np-queue-title">${escHtml(t.title)}</p>
      </div>
    </div>
  `).join('');
}

/* ── Lyrics Integration (LRCLib) ─────────────────────────────────────────── */

async function fetchAndDisplayLyrics(title, artist) {
  if (!dom.npLyricsContent) return;
  dom.npLyricsContent.innerHTML = '<p class="lyrics-placeholder" style="font-size:0.78rem;color:var(--text-3);padding:8px;line-height:1.6;">Searching for lyrics...</p>';

  if (!title) return;

  // Clean up title for better search (remove "Official Video", etc.)
  let cleanTitle = title.replace(/\(official.*\)/i, '')
    .replace(/\[official.*\]/i, '')
    .replace(/\(lyric.*\)/i, '')
    .replace(/official video/i, '')
    .trim();
  let cleanArtist = artist ? artist.replace(/VEVO/i, '').trim() : '';

  try {
    const query = encodeURIComponent(`${cleanTitle} ${cleanArtist}`.trim());
    const res = await fetch(`https://lrclib.net/api/search?q=${query}`);
    if (!res.ok) throw new Error('Network response was not ok');

    const data = await res.json();
    if (data && data.length > 0) {
      const bestMatch = data[0];

      // Prefer synced lyrics, fallback to plain
      if (bestMatch.syncedLyrics) {
        state.currentLyrics = parseSyncedLyrics(bestMatch.syncedLyrics);
        renderLyrics();
      } else if (bestMatch.plainLyrics) {
        state.currentLyrics = null;
        dom.npLyricsContent.innerHTML = `<p style="padding:8px; white-space: pre-wrap;">${escHtml(bestMatch.plainLyrics)}</p>`;
      } else {
        throw new Error('No lyrics format found');
      }
    } else {
      throw new Error('Not found');
    }
  } catch (err) {
    console.warn('[Youtify] Lyrics fetch failed:', err.message);
    dom.npLyricsContent.innerHTML = '<p class="lyrics-placeholder" style="font-size:0.78rem;color:var(--text-3);padding:8px;line-height:1.6;">Lyrics not available for this track.</p>';
    state.currentLyrics = null;
  }
}

function parseSyncedLyrics(lrcString) {
  const lines = lrcString.split('\\n');
  const result = [];
  const timeRegex = /\\[(\\d{2}):(\\d{2}\\.\\d{2,3})\\](.*)/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseFloat(match[2]);
      const text = match[3].trim();
      const timeMs = (min * 60 + sec) * 1000;
      if (text) { // ignore pure instrumental/empty lines for rendering simplicity
        result.push({ timeMs, text });
      }
    }
  }
  return result;
}

function renderLyrics() {
  if (!dom.npLyricsContent || !state.currentLyrics) return;
  dom.npLyricsContent.innerHTML = state.currentLyrics.map((line, i) =>
    `<div class="lyric-line" id="lyric-line-${i}">${escHtml(line.text)}</div>`
  ).join('');
}

function togglePlayPause() {
  if (!state.ytPlayer || !state.playerReady || !state.currentTrack) return;
  if (state.isPlaying) {
    state.ytPlayer.pauseVideo();
  } else {
    state.ytPlayer.playVideo();
  }
}

function setPlayPauseUI(playing) {
  dom.iconPlay.style.display = playing ? 'none' : '';
  dom.iconPause.style.display = playing ? '' : 'none';
  dom.playPauseBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

/* ── Progress tracking ───────────────────────────────────────────────────── */

function startProgressTracking() {
  stopProgressTracking();
  state.progressTimer = setInterval(updateProgress, 500);
}

function stopProgressTracking() {
  if (state.progressTimer) {
    clearInterval(state.progressTimer);
    state.progressTimer = null;
  }
}

function updateProgress() {
  if (!state.ytPlayer || state.isSeeking) return;
  try {
    const current = state.ytPlayer.getCurrentTime() || 0;
    const duration = state.ytPlayer.getDuration() || 0;
    if (duration === 0) return;
    const pct = (current / duration) * 100;
    setProgressUI(pct);

    // Update time display
    if (dom.pbTimeCurrent) dom.pbTimeCurrent.textContent = formatTime(current);
    if (dom.pbTimeTotal) dom.pbTimeTotal.textContent = formatTime(duration);

    // Sync Lyrics
    if (state.currentLyrics && dom.npLyricsContent) {
      const currentMs = current * 1000;
      let activeIndex = -1;

      for (let i = 0; i < state.currentLyrics.length; i++) {
        if (currentMs >= state.currentLyrics[i].timeMs) {
          activeIndex = i;
        } else {
          break; // Since it's sorted by time, we can break early
        }
      }

      if (activeIndex !== -1 && activeIndex !== state.lastActiveLyricIndex) {
        // Remove active from old
        const oldActive = dom.npLyricsContent.querySelector('.lyric-line.active');
        if (oldActive) oldActive.classList.remove('active');

        // Add active to new
        const newActive = dom.npLyricsContent.querySelector(`#lyric-line-${activeIndex}`);
        if (newActive) {
          newActive.classList.add('active');
          // Auto-scroll
          const container = dom.npLyricsContent;
          const scrollPos = newActive.offsetTop - container.offsetTop - (container.clientHeight / 2) + (newActive.clientHeight / 2);
          container.scrollTo({ top: scrollPos, behavior: 'smooth' });
        }
        state.lastActiveLyricIndex = activeIndex;
      }
    }
  } catch (_) { }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function setProgressUI(pct) {
  const clamped = Math.max(0, Math.min(100, pct));
  dom.progressFill.style.width = `${clamped}%`;
  dom.progressKnob.style.left = `${clamped}%`;
}

/* ── Seekbar interaction ─────────────────────────────────────────────────── */

function seekToPercent(pct) {
  if (!state.ytPlayer || !state.playerReady || !state.currentTrack) return;
  try {
    const duration = state.ytPlayer.getDuration() || 0;
    state.ytPlayer.seekTo(duration * pct, true);
    setProgressUI(pct * 100);
  } catch (_) { }
}

function getSeekPercent(event, element) {
  const rect = element.getBoundingClientRect();
  const x = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
  return Math.max(0, Math.min(1, x / rect.width));
}

/* ══ 7. YOUTUBE DATA API SEARCH ══════════════════════════════════════════════ */

function isApiKeySet() {
  return YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_DATA_API_KEY_HERE';
}

async function searchYouTube(query, maxResults = 15) {
  if (!isApiKeySet()) throw new Error('API_KEY_MISSING');

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoEmbeddable: 'true',
    q: query + ' audio -official',
    key: YOUTUBE_API_KEY,
    maxResults: String(maxResults),
    safeSearch: 'none',
  });

  const res = await fetch(`${YT_SEARCH_ENDPOINT}?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return (data.items || []).map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url
      || item.snippet.thumbnails?.default?.url
      || '',
    publishedAt: item.snippet.publishedAt,
  }));
}

async function searchAndPlay(query, title, artist, el = null, overrideThumbnail = null) {
  if (!isApiKeySet()) {
    showToast('Add your YouTube API key in app.js to play tracks.');
    return;
  }

  if (el) {
    el.classList.add('loading');
    const hint = el.querySelector('.chart-play-hint');
    if (hint) hint.innerHTML = '<div class="chart-loading-dot"></div>';
  }

  try {
    const results = await searchYouTube(query, 8);
    if (!results.length) {
      showToast('No results found for this track.');
      return;
    }
    // Store remaining results as retries in case embedding fails
    state.pendingRetries = results.slice(1);
    const { videoId, thumbnail } = results[0];
    playTrack(videoId, title, artist, overrideThumbnail || thumbnail);
  } catch (err) {
    console.error('[Youtify] searchAndPlay error:', err);
    if (err.message === 'API_KEY_MISSING') {
      showToast('Add your YouTube API key in app.js.');
    } else {
      showToast(`Search failed: ${err.message}`);
    }
  } finally {
    if (el) {
      el.classList.remove('loading');
      const hint = el.querySelector('.chart-play-hint');
      if (hint) hint.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5,3 19,12 5,21"/></svg>`;
    }
  }
}

/* ══ 8. NOW-PLAYING HIGHLIGHT ════════════════════════════════════════════════ */

function highlightNowPlaying(videoId) {
  $$('.chart-item, .result-item, .history-item, .quick-tile, .np-queue-item').forEach(el => {
    el.classList.toggle('now-playing', el.dataset.videoId === videoId);
  });
}

/* ══ 9. SEARCH UI ════════════════════════════════════════════════════════════ */

async function handleSearch(query) {
  const q = query || (dom.searchInput ? dom.searchInput.value.trim() : '');
  if (!q) return;

  if (!isApiKeySet()) {
    if (dom.apiKeyWarning) dom.apiKeyWarning.style.display = 'flex';
    if (dom.searchIdleState) dom.searchIdleState.style.display = 'none';
    return;
  }

  // Switch to youtube tab to show results
  if (state.activeTab !== 'youtube') {
    switchTab('youtube');
  }

  if (dom.searchIdleState) dom.searchIdleState.style.display = 'none';
  if (dom.searchResults) dom.searchResults.innerHTML = '';
  if (dom.searchLoading) dom.searchLoading.style.display = 'flex';

  try {
    const results = await searchYouTube(q, 20);
    state.searchResults = results;
    if (dom.searchLoading) dom.searchLoading.style.display = 'none';
    renderSearchResults(results);
  } catch (err) {
    if (dom.searchLoading) dom.searchLoading.style.display = 'none';
    console.error('[Youtify] Search error:', err);
    showToast(`Search error: ${err.message}`);
    if (dom.searchIdleState) dom.searchIdleState.style.display = '';
  }
}

function renderSearchResults(results) {
  if (!results.length) {
    dom.searchResults.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-title">No results found</p>
        <p class="empty-sub">Try a different search term</p>
      </div>`;
    return;
  }

  dom.searchResults.innerHTML = results.map(r => `
    <div class="result-item"
         role="listitem"
         data-video-id="${escHtml(r.videoId)}"
         data-title="${escHtml(r.title)}"
         data-channel="${escHtml(r.channel)}"
         data-thumbnail="${escHtml(r.thumbnail)}"
         tabindex="0"
         aria-label="Play ${escHtml(r.title)} by ${escHtml(r.channel)}">
      <div class="result-thumb-wrap">
        <img class="result-thumb-img" src="${escHtml(r.thumbnail)}" alt="" loading="lazy" />
        <div class="result-thumb-overlay">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
      </div>
      <div class="result-details">
        <p class="result-title">${escHtml(r.title)}</p>
        <p class="result-channel">${escHtml(r.channel)}</p>
      </div>
    </div>
  `).join('');

  if (state.currentTrack) highlightNowPlaying(state.currentTrack.videoId);
}

/* ══ 10. CHARTS RENDERING (Live ITunes API) ══════════════════════════════════════ */

async function fetchAndRenderLiveCharts() {
  if (!dom.globalList) return;
  dom.globalList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-3); font-size: 0.85rem;"><div class="chart-loading-dot" style="margin:0 auto 10px;"></div> Loading live charts...</div>`;

  try {
    const res = await fetch('https://itunes.apple.com/us/rss/topsongs/limit=15/json');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();

    const liveCharts = data.feed.entry.map((entry, index) => {
      const title = entry['im:name'].label;
      const artist = entry['im:artist'].label;
      const cleanTitle = title.split(' (')[0]; // Remove (feat...) for better search
      const images = entry['im:image'];
      const coverArt = images && images.length > 0 ? images[images.length - 1].label : '';
      return {
        rank: index + 1,
        title: title,
        artist: artist,
        thumbnail: coverArt,
        searchQuery: `${cleanTitle} ${artist} audio -official`
      };
    });

    renderChartsList(liveCharts, dom.globalList);
  } catch (err) {
    console.warn('[Youtify] Live charts fetch failed:', err);
    dom.globalList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-3); font-size: 0.85rem;">Failed to load live charts.</div>`;
    // Fallback to mock data if fetch fails
    renderChartsList(GLOBAL_CHARTS, dom.globalList);
  }
}

function renderChartsList(tracks, container) {
  container.innerHTML = tracks.map(t => `
    <div class="chart-item"
         data-query="${escHtml(t.searchQuery)}"
         data-title="${escHtml(t.title)}"
         data-artist="${escHtml(t.artist)}"
         ${t.thumbnail ? `data-thumbnail="${escHtml(t.thumbnail)}"` : ''}
         tabindex="0"
         aria-label="Play ${escHtml(t.title)} by ${escHtml(t.artist)}">
      <div class="chart-rank">${String(t.rank).padStart(2, '0')}</div>
      <div class="chart-thumb">
        ${t.thumbnail ? `<img src="${escHtml(t.thumbnail)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r-xs);" />` : `<div class="chart-thumb-fallback">🎵</div>`}
        <div class="chart-thumb-overlay">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
      </div>
      <div class="chart-details">
        <p class="chart-track-name">${escHtml(t.title)}</p>
        <p class="chart-track-artist">${escHtml(t.artist)}</p>
      </div>
      <div class="chart-play-hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21"/>
        </svg>
      </div>
    </div>
  `).join('');
}

function switchChartPanel(target) {
  $$('.toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === target);
  });
  dom.chartsToggle.setAttribute('data-active', target);
  dom.panelSpotify.classList.toggle('active', target === 'spotify');
  dom.panelGlobal.classList.toggle('active', target === 'global');
}

/* ══ 11. LIBRARY — LOCAL STORAGE ══════════════════════════════════════════════ */

function saveToHistory(track) {
  let history = loadHistory();
  history = history.filter(h => h.videoId !== track.videoId);
  history.unshift(track);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('[Youtify] localStorage write failed:', e);
  }
  renderHistory();
  renderQuickPlays();
  renderNowPlayingQueue();
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function clearHistory() {
  try { localStorage.removeItem(LS_KEY); } catch (_) { }
  renderHistory();
  renderQuickPlays();
  renderNowPlayingQueue();
  showToast('Listening history cleared.');
}

function renderHistory() {
  const history = loadHistory();
  const container = dom.recentlyPlayedList;

  if (!history.length) {
    container.innerHTML = `
      <div class="empty-state" id="rp-empty-state">
        <div class="empty-icon">🎧</div>
        <p class="empty-title">No history yet</p>
        <p class="empty-sub">Songs you play will appear here</p>
      </div>`;
    return;
  }

  container.innerHTML = history.map(t => `
    <div class="history-item"
         data-video-id="${escHtml(t.videoId)}"
         tabindex="0"
         aria-label="Play ${escHtml(t.title)}">
      <div class="history-art">
        ${t.thumbnail
      ? `<img src="${escHtml(t.thumbnail)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" />`
      : `<div style="width:100%;height:100%;display:grid;place-items:center;font-size:1.1rem;">🎵</div>`
    }
        <div class="history-art-overlay">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
      </div>
      <div class="history-details">
        <p class="history-title">${escHtml(t.title)}</p>
        <p class="history-artist">${escHtml(t.artist || 'Unknown artist')}</p>
      </div>
    </div>
  `).join('');

  if (state.currentTrack) highlightNowPlaying(state.currentTrack.videoId);
}

function renderQuickPlays() {
  const history = loadHistory().slice(0, 4);
  if (!history.length) {
    dom.homeQuickPlays.style.display = 'none';
    return;
  }

  dom.homeQuickPlays.style.display = '';
  dom.quickPlaysContainer.innerHTML = history.map(t => `
    <button class="quick-tile"
            data-video-id="${escHtml(t.videoId)}"
            aria-label="Play ${escHtml(t.title)}">
      <div class="quick-tile-art">
        ${t.thumbnail
      ? `<img src="${escHtml(t.thumbnail)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" />`
      : `<div style="width:100%;height:100%;background:var(--bg-input);display:grid;place-items:center;font-size:1.1rem;">🎵</div>`
    }
      </div>
      <span class="quick-tile-name">${escHtml(t.title)}</span>
    </button>
  `).join('');

  if (state.currentTrack) highlightNowPlaying(state.currentTrack.videoId);
}

/* ══ 12. TAB NAVIGATION ══════════════════════════════════════════════════════ */

const TAB_LABELS = {
  home: 'Browse',
  charts: 'Top Charts',
  youtube: 'Search',
  library: 'Library',
};

function switchTab(tabName) {
  if (state.activeTab === tabName) return;
  state.activeTab = tabName;

  // Sections
  dom.tabs.forEach(section => {
    const isTarget = section.id === `tab-${tabName}`;
    section.classList.toggle('active', isTarget);
    section.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
  });

  // Mobile nav
  dom.navItems.forEach(item => {
    const isTarget = item.dataset.tab === tabName;
    item.classList.toggle('active', isTarget);
    item.setAttribute('aria-current', isTarget ? 'page' : 'false');
  });

  // Sidebar links
  dom.sidebarLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabName);
  });

  // Desktop breadcrumb
  if (dom.breadcrumbLabel) {
    dom.breadcrumbLabel.textContent = TAB_LABELS[tabName] || tabName;
  }

  // Scroll to top
  document.getElementById('main-content').scrollTop = 0;

  // Per-tab side effects
  if (tabName === 'library') renderHistory();
  if (tabName === 'youtube' && !isApiKeySet()) {
    if (dom.apiKeyWarning) dom.apiKeyWarning.style.display = 'flex';
  }
}

/* ══ 13. HOME TAB INIT ═══════════════════════════════════════════════════════ */

function initHomeGreeting() {
  // No greeting block in new design — hero banner is static
}

/* ══ 14. EVENT LISTENERS ═════════════════════════════════════════════════════ */

function initEventListeners() {

  /* ── Bottom nav (mobile) ──────────────────────────────────────────────── */
  dom.navItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  /* ── Sidebar links (desktop) ──────────────────────────────────────────── */
  dom.sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      switchTab(link.dataset.tab);
    });
  });

  /* ── Play/pause ────────────────────────────────────────────────────────── */
  dom.playPauseBtn.addEventListener('click', togglePlayPause);

  /* ── Prev/Next ─────────────────────────────────────────────────────────── */
  dom.prevBtn.addEventListener('click', () => {
    if (!state.currentTrack) return;
    showToast('Prev/Next queue coming soon!');
  });
  dom.nextBtn.addEventListener('click', () => {
    if (!state.currentTrack) return;
    showToast('Prev/Next queue coming soon!');
  });

  /* ── Progress bar seek ─────────────────────────────────────────────────── */
  dom.progressTrack.addEventListener('mousedown', handleSeekStart);
  dom.progressTrack.addEventListener('touchstart', handleSeekStart, { passive: true });

  function handleSeekStart(e) {
    state.isSeeking = true;
    dom.progressTrack.classList.add('seeking');
    const pct = getSeekPercent(e, dom.progressTrack);
    setProgressUI(pct * 100);

    function onMove(ev) {
      const p = getSeekPercent(ev, dom.progressTrack);
      setProgressUI(p * 100);
    }
    function onEnd(ev) {
      const p = getSeekPercent(ev.changedTouches ? { clientX: ev.changedTouches[0].clientX } : ev, dom.progressTrack);
      seekToPercent(p);
      state.isSeeking = false;
      dom.progressTrack.classList.remove('seeking');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  }

  /* ── Volume slider ─────────────────────────────────────────────────────── */
  if (dom.volumeSlider) {
    dom.volumeSlider.addEventListener('input', () => {
      if (state.ytPlayer && state.playerReady) {
        state.ytPlayer.setVolume(parseInt(dom.volumeSlider.value));
      }
    });
  }

  /* ── YouTube search: mobile input ──────────────────────────────────────── */
  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', () => {
      if (dom.searchClearBtn) dom.searchClearBtn.style.display = dom.searchInput.value ? '' : 'none';
    });
    dom.searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSearch();
    });
  }

  if (dom.searchGoBtn) {
    dom.searchGoBtn.addEventListener('click', () => handleSearch());
  }

  if (dom.searchClearBtn) {
    dom.searchClearBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      dom.searchClearBtn.style.display = 'none';
      dom.searchResults.innerHTML = '';
      if (dom.searchIdleState) dom.searchIdleState.style.display = '';
      dom.searchInput.focus();
    });
  }

  /* ── Desktop search ────────────────────────────────────────────────────── */
  if (dom.desktopSearchInput) {
    dom.desktopSearchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = dom.desktopSearchInput.value.trim();
        if (q) {
          if (dom.searchInput) dom.searchInput.value = q;
          handleSearch(q);
        }
      }
    });
  }

  /* ── Search results: click to play ─────────────────────────────────────── */
  if (dom.searchResults) {
    dom.searchResults.addEventListener('click', e => {
      const item = e.target.closest('.result-item');
      if (!item) return;
      playTrack(item.dataset.videoId, item.dataset.title, item.dataset.channel, item.dataset.thumbnail);
    });
    dom.searchResults.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.result-item');
        if (item) {
          e.preventDefault();
          playTrack(item.dataset.videoId, item.dataset.title, item.dataset.channel, item.dataset.thumbnail);
        }
      }
    });
  }

  /* ── Charts toggle ─────────────────────────────────────────────────────── */
  $$('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => switchChartPanel(btn.dataset.target));
  });

  /* ── Charts: click to search + play ────────────────────────────────────── */
  [dom.spotifyList, dom.globalList].forEach(list => {
    if (!list) return;
    list.addEventListener('click', e => {
      const item = e.target.closest('.chart-item');
      if (!item) return;
      searchAndPlay(item.dataset.query, item.dataset.title, item.dataset.artist, item, item.dataset.thumbnail);
    });
    list.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.chart-item');
        if (item) { e.preventDefault(); searchAndPlay(item.dataset.query, item.dataset.title, item.dataset.artist, item, item.dataset.thumbnail); }
      }
    });
  });

  /* ── Home: radio card click ──────────────────────────────────────────────── */
  const radiosScroll = document.getElementById('radios-scroll');
  if (radiosScroll) {
    radiosScroll.addEventListener('click', e => {
      const card = e.target.closest('.radio-card');
      if (!card) return;
      const title = card.querySelector('.radio-title')?.textContent || 'Radio';
      searchAndPlay(card.dataset.query, title, 'Youtify Radio', card, card.dataset.thumbnail);
    });
  }

  /* ── Home: recommended card click ───────────────────────────────────────── */
  const recGrid = document.querySelector('.rec-grid');
  if (recGrid) {
    recGrid.addEventListener('click', e => {
      const card = e.target.closest('.rec-card');
      if (!card) return;
      searchAndPlay(card.dataset.query, card.dataset.title, card.dataset.artist, card, card.dataset.thumbnail);
    });
  }

  /* ── Home: artist chip click ────────────────────────────────────────────── */
  const artistsScroll = document.getElementById('artists-scroll');
  if (artistsScroll) {
    artistsScroll.addEventListener('click', e => {
      const chip = e.target.closest('.artist-chip');
      if (!chip) return;
      const name = chip.querySelector('.artist-name')?.textContent || 'Artist';
      searchAndPlay(chip.dataset.query, name + ' Mix', name, chip, chip.dataset.thumbnail);
    });
  }

  /* ── Home: quick-plays click ─────────────────────────────────────────────── */
  dom.quickPlaysContainer.addEventListener('click', e => {
    const tile = e.target.closest('.quick-tile');
    if (!tile) return;
    const history = loadHistory();
    const track = history.find(h => h.videoId === tile.dataset.videoId);
    if (track) playTrack(track.videoId, track.title, track.artist, track.thumbnail);
  });

  /* ── Library: recently played click ─────────────────────────────────────── */
  dom.recentlyPlayedList.addEventListener('click', e => {
    const item = e.target.closest('.history-item');
    if (!item) return;
    const history = loadHistory();
    const track = history.find(h => h.videoId === item.dataset.videoId);
    if (track) playTrack(track.videoId, track.title, track.artist, track.thumbnail);
  });

  dom.recentlyPlayedList.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const item = e.target.closest('.history-item');
      if (item) { e.preventDefault(); item.click(); }
    }
  });

  /* ── Now Playing queue: click to play ───────────────────────────────────── */
  if (dom.npQueueList) {
    dom.npQueueList.addEventListener('click', e => {
      const item = e.target.closest('.np-queue-item');
      if (!item) return;
      const history = loadHistory();
      const track = history.find(h => h.videoId === item.dataset.videoId);
      if (track) playTrack(track.videoId, track.title, track.artist, track.thumbnail);
    });
  }

  /* ── Library: clear history ──────────────────────────────────────────────── */
  if (dom.clearHistoryBtn) dom.clearHistoryBtn.addEventListener('click', clearHistory);
}

/* ══ 15. TOAST NOTIFICATIONS ══════════════════════════════════════════════════ */

let toastTimer = null;

function showToast(message, duration = 2800) {
  clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  toastTimer = setTimeout(() => dom.toast.classList.remove('show'), duration);
}

/* ══ 16. UTILITIES ════════════════════════════════════════════════════════════ */

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ══ 17. INITIALIZATION ═══════════════════════════════════════════════════════ */

function init() {
  // Check API key
  if (!isApiKeySet()) {
    if (dom.apiKeyWarning) dom.apiKeyWarning.style.display = 'flex';
    console.warn(
      '[Youtify] No YouTube API key set.\n' +
      'Open app.js and replace YOUTUBE_API_KEY with your Google Cloud API key.\n' +
      'Enable "YouTube Data API v3" at https://console.cloud.google.com/'
    );
  }

  // Render charts
  renderChartsList(SPOTIFY_TRENDS, dom.spotifyList);
  fetchAndRenderLiveCharts();

  // Restore quick-plays
  renderQuickPlays();

  // Render Now Playing queue
  renderNowPlayingQueue();

  // Wire events
  initEventListeners();

  console.log('[Youtify] App initialized. Ready to stream 🎵');
}

// Start!
init();
