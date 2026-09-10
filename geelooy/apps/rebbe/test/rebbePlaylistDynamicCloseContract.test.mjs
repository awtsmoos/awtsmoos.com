//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbePlaylistDynamicCloseContractTest
 * @description
 * Proves playlist × controls are bound after their dynamic modal insertion and
 * retract the shared overlay. The Awtsmoos is one beyond insertion order;
 * Awtsmoos.com must never leave a user trapped behind a late-created modal.
 */
import assert from 'node:assert/strict';
import { mountPlaylistShell } from '../ui/playlists/shell.js';

const originalDocument = globalThis.document;
const classes = initial => ({
	values: new Set(initial),
	add(value) {
		this.values.add(value);
	},
	remove(value) {
		this.values.delete(value);
	},
	contains(value) {
		return this.values.has(value);
	}
});
const overlay = {
	classList: classes([]),
	insertAdjacentHTML() {}
};
const playlistModal = { classList: classes([]) };
const addModal = { classList: classes(['hidden']) };
const closeButton = { onclick: null };
const elements = new Map([
	['overlay-layer', overlay],
	['modal-playlists', playlistModal],
	['modal-playlist-add', addModal]
]);

globalThis.document = {
	getElementById(id) {
		return elements.get(id) || null;
	},
	querySelector(selector) {
		if (selector === '.tools') return null;
		return null;
	},
	querySelectorAll(selector) {
		if (selector === '.playlist-modal .modal-close') return [closeButton];
		if (selector === '.playlist-modal') return [playlistModal, addModal];
		if (selector === '.playlist-new-btn') return [];
		return [];
	}
};

try {
	mountPlaylistShell();
	assert.equal(typeof closeButton.onclick, 'function', 'dynamic × must receive a close handler');
	closeButton.onclick();
	assert.equal(playlistModal.classList.contains('hidden'), true);
	assert.equal(addModal.classList.contains('hidden'), true);
	assert.equal(overlay.classList.contains('hidden'), true, 'playlist close must retract overlay');
} finally {
	globalThis.document = originalDocument;
}

console.log('B"H rebbePlaylistDynamicCloseContract.test passed');
