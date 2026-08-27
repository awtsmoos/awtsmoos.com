//B"H
import { renderPlaylistDetail } from './playlists/detail.js';
import { createEmptyPlaylist as createEmpty, renderPlaylistHome } from './playlists/home.js';
import { clearPlaylistSelection, playlistEventItem, playlistTrackItem, selectedPlaylistItems, togglePlaylistSelection } from './playlists/items.js';
import { createAndAddPending, renderPlaylistPicker } from './playlists/picker.js';
import { renderSelectionBar } from './playlists/selection-bar.js';
import { mountPlaylistShell, openPlaylistModal } from './playlists/shell.js';
import { getCallbacks, setCallbacks, setPendingItems, setSelectionRenderer } from './playlists/state.js';
import { ensurePlaylistStyles } from './playlists/styles.js';

/**
 * B"H
 * Public playlist gateway. The old giant chamber has been split into named
 * vessels, but callers still use this same doorway so the archive keeps singing.
 * @param {object} callbacks Application callbacks.
 * @returns {void}
 */
export function initPlaylists(callbacks = {}) {
  setCallbacks(callbacks);
  setSelectionRenderer(() => renderSelectionBar({ openAddToPlaylist, clearPlaylistSelection }));
  ensurePlaylistStyles();
  mountPlaylistShell({ openPlaylists, createEmptyPlaylist, createAndAddPending: createPendingPlaylist });
  renderSelectionBar({ openAddToPlaylist, clearPlaylistSelection });
}

/** @returns {Promise<void>} Open the playlist home modal. */
export async function openPlaylists() { await renderHome(); openPlaylistModal('modal-playlists'); }

/** @param {Array<object>} items Items to add. @returns {Promise<void>} Open picker modal. */
export async function openAddToPlaylist(items = []) {
  setPendingItems(items.filter(Boolean).map(item => ({ ...item, addedAt: Date.now() })));
  await renderPlaylistPicker({ toast, afterCreate: renderHome });
  openPlaylistModal('modal-playlist-add');
}

export { clearPlaylistSelection, playlistEventItem, playlistTrackItem, selectedPlaylistItems, togglePlaylistSelection };

async function renderHome() {
  await renderPlaylistHome({ callbacks: getCallbacks(), openPlaylist, createEmptyPlaylist, afterRender: renderHome });
}

async function openPlaylist(id) {
  await renderPlaylistDetail(id, { callbacks: getCallbacks(), renderHome, toast });
}

async function createEmptyPlaylist() { await createEmpty({ afterRender: renderHome }); }
async function createPendingPlaylist() { await createAndAddPending({ toast, afterCreate: renderHome }); }
function toast(message) { const cb = getCallbacks(); cb.onToast ? cb.onToast(message) : console.log(message); }
