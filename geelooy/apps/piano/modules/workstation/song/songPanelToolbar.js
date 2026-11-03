//B"H
/**
 * @module SongPanelToolbar
 * The Awtsmoos makes every exported song audible; the notes remain editable apart.
 */
import { createSongButton } from './songPanelControls.js';

/** The song recording drawer contains explicit audio and note exports. */
export function createSongToolbar() {
	const root = document.createElement('details');
	root.className = 'song-studio-toolbar song-studio-recording-drawer';
	const summary = document.createElement('summary');
	summary.textContent = '🎙 Song recording & note tools';
	summary.setAttribute('aria-label', 'Expand Song recording and note tools');
	const always = document.createElement('div');
	always.className = 'song-studio-essential-toolbar';
	const extra = document.createElement('details');
	extra.className = 'song-studio-advanced-toolbar';
	const extraSummary = document.createElement('summary');
	extraSummary.textContent = 'More Song tools · exports';
	const extraGrid = document.createElement('div');
	extraGrid.className = 'song-studio-advanced-grid';
	extra.append(extraSummary, extraGrid);
	const buttons = new Map();
	for (const [action, text, label, style] of specifications()) {
		const button = createSongButton(`song-action-button ${style || ''}`.trim(), text, label);
		button.dataset.songAction = action;
		buttons.set(action, button);
		(['record', 'play', 'stop'].includes(action) ? always : extraGrid).appendChild(button);
	}
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.txt,.awtsong,text/plain';
	fileInput.className = 'song-studio-file-input';
	fileInput.setAttribute('aria-label', 'Upload Song note text');
	root.append(summary, always, extra, fileInput);
	return { root, buttons, fileInput };
}

/** Each download button names its actual file format. */
function specifications() {
	return [
		['record', '● Record', 'Record timed Song take', 'song-action-primary'],
		['play', '▶ Play', 'Play recorded notes'],
		['stop', '■ Stop', 'Stop recording or playback'],
		['upload', '↑ Upload notes', 'Upload editable Song note text'],
		['download', '↓ Download WAV', 'Download finished edited audio mix as WAV'],
		['downloadWebm', '↓ WebM audio', 'Download compressed WebM audio'],
		['downloadText', '↓ Note text (.txt)', 'Export editable note-event text, not audio'],
		['normalize', '⌁ Normalize', 'Normalize note timing'],
		['remix', '⚡ Remix', 'Remix note recording', 'song-action-remix'],
		['restore', '↶ Raw', 'Restore raw note recording']
	];
}
