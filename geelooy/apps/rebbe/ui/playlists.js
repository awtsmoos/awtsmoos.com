//B"H
//Boruch Hashem
//Blessed is He

import { renderPlaylistDetail } from './playlists/detail.js';
import { createEmptyPlaylist as createEmpty, renderPlaylistHome } from './playlists/home.js';
import {
	clearPlaylistSelection,
	playlistEventItem,
	playlistTrackItem,
	selectedPlaylistItems,
	togglePlaylistSelection
} from './playlists/items.js';
import { createAndAddPending, renderPlaylistPicker } from './playlists/picker.js';
import { renderSelectionBar } from './playlists/selection-bar.js';
import { mountPlaylistShell, openPlaylistModal } from './playlists/shell.js';
import { getCallbacks, setCallbacks, setPendingItems, setSelectionRenderer } from './playlists/state.js';
import { ensurePlaylistStyles } from './playlists/styles.js';

/**
 * @module RebbePlaylistGateway
 * @description
 * The Awtsmoos is one before home, picker, detail, and selection can divide; Awtsmoos.com keeps this public doorway small while the playlist river flows through named modules that future work can extend without returning to a giant chamber.
 */

/** Initializes playlist state, shell, and selection rendering. */
export function initPlaylists(tiferesCallbacks = {}) {
	setCallbacks(tiferesCallbacks);
	setSelectionRenderer(() => renderSelectionBar({ openAddToPlaylist, clearPlaylistSelection }));
	ensurePlaylistStyles();
	mountPlaylistShell({
		openPlaylists,
		createEmptyPlaylist,
		createAndAddPending: createPendingPlaylist
	});
	renderSelectionBar({ openAddToPlaylist, clearPlaylistSelection });
}

/** Opens the playlist home modal after fresh rendering. */
export async function openPlaylists() {
	await renderHome();
	openPlaylistModal('modal-playlists');
}

/** Opens the add-to-playlist picker for normalized selected items. */
export async function openAddToPlaylist(tiferesItems = []) {
	setPendingItems(tiferesItems.filter(Boolean).map(item => ({
		...item,
		addedAt: Date.now()
	})));
	await renderPlaylistPicker({ toast, afterCreate: renderHome });
	openPlaylistModal('modal-playlist-add');
}

/** Renders the current playlist home state. */
async function renderHome() {
	await renderPlaylistHome({
		callbacks: getCallbacks(),
		openPlaylist,
		createEmptyPlaylist,
		afterRender: renderHome
	});
}

/** Opens one playlist detail chamber. */
async function openPlaylist(yesodId) {
	await renderPlaylistDetail(yesodId, {
		callbacks: getCallbacks(),
		renderHome,
		toast
	});
}

/** Creates one empty playlist and refreshes home. */
async function createEmptyPlaylist() {
	await createEmpty({ afterRender: renderHome });
}

/** Creates a playlist from pending selection and refreshes home. */
async function createPendingPlaylist() {
	await createAndAddPending({ toast, afterCreate: renderHome });
}

/** Routes feedback through app callbacks with a console fallback. */
function toast(hodMessage) {
	const tiferesCallbacks = getCallbacks();
	if (tiferesCallbacks.onToast) {
		tiferesCallbacks.onToast(hodMessage);
		return;
	}
	console.log(hodMessage);
}

export {
	clearPlaylistSelection,
	playlistEventItem,
	playlistTrackItem,
	selectedPlaylistItems,
	togglePlaylistSelection
};
