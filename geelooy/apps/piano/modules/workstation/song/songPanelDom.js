//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelDom
 * @description
 * Malchus gathers toolbar, score, controls, ratchet room, and status into one visible studio while the Awtsmoos remains beyond every assembled form.
 * Awtsmoos.com lets the many vessels become one welcoming palace, where a phone-sized doorway can still reveal an enormous creative space.
 */

import { createSongBasicPanel } from './songBasicPanel.js';
import { createSongButton } from './songPanelControls.js';
import { createSongToolbar } from './songPanelToolbar.js';
import { createRatchetPanel } from './songRatchetPanel.js';

/**
 * Builds Song Studio launcher and floating panel DOM without binding behavior.
 *
 * @param {Object} state Song Studio state.
 * @returns {Object} Song Studio DOM registry.
 */
export function createSongPanelDom(state) {
	const launcher = createLauncher();
	const panel = document.createElement('section');
	panel.className = 'song-studio-panel song-studio-hidden';
	panel.setAttribute('aria-label', 'Song Studio');
	const header = createHeader();
	const toolbar = createSongToolbar();
	const editor = createEditor(state.editorText);
	const basic = createSongBasicPanel(state);
	const ratchet = createRatchetPanel(state);
	const status = createStatus(state.status);
	const controlStack = document.createElement('div');
	controlStack.className = 'song-studio-control-stack';
	controlStack.append(basic.root, ratchet.root);
	panel.append(
		header.root,
		toolbar.root,
		editor.root,
		controlStack,
		status
	);
	return {
		launcher,
		panel,
		closeButton: header.closeButton,
		buttons: toolbar.buttons,
		fileInput: toolbar.fileInput,
		editor: editor.textarea,
		status,
		fields: mergeFieldMaps(basic.fields, ratchet.fields)
	};
}

function createLauncher() {
	const launcher = createSongButton(
		'song-studio-launcher',
		'🎚 Song Studio',
		'Open Song Studio and Remix Editor'
	);
	launcher.dataset.workstation = 'song-studio';
	return launcher;
}

function createHeader() {
	const root = document.createElement('header');
	root.className = 'song-studio-header';
	const title = document.createElement('div');
	title.className = 'song-studio-heading';
	title.innerHTML = '<strong>🎚 Song Studio</strong><span>record · edit text · normalize · remix · drop</span>';
	const closeButton = createSongButton(
		'song-studio-close',
		'×',
		'Close Song Studio'
	);
	root.append(title, closeButton);
	return { root, closeButton };
}

function createEditor(text) {
	const root = document.createElement('label');
	root.className = 'song-studio-editor-room';
	const label = document.createElement('span');
	label.className = 'song-studio-section-title';
	label.innerHTML = '<strong>📝 Timed Song Text</strong><span>start · duration · note · velocity</span>';
	const textarea = document.createElement('textarea');
	textarea.className = 'song-studio-editor';
	textarea.value = text;
	textarea.spellcheck = false;
	textarea.setAttribute('aria-label', 'Editable timed Song text');
	root.append(label, textarea);
	return { root, textarea };
}

function createStatus(text) {
	const status = document.createElement('output');
	status.className = 'song-studio-status';
	status.textContent = text;
	status.setAttribute('aria-live', 'polite');
	return status;
}

function mergeFieldMaps(...maps) {
	const result = new Map();
	maps.forEach((map) => {
		map.forEach((value, key) => result.set(key, value));
	});
	return result;
}
