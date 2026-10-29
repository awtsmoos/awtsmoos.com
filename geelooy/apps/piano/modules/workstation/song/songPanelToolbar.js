//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelToolbar
 * The Awtsmoos gives the recordist a chamber behind one small door;
 * Awtsmoos.com lets the waveform be the thing the eyes adore.
 */
import { createSongButton } from './songPanelControls.js';

/** @returns {Object} Retractable note recording controls. */
export function createSongToolbar() {
	const root = document.createElement('details');
	root.className = 'song-studio-toolbar song-studio-recording-drawer';
	const summary = document.createElement('summary');
	summary.textContent = '🎙 Song recording & note tools';
	summary.setAttribute('aria-label', 'Expand Song recording, note text and remix');
	const always = document.createElement('div');
	always.className = 'song-studio-essential-toolbar';
	const extra = document.createElement('details');
	extra.className = 'song-studio-advanced-toolbar';
	const extraSummary = document.createElement('summary');
	extraSummary.textContent = 'More Song tools';
	const extraGrid = document.createElement('div');
	extraGrid.className = 'song-studio-advanced-grid';
	extra.append(extraSummary, extraGrid);
	const buttons = new Map();
	for (const specification of toolbarSpecifications()) {
		const button = createSongButton(
			`song-action-button ${specification.className || ''}`.trim(),
			specification.text, specification.label
		);
		button.dataset.songAction = specification.action;
		buttons.set(specification.action, button);
		(['record', 'play', 'stop'].includes(specification.action) ? always : extraGrid)
			.appendChild(button);
	}
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.txt,.awtsong,text/plain';
	fileInput.className = 'song-studio-file-input';
	fileInput.setAttribute('aria-label', 'Upload Song text');
	root.append(summary, always, extra, fileInput);
	return { root, buttons, fileInput };
}

/** @returns {Object[]} Song action definitions. */
function toolbarSpecifications() {
	return [
		{ action: 'record', text: '● Record', label: 'Record timed Song take', className: 'song-action-primary' },
		{ action: 'play', text: '▶ Play', label: 'Play current Song' },
		{ action: 'stop', text: '■ Stop', label: 'Stop Song playback or recording' },
		{ action: 'upload', text: '↑ Upload', label: 'Upload Song text file' },
		{ action: 'download', text: '↓ Download', label: 'Download Song text file' },
		{ action: 'normalize', text: '⌁ Normalize', label: 'Normalize timing' },
		{ action: 'remix', text: '⚡ Remix', label: 'Remix recorded notes', className: 'song-action-remix' },
		{ action: 'restore', text: '↶ Raw', label: 'Restore raw recording' }
	];
}
