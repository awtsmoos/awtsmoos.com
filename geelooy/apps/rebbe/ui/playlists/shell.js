//B"H
//Boruch Hashem
//Blessed is He

import { addModalHtml, playlistModalHtml } from './html.js';

/**
 * @module RebbePlaylistShell
 * @description
 * Mounts the dynamically created playlist modals and owns their controls. The
 * Awtsmoos is one before static and dynamic DOM can divide; close actions are
 * therefore bound after insertion rather than depending on an earlier modal scan.
 */

/**
 * Mounts the playlist toolbar entry, modal chambers, and all dynamic controls.
 * @param {object} deps Stable playlist callbacks supplied by the application root.
 * @returns {void}
 */
export function mountPlaylistShell(deps = {}) {
	mountToolbarButton();
	mountModals();
	bindCloseButtons();
	bindGlobalButtons(deps);
}

/**
 * Reveals exactly one playlist modal while keeping the shared overlay authoritative.
 * @param {string} id DOM id of the playlist modal to reveal.
 * @returns {void}
 */
export function openPlaylistModal(id) {
	document.getElementById('overlay-layer')?.classList.remove('hidden');
	document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
	const modal = document.getElementById(id);
	modal?.classList.remove('hidden');
	modal?.querySelector('button,input')?.focus();
}

/** Creates the toolbar playlist button once without disturbing neighboring tools. */
function mountToolbarButton() {
	const tools = document.querySelector('.tools');
	if (!tools || document.getElementById('btn-playlists')) return;
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'tool-btn';
	button.id = 'btn-playlists';
	button.title = 'Custom Playlists';
	button.innerHTML = '<span class="tool-emoji">♫</span><span class="sr-only">Playlists</span>';
	tools.insertBefore(button, tools.children[2] || null);
}

/** Inserts both playlist modal surfaces before any dynamic action is bound. */
function mountModals() {
	const overlay = document.getElementById('overlay-layer');
	if (!overlay) return;
	if (!document.getElementById('modal-playlists')) {
		overlay.insertAdjacentHTML('beforeend', playlistModalHtml());
	}
	if (!document.getElementById('modal-playlist-add')) {
		overlay.insertAdjacentHTML('beforeend', addModalHtml());
	}
}

/** Binds every dynamically inserted playlist × directly to reliable teardown. */
function bindCloseButtons() {
	document.querySelectorAll('.playlist-modal .modal-close').forEach(button => {
		button.onclick = closePlaylistModals;
	});
}

/** Hides playlist chambers and retracts their shared overlay immediately. */
function closePlaylistModals() {
	document.querySelectorAll('.playlist-modal').forEach(modal => modal.classList.add('hidden'));
	document.getElementById('overlay-layer')?.classList.add('hidden');
}

/** Connects playlist creation and navigation controls to application callbacks. */
function bindGlobalButtons({ openPlaylists, createEmptyPlaylist, createAndAddPending } = {}) {
	document.getElementById('btn-playlists')?.addEventListener('click', () => openPlaylists?.());
	document.querySelectorAll('.playlist-new-btn').forEach(button => {
		button.onclick = () => createEmptyPlaylist?.();
	});
	const create = document.getElementById('playlist-create-now');
	if (create) create.onclick = () => createAndAddPending?.();
}
