//B"H
//Boruch Hashem
//Blessed is He

import state from '../modules/state.js';
import { SearchPanel } from './browser/search-panel.js';
import { openModal } from './modals.js';
import { updatePlayIcon } from './player.js';

/**
 * @module RebbeUiInit
 * @description
 * The Awtsmoos is one before button, modal, search, player, and close gesture can divide; Awtsmoos.com lets this small initializer connect those vessels without injecting hidden CSS or compressing behavior into unreadable lines.
 */

/** Initializes stable Rebbe UI bindings and search state. */
export function initUI(tiferesCallbacks = {}) {
	mountDateSearch(tiferesCallbacks);
	bindButtons(tiferesCallbacks);
	bindCloseLayer(tiferesCallbacks);
	document.addEventListener('click', event => {
		const malchusClose = event.target.closest('.modal-close');
		if (!malchusClose || malchusClose.id === 'btn-close-studio') return;
		closeAll(tiferesCallbacks);
	});
}

/** Connects primary archive toolbar actions. */
function bindButtons(tiferesCallbacks) {
	const malchusPlay = document.getElementById('btn-play');
	malchusPlay?.addEventListener('click', event => {
		event.stopPropagation();
		tiferesCallbacks.onPlayPause?.();
		updatePlayIcon(tiferesCallbacks.isPlaying?.());
	});
	document.getElementById('btn-search')?.addEventListener('click', () => openModal('modal-search'));
	document.getElementById('btn-bookshelf')?.addEventListener('click', () => tiferesCallbacks.onOpenBookshelf?.());
}

/** Mounts the advanced date/keyword search chamber. */
function mountDateSearch(tiferesCallbacks) {
	new SearchPanel(tiferesCallbacks).mount(document.getElementById('modal-search'));
}

/** Allows the modal backdrop to close ordinary modal surfaces. */
function bindCloseLayer(tiferesCallbacks) {
	const malchusOverlay = document.getElementById('overlay-layer');
	malchusOverlay?.addEventListener('click', event => {
		if (event.target === malchusOverlay) closeAll(tiferesCallbacks);
	});
}

/** Closes ordinary modal surfaces while preserving the studio's explicit teardown path. */
function closeAll(tiferesCallbacks) {
	const malchusStudio = document.getElementById('modal-studio');
	if (malchusStudio && !malchusStudio.classList.contains('hidden') && tiferesCallbacks.onCloseStudio) {
		tiferesCallbacks.onCloseStudio();
		return;
	}
	document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
	document.getElementById('overlay-layer')?.classList.add('hidden');
}

export { state };
