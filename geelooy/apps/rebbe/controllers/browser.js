//B"H
// controllers/browser.js
import state from '../modules/state.js';
import * as Network from '../modules/network.js';
import * as Store from '../modules/store.js';
import * as Render from '../render.js';
import * as Audio from '../audio.js';
import { createSearchResultHandlers } from './search-results.js';

let folderMap = {};

/**
 * B"H
 * Browser controller: years open, events unfold, and file actions share the same
 * download/cache/bookmark machinery as search results. One event law, everywhere.
 */
function openColumn(colId) {
  if (window.innerWidth <= 768) document.querySelectorAll('.col').forEach(c => c.classList.remove('open'));
  document.getElementById(colId)?.classList.add('open');
}

export function handleBack() {
  const tracksOpen = document.getElementById('col-tracks').classList.contains('open');
  const foldersOpen = document.getElementById('col-folders').classList.contains('open');
  if (tracksOpen) openColumn('col-folders');
  else if (foldersOpen) openColumn('col-years');
}

export async function handleYearSelect(yearId) {
  state.currentYearId = yearId;
  Render.log(`ACCESSING YEAR ${yearId}...`);
  try {
    folderMap = await Network.fetchYear(yearId);
    Render.renderFolders(folderMap, handleFolderSelect, handleFolderAction);
    openColumn('col-folders');
    updateURL({ year: yearId, clearFolder: true });
  } catch (e) {
    Render.log('ERROR: ' + e.message, true);
  }
}

export async function handleFolderSelect(folderId) {
  const folderName = folderById(folderId);
  if (!folderName) return Render.log('INVALID FOLDER ID', true);
  state.currentFolderName = folderName;
  Render.log(`OPENING ${folderName}...`);
  try {
    Render.setTracksLoading(true, folderName);
    const tracks = await Network.fetchFolder(state.currentYearId, folderName);
    state.currentTracks = tracks;
    state.folders[folderId] = tracks;
    Render.renderTracks(tracks, folderName, Store.isCached, handleTrackSelect, handleTrackAction);
    Render.setTracksLoading(false, folderName);
    openColumn('col-tracks');
    updateURL({ year: state.currentYearId, folder: folderName, clearTrack: true });
  } catch (e) {
    Render.setTracksLoading(false, 'ERROR');
    Render.log('ERROR: ' + e.message, true);
  }
}

export async function handleTrackSelect(index) {
  if (index < 0 || index >= state.currentTracks.length) return;
  state.trackIndex = index;
  const track = state.currentTracks[index];
  if (!track) return;
  Render.log(`LOADING: ${track.title}`);
  Render.updateActiveTrack(index);
  updateURL({ year: state.currentYearId, folder: state.currentFolderName, track: index });
  try {
    const cached = await Store.getTrack(track.path);
    if (cached) {
      Render.log('PLAYING FROM LOCAL CACHE');
      await Audio.playBlob(cached);
      return;
    }
    Render.log('STREAMING FROM ARCHIVE...');
    const ok = await Audio.playUrl(track.url, track.fallbackUrls || []);
    if (!ok) Render.log(`FAILED: ${track.title}`, true);
  } catch (e) {
    console.error(e);
    Render.log(`AUDIO LOAD FAILED: ${e.message}`, true);
  }
}

export async function handleTrackAction(action, track) {
  const handlers = createSearchResultHandlers();
  const item = currentEventItem();
  if (action === 'download-event') return handlers.onDownloadEvent(item, state.currentTracks);
  if (action === 'cache-event') return handlers.onCacheEvent(item, state.currentTracks);
  if (action === 'bookmark-folder') return handlers.onBookmark(item);
  if (action === 'download') return handlers.onDownloadTrack(track, item);
  if (action === 'cache') return handlers.onCacheTrack(track, item).then(refreshTracks);
  if (action === 'bookmark-track') return handlers.onBookmarkTrack(track, item);
}

export async function handleFolderAction(action, folder) {
  const handlers = createSearchResultHandlers();
  const item = eventItem(folder.rawTitle || folder.title);
  if (action === 'download-event') return handlers.onDownloadEvent(item);
  if (action === 'cache-event') return handlers.onCacheEvent(item);
  if (action === 'bookmark-folder') return handlers.onBookmark(item);
}

export async function openBookmark(item) {
  if (!item) return;
  await handleYearSelect(item.year);
  const folderIndex = Object.values(folderMap).indexOf(item.folder);
  if (folderIndex === -1) return Render.log('BOOKMARK FOLDER NOT FOUND', true);
  await handleFolderSelect(folderIndex);
  if (item.type === 'track') await openBookmarkedTrack(item);
}

async function openBookmarkedTrack(item) {
  const index = state.currentTracks.findIndex(track => track.path === item.path || track.title === item.title);
  if (index >= 0) await handleTrackSelect(index);
}

export function handleNext() {
  if (state.trackIndex < state.currentTracks.length - 1) handleTrackSelect(state.trackIndex + 1);
}

export function handlePrev() {
  if (state.trackIndex > 0) handleTrackSelect(state.trackIndex - 1);
}

export function getFolderMap() { return folderMap; }
export function setFolderMap(map) { folderMap = map; }

function folderById(id) {
  return Array.isArray(folderMap) ? folderMap[id] : Object.values(folderMap)[id];
}

function currentEventItem() {
  return eventItem(state.currentFolderName);
}

function eventItem(folderName) {
  return {
    year: state.currentYearId,
    folder: folderName,
    title: String(folderName || '').replace(/^BH[_\s-]*\d+[_\s-]*/i, '').replace(/_/g, ' ')
  };
}

function refreshTracks() {
  Render.renderTracks(state.currentTracks, state.currentFolderName, Store.isCached, handleTrackSelect, handleTrackAction);
}

function updateURL(params) {
  const url = new URL(window.location);
  if (params.year) url.searchParams.set('year', params.year);
  if (params.folder) url.searchParams.set('folder', params.folder);
  if (params.track !== undefined) url.searchParams.set('track', params.track);
  if (params.clearFolder) {
    url.searchParams.delete('folder');
    url.searchParams.delete('track');
    url.searchParams.delete('time');
    url.searchParams.delete('autoplay');
  }
  if (params.clearTrack) {
    url.searchParams.delete('track');
    url.searchParams.delete('time');
    url.searchParams.delete('autoplay');
  }
  window.history.replaceState({}, '', url);
}
