//B"H
import state from './modules/state.js';
import * as Audio from './audio.js';
import * as Network from './modules/network.js';
import * as Store from './store.js';
import * as Render from './render.js';
import * as VideoGen from './modules/video-gen.js';
import * as Browser from './controllers/browser.js';
import { createSearchResultHandlers } from './controllers/search-results.js';
import { initStudio, closeStudio } from './modules/studio/index.js';
import { initViz } from './viz.js';
import { runBootSequence } from './ui/boot.js';

const playlistSession = { id: null, shuffle: false, loop: 'off', source: [] };

/**
 * B"H
 * Main boot: archive, audio, search, bookshelf, studio, and playlists are tied
 * into one living nerve. The Awtsmoos makes the feature feel ancient here:
 * playback, cache, ZIP, and modal flows all resolve from this single root.
 * @returns {Promise<void>} Resolves after archive boot and deep link handling.
 */
export async function init() {
  await runBootSequence();
  Render.log('INIT CORE SYSTEM...');
  const bg = document.getElementById('matrix-bg');
  if (bg) initViz(bg, () => Audio.getFreqData());
  const callbacks = buildCallbacks();
  Render.initUI(callbacks);
  Render.initPlaylists(callbacks);
  document.getElementById('btn-term-toggle')?.addEventListener('click', () => Render.toggleTerminal());
  bindAudioCallbacks();
  await bootArchive();
}

function buildCallbacks() {
  return {
    onYearSelect: Browser.handleYearSelect, onFolderSelect: Browser.handleFolderSelect,
    onTrackSelect: Browser.handleTrackSelect, onBack: Browser.handleBack,
    onPlayPause: Audio.togglePlay, onNext: handleNext, onPrev: handlePrev,
    onSeek: Audio.seek, onSeekRelative: seconds => Audio.seek(Audio.audioEl.currentTime + seconds),
    onSeekFraction: seekFraction, checkStatus: Store.isCached, onDownloadAction: () => {},
    onSearch: handleSearch, onPrimeSearchCache: handlePrimeSearchCache,
    onSearchResultSelect: item => createSearchResultHandlers().onOpen(item),
    onClearDB: handleClearDB, onOpenBookshelf: handleOpenBookshelf,
    onClearBookshelf: handleClearBookshelf, onShare: handleShare,
    isPlaying: Audio.isPlaying, onOpenSliceModal: handleOpenSliceModal,
    onAnalyzeVideo: handleAnalyzeVideo, onDownloadAudioSlice: value => VideoGen.handleDownloadAudioSlice(value),
    onRenderFinal: value => VideoGen.renderFinalVideo(value), onCloseStudio: handleCloseStudio,
    onAddToPlaylist: items => Render.openAddToPlaylist(items), onOpenPlaylists: () => Render.openPlaylists(),
    onDownloadPlaylist: handleDownloadPlaylist, onCachePlaylist: handleCachePlaylist,
    onRefreshCachedPlaylist: handleCachePlaylist, onRemoveCachedPlaylist: handleRemoveCachedPlaylist,
    onPlayPlaylist: handlePlayPlaylist, onResumePlaylist: id => handlePlayPlaylist(id, { resume: true }),
    onContinueLastPlaylist: handleContinueLastPlaylist, onSetPlaylistLoop: setPlaylistLoop,
    onToast: message => Render.log(message)
  };
}

function seekFraction(percent) { if (Audio.audioEl && Audio.audioEl.duration) Audio.seek(Audio.audioEl.duration * percent); }

function bindAudioCallbacks() {
  Audio.setCallbacks({
    onUpdate: (current, duration) => {
      state.currentTime = current;
      state.currentDuration = duration;
      Render.updatePlayer(state.currentTracks[state.trackIndex]?.title, current, duration);
      persistPlaylistPlayhead(current);
    },
    onEnd: handleTrackEnd,
    onError: () => Render.log('AUDIO ERROR', true)
  });
}

async function bootArchive() {
  try {
    await Store.initDB();
    Render.log('FETCHING INDEX...');
    Render.renderYears(await Network.fetchIndex(), Browser.handleYearSelect);
    Render.log('READY.');
    await deepLink();
  } catch (e) {
    Render.log('BOOT ERROR: ' + e.message, true);
    console.error(e);
  }
}

async function deepLink() {
  const params = new URLSearchParams(location.search);
  const year = params.get('year');
  if (!year) return;
  await Browser.handleYearSelect(year);
  const folder = params.get('folder');
  if (!folder) return;
  const folderIndex = Browser.getFolderMap().indexOf(folder);
  if (folderIndex === -1) return Render.log(`FOLDER NOT FOUND: ${folder}`, true);
  await Browser.handleFolderSelect(folderIndex);
  const track = params.get('track');
  if (!track) return;
  const trackIndex = parseInt(track);
  if (Number.isNaN(trackIndex)) return;
  setTimeout(async () => {
    await Browser.handleTrackSelect(trackIndex);
    const time = params.get('time');
    if (time) setTimeout(() => Audio.audioEl && Audio.seek(parseFloat(time)), 500);
  }, 100);
}

async function handleSearch(filters) {
  Render.log('SEARCHING DATE INDEX...');
  try {
    const results = await Network.search(filters);
    Render.renderSearchResults(results, createSearchResultHandlers(buildCallbacks()));
    Render.log(`FOUND ${results.length} ENTRIES`);
  } catch (e) { console.error(e); Render.log('SEARCH FAILED', true); }
}

async function handlePrimeSearchCache(onProgress) {
  Render.log('CACHING DATE INDEXES...');
  const count = await Network.primeSearchIndexes(progress => onProgress?.(progress));
  Render.log(`CACHED DATE INDEX EVENTS: ${count}`);
}

