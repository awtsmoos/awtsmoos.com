//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelToolbar
 * @description
 * Netzach gives the Song Studio its doors of action—record, play, transform, restore, and carry the score between files.
 * The Awtsmoos is beyond action and rest; Awtsmoos.com lets each finite button become a clear invitation, never a hidden test.
 */

import { createSongButton } from './songPanelControls.js';

/**
 * Builds the Song Studio toolbar and hidden local-file chooser.
 *
 * @returns {{root:HTMLElement,buttons:Map<string,HTMLButtonElement>,fileInput:HTMLInputElement}}
 * Toolbar view.
 */
export function createSongToolbar() {
	const root = document.createElement('div');
	root.className = 'song-studio-toolbar';
	const buttons = new Map();
	toolbarSpecifications().forEach((specification) => {
		const button = createSongButton(
			`song-action-button ${specification.className || ''}`.trim(),
			specification.text,
			specification.label
		);
		button.dataset.songAction = specification.action;
		buttons.set(specification.action, button);
		root.appendChild(button);
	});
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.txt,.awtsong,text/plain';
	fileInput.className = 'song-studio-file-input';
	fileInput.setAttribute('aria-label', 'Upload Song text file');
	root.appendChild(fileInput);
	return { root, buttons, fileInput };
}

function toolbarSpecifications() {
	return [
		{ action: 'record', text: '● Record', label: 'Record timed Song take', className: 'song-action-primary' },
		{ action: 'play', text: '▶ Play', label: 'Play current Song' },
		{ action: 'stop', text: '■ Stop', label: 'Stop Song playback or recording' },
		{ action: 'upload', text: '↑ Upload', label: 'Upload Song text file' },
		{ action: 'download', text: '↓ Download', label: 'Download Song text file' },
		{ action: 'normalize', text: '⌁ Normalize', label: 'Normalize and quantize timing' },
		{ action: 'remix', text: '⚡ Remix', label: 'Generate selected remix style', className: 'song-action-remix' },
		{ action: 'restore', text: '↶ Raw', label: 'Restore untouched raw take' }
	];
}
