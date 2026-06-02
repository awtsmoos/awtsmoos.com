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

/**
 * B"H
 * Main boot: archive, audio, search, bookshelf and studio awaken as one river.
 * Heavy result actions live in their own controller, so this file remains a
 * clear map of the palace rather than a crowded corridor.
 */
export async function init() {
  await runBootSequence();
  Render.log('INIT CORE SYSTEM...');
  const bg = document.getElementById('matrix-bg');
  if (bg) initViz(bg, () => Audio.getFreqData());
  Render.initUI(buildCallbacks());
  document.getElementById('btn-term-toggle')?.addEventListener('click', () => Render.toggleTerminal());
  bindAudioCallbacks();
  await bootArchive();
}

function buildCallbacks() {
  return {
    onYearSelect: Browser.handleYearSelect,
    onFolderSelect: Browser.handleFolderSelect,
    onTrackSelect: Browser.handleTrackSelect,
    onBack: Browser.handleBack,
    onPlayPause: Audio.togglePlay,
    onNext: Browser.handleNext,
    onPrev: Browser.handlePrev,
    onSeek: Audio.seek,
    onSeekRelative: seconds => Audio.seek(Audio.audioEl.currentTime + seconds),
    onSeekFraction: seekFraction,
    checkStatus: Store.isCached,
    onDownloadAction: () => {},
    onSearch: handleSearch,
    onPrimeSearchCache: handlePrimeSearchCache,
    onSearchResultSelect: item => createSearchResultHandlers().onOpen(item),
    onClearDB: handleClearDB,
    onOpenBookshelf: handleOpenBookshelf,
    onClearBookshelf: handleClearBookshelf,
    onShare: handleShare,
    isPlaying: Audio.isPlaying,
    onOpenSliceModal: handleOpenSliceModal,
    onAnalyzeVideo: handleAnalyzeVideo,
    onDownloadAudioSlice: value => VideoGen.handleDownloadAudioSlice(value),
    onRenderFinal: value => VideoGen.renderFinalVideo(value),
    onCloseStudio: handleCloseStudio
  };
}

function seekFraction(percent) {
  if (Audio.audioEl && Audio.audioEl.duration) Audio.seek(Audio.audioEl.duration * percent);
}

function bindAudioCallbacks() {
  Audio.setCallbacks({
    onUpdate: (current, duration) => {
      state.currentTime = current;
      state.currentDuration = duration;
      Render.updatePlayer(state.currentTracks[state.trackIndex]?.title, current, duration);
    },
    onEnd: Browser.handleNext,
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
    Render.renderSearchResults(results, createSearchResultHandlers());
    Render.log(`FOUND ${results.length} ENTRIES`);
  } catch (e) {
    console.error(e);
    Render.log('SEARCH FAILED', true);
  }
}

async function handlePrimeSearchCache(onProgress) {
  Render.log('CACHING DATE INDEXES...');
  const count = await Network.primeSearchIndexes(progress => onProgress?.(progress));
  Render.log(`CACHED DATE INDEX EVENTS: ${count}`);
}

async function handleOpenBookshelf() {
  const bookmarks = await Store.listBookmarks();
  Render.renderBookshelf(bookmarks, {
    onOpen: Browser.openBookmark,
    onRemove: async id => {
      await Store.removeBookmark(id);
      await handleOpenBookshelf();
    }
  });
  Render.openModal('modal-bookshelf');
}

async function handleClearBookshelf() {
  await Store.clearBookmarks();
  await handleOpenBookshelf();
  Render.log('BOOKSHELF CLEARED');
}

async function handleClearDB() {
  await Store.clearAllTracks();
  alert('CACHE CLEARED');
  location.reload();
}

function handleShare() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => alert('LINK COPIED: ' + url));
}

async function handleOpenSliceModal() {
  if (Audio.audioEl && Audio.audioEl.duration > 0) {
    Render.openModal('modal-video');
    Render.updateVideoProgress('OPENING FULL NLE...', 0.05);
    await VideoGen.handleAnalyzeVideo(0, Audio.audioEl.duration, state.resolutionSetting || 'portrait', state, () => {
      Render.closeModal('modal-video');
      Render.openModal('modal-studio');
      initStudio();
    });
    return;
  }
  VideoGen.initEmptyStudio(() => {
    Render.openModal('modal-studio');
    initStudio();
  });
}

async function handleAnalyzeVideo(start, duration, resolution) {
  await VideoGen.handleAnalyzeVideo(start, duration, resolution, state, () => {
    Render.closeModal('modal-video');
    Render.openModal('modal-studio');
    initStudio();
  });
}

function handleCloseStudio() {
  closeStudio();
  Render.closeModal('modal-studio');
}

init();
