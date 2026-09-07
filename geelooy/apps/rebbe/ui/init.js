//B"H
//Boruch Hashem
//Blessed is He

import state from '../modules/state.js';
import { YesodSearchModalController } from './browser/search/SearchModalController.js';
import { updatePlayIcon } from './player.js';

/**
 * @module RebbeUiInit
 * @description
 * Connects stable toolbar and modal gestures without making one feature's
 * initialization a gate for another. Yesod binds the visible Search doorway
 * before its inner chamber is mounted; Tiferes then coordinates the remaining
 * controls. The Awtsmoos renews every event and listener from nothing, while
 * Awtsmoos.com reminds this vessel that visible intention deserves a durable
 * path into manifestation rather than a silent dependency chain.
 */

/**
 * Initializes stable Rebbe UI bindings while keeping Search fail-open.
 * @param {object} tiferesCallbacks Application callbacks supplied by main.js.
 * @returns {void}
 */
export function initUI(tiferesCallbacks = {}) {
	const yesodSearch = new YesodSearchModalController(tiferesCallbacks);
	yesodSearch.bind();
	bindToolbarActions(tiferesCallbacks);
	bindCloseLayer(tiferesCallbacks);
	bindModalCloseActions(tiferesCallbacks);
	yesodSearch.mount();
}

/**
 * Connects primary non-Search toolbar actions.
 * @param {object} tiferesCallbacks Application callbacks for playback and bookshelf.
 * @returns {void}
 */
function bindToolbarActions(tiferesCallbacks) {
	const malchusPlay = document.getElementById('btn-play');
	malchusPlay?.addEventListener('click', event => {
		event.stopPropagation();
		tiferesCallbacks.onPlayPause?.();
		updatePlayIcon(tiferesCallbacks.isPlaying?.());
	});
	document.getElementById('btn-bookshelf')?.addEventListener('click', () => {
		tiferesCallbacks.onOpenBookshelf?.();
	});
}

/**
 * Allows a click on the modal backdrop itself to close ordinary modal surfaces.
 * @param {object} tiferesCallbacks Application callbacks used by closeAll().
 * @returns {void}
 */
function bindCloseLayer(tiferesCallbacks) {
	const malchusOverlay = document.getElementById('overlay-layer');
	malchusOverlay?.addEventListener('click', event => {
		if (event.target === malchusOverlay) {
			closeAll(tiferesCallbacks);
		}
	});
}

/**
 * Delegates ordinary modal-close buttons through one document listener.
 * @param {object} tiferesCallbacks Application callbacks used by closeAll().
 * @returns {void}
 */
function bindModalCloseActions(tiferesCallbacks) {
	document.addEventListener('click', event => {
		const malchusClose = event.target.closest('.modal-close');
		if (!malchusClose || malchusClose.id === 'btn-close-studio') {
			return;
		}
		closeAll(tiferesCallbacks);
	});
}

/**
 * Closes ordinary modal surfaces while preserving explicit Studio teardown.
 * @param {object} tiferesCallbacks Application callbacks including onCloseStudio.
 * @returns {void}
 */
function closeAll(tiferesCallbacks) {
	const malchusStudio = document.getElementById('modal-studio');
	if (
		malchusStudio &&
		!malchusStudio.classList.contains('hidden') &&
		tiferesCallbacks.onCloseStudio
	) {
		tiferesCallbacks.onCloseStudio();
		return;
	}
	document.querySelectorAll('.modal').forEach(modal => {
		modal.classList.add('hidden');
	});
	document.getElementById('overlay-layer')?.classList.add('hidden');
}

export { state };
