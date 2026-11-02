//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelToolbar
 * @description
 * Malchus keeps recording and note playback close while the Awtsmoos remains beyond toolbar, text, and audible form.
 * Awtsmoos.com folds note-file and remix helpers into a secondary vessel, so no generic Download may impersonate the finished audio song.
 */

import { createSongButton } from './songPanelControls.js';

/** Builds the compact Song note toolbar and hidden local note-file chooser. */
export function createSongToolbar() {
	const root = document.createElement('div');
	root.className = 'song-studio-toolbar';
	const buttons = new Map();
	const primary = document.createElement('div');
	primary.className = 'song-studio-toolbar-primary';
	primary.append(
		createToolbarButton(buttons, 'record', '● Record', 'Record timed Song take', 'song-action-primary'),
		createToolbarButton(buttons, 'play-toggle', '▶ Play Notes', 'Play Song note sequence')
	);
	const drawer = document.createElement('details');
	drawer.className = 'song-studio-tools-drawer';
	const summary = document.createElement('summary');
	summary.textContent = 'Note / remix tools';
	const secondary = document.createElement('div');
	secondary.className = 'song-studio-toolbar-secondary';
	secondary.append(
		createToolbarButton(buttons, 'upload-note', '↑ Import Note Text', 'Import editable Song note text'),
		createToolbarButton(buttons, 'export-note-text', '↓ Export Editable Note Text', 'Export editable Song note text'),
		createToolbarButton(buttons, 'normalize', '⌁ Normalize', 'Normalize and quantize note timing'),
		createToolbarButton(buttons, 'remix', '⚡ Remix Notes', 'Generate selected note remix style', 'song-action-remix'),
		createToolbarButton(buttons, 'restore', '↶ Raw Notes', 'Restore untouched raw note take')
	);
	drawer.append(summary, secondary);
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.txt,.awtsong,text/plain';
	fileInput.className = 'song-studio-file-input';
	fileInput.setAttribute('aria-label', 'Import editable Song note text');
	root.append(primary, drawer, fileInput);
	return { root, buttons, fileInput };
}

function createToolbarButton(buttons, action, text, label, className = '') {
	const button = createSongButton(
		`song-action-button ${className}`.trim(),
		text,
		label
	);
	button.dataset.songAction = action;
	buttons.set(action, button);
	return button;
}