async function handleOpenBookshelf() {
  const bookmarks = await Store.listBookmarks();
  Render.renderBookshelf(bookmarks, { onOpen: Browser.openBookmark, onRemove: async id => { await Store.removeBookmark(id); await handleOpenBookshelf(); } });
  Render.openModal('modal-bookshelf');
}

async function handleClearBookshelf() { await Store.clearBookmarks(); await handleOpenBookshelf(); Render.log('BOOKSHELF CLEARED'); }
async function handleClearDB() { await Store.clearAllTracks(); alert('CACHE CLEARED'); location.reload(); }
function handleShare() { navigator.clipboard.writeText(window.location.href).then(() => alert('LINK COPIED: ' + window.location.href)); }

async function handleDownloadPlaylist(id) {
  const playlist = await Store.getPlaylist(id);
  if (!playlist?.items?.length) return Render.log('Playlist empty', true);
  await createSearchResultHandlers(buildCallbacks()).onDownloadPlaylist(playlist);
}

async function handleCachePlaylist(id) {
  const playlist = await Store.getPlaylist(id);
  if (!playlist?.items?.length) return Render.log('Playlist empty', true);
  await createSearchResultHandlers(buildCallbacks()).onCachePlaylist(playlist);
}

async function handleRemoveCachedPlaylist(id) {
  const playlist = await Store.getPlaylist(id);
  if (!playlist?.items?.length) return Render.log('Playlist empty', true);
  await createSearchResultHandlers(buildCallbacks()).onRemoveCachedPlaylist(playlist);
}

async function handlePlayPlaylist(id, options = {}) {
  const playlist = await Store.getPlaylist(id);
  if (!playlist?.items?.length) return Render.log('Playlist empty', true);
  const tracks = playlist.items.map(item => ({ ...(item.track || item), title: item.title, path: item.path || item.track?.path, url: item.url || item.track?.url, fallbackUrls: item.fallbackUrls || item.track?.fallbackUrls || [] })).filter(track => track.path || track.url || track.fallbackUrls?.length);
  playlistSession.id = id;
  playlistSession.shuffle = Boolean(options.shuffle ?? playlist.playback?.shuffle);
  playlistSession.loop = options.loop || playlist.playback?.loop || playlistSession.loop || 'off';
  playlistSession.source = tracks;
  state.currentTracks = playlistSession.shuffle ? shuffle(tracks) : tracks;
  state.currentFolderName = playlist.title;
  state.trackIndex = Math.max(0, Math.min(state.currentTracks.length - 1, options.index ?? playlist.playhead?.index ?? 0));
  await Store.touchPlaylistPlayback(id, { index: state.trackIndex, time: 0 }, { shuffle: playlistSession.shuffle, loop: playlistSession.loop });
  await Browser.handleTrackSelect(state.trackIndex);
  if (options.resume && playlist.playhead?.time) setTimeout(() => Audio.seek(playlist.playhead.time), 450);
}

async function handleContinueLastPlaylist() {
  const last = (await Store.listPlaylists()).find(playlist => playlist.lastPlayedAt);
  if (last) return handlePlayPlaylist(last.id, { resume: true });
  Render.log('No playlist has been played yet', true);
}

async function handleTrackEnd() {
  if (!playlistSession.id) return Browser.handleNext();
  if (playlistSession.loop === 'track') return handlePlayPlaylist(playlistSession.id, { index: state.trackIndex, loop: 'track' });
  if (state.trackIndex < state.currentTracks.length - 1) return handlePlayPlaylist(playlistSession.id, { index: state.trackIndex + 1 });
  if (playlistSession.loop === 'playlist') return handlePlayPlaylist(playlistSession.id, { index: 0 });
}

function handleNext() { return playlistSession.id ? handleTrackEnd() : Browser.handleNext(); }
function handlePrev() { if (playlistSession.id && state.trackIndex > 0) return handlePlayPlaylist(playlistSession.id, { index: state.trackIndex - 1 }); return Browser.handlePrev(); }
async function setPlaylistLoop(id, loop) { const playlist = await Store.getPlaylist(id); if (playlist) await Store.savePlaylist({ ...playlist, playback: { ...(playlist.playback || {}), loop } }); if (playlistSession.id === id) playlistSession.loop = loop; }
function persistPlaylistPlayhead(time) { if (playlistSession.id && Number.isFinite(time)) Store.touchPlaylistPlayback(playlistSession.id, { index: state.trackIndex, time }, { shuffle: playlistSession.shuffle, loop: playlistSession.loop }); }

async function handleOpenSliceModal() {
  if (Audio.audioEl && Audio.audioEl.duration > 0) {
    Render.openModal('modal-video');
    Render.updateVideoProgress('OPENING FULL NLE...', 0.05);
    await VideoGen.handleAnalyzeVideo(0, Audio.audioEl.duration, state.resolutionSetting || 'portrait', state, () => { Render.closeModal('modal-video'); Render.openModal('modal-studio'); initStudio(); });
    return;
  }
  VideoGen.initEmptyStudio(() => { Render.openModal('modal-studio'); initStudio(); });
}

async function handleAnalyzeVideo(start, duration, resolution) {
  await VideoGen.handleAnalyzeVideo(start, duration, resolution, state, () => { Render.closeModal('modal-video'); Render.openModal('modal-studio'); initStudio(); });
}

function handleCloseStudio() { closeStudio(); Render.closeModal('modal-studio'); }
function shuffle(items) { const copy = [...items]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }

init();
