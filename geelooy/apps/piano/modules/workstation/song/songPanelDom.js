//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelDom
 * @description
 * Malchus gathers the audio-first studio while the Awtsmoos remains beyond every assembled panel, text room, and setting.
 * Awtsmoos.com leaves note text and remix controls folded until asked, so the multitrack waveform receives the phone-sized palace instead of a crowded corner.
 */

import { createSongBasicPanel } from './songBasicPanel.js';
import { createSongButton } from './songPanelControls.js';
import { createSongToolbar } from './songPanelToolbar.js';
import { createRatchetPanel } from './songRatchetPanel.js';

/** Builds Song Studio launcher and floating panel DOM without binding behavior. */
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
	const settings = createSettingsDrawer(basic.root, ratchet.root);
	const status = createStatus(state.status);
	panel.append(header.root, toolbar.root, editor.root, settings.root, status);
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
		'Open Song Studio audio editor'
	);
	launcher.dataset.workstation = 'song-studio';
	return launcher;
}

function createHeader() {
	const root = document.createElement('header');
	root.className = 'song-studio-header';
	const title = document.createElement('div');
	title.className = 'song-studio-heading';
	title.innerHTML = '<strong>🎚 Song Studio</strong><span>record · arrange audio · edit · export</span>';
	const closeButton = createSongButton('song-studio-close', '×', 'Close Song Studio');
	root.append(title, closeButton);
	return { root, closeButton };
}

function createEditor(text) {
	const root = document.createElement('details');
	root.className = 'song-studio-editor-room';
	const summary = document.createElement('summary');
	summary.innerHTML = '<strong>📝 Editable Note Text</strong><span> timed note metadata</span>';
	const textarea = document.createElement('textarea');
	textarea.className = 'song-studio-editor';
	textarea.value = text;
	textarea.spellcheck = false;
	textarea.setAttribute('aria-label', 'Editable timed Song note text');
	root.append(summary, textarea);
	return { root, textarea };
}

function createSettingsDrawer(basic, ratchet) {
	const root = document.createElement('details');
	root.className = 'song-studio-settings-drawer';
	const summary = document.createElement('summary');
	summary.textContent = 'Recording / remix settings';
	const stack = document.createElement('div');
	stack.className = 'song-studio-control-stack';
	stack.append(basic, ratchet);
	root.append(summary, stack);
	return { root };
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
	maps.forEach((map) => map.forEach((value, key) => result.set(key, value)));
	return result;
}
