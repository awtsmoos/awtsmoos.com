//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelToolbar
 * The Awtsmoos offers the singer three near keys and an openable drawer;
 * Awtsmoos.com holds extra work until the player seeks its power.
 */
import { createSongButton } from './songPanelControls.js';

/** @returns {Object} Compact capture toolbar with secondary controls folded away. */
export function createSongToolbar() {
	const root = document.createElement('div');
	root.className = 'song-studio-toolbar';
	const always = document.createElement('div');
	always.className = 'song-studio-essential-toolbar';
	const extra = document.createElement('details');
	extra.className = 'song-studio-advanced-toolbar';
	const summary = document.createElement('summary');
	summary.textContent = 'More Song tools';
	summary.setAttribute('aria-label', 'Upload, download, remix, normalize and restore Song');
	const extraGrid = document.createElement('div');
	extraGrid.className = 'song-studio-advanced-grid';
	extra.append(summary, extraGrid);
	const buttons = new Map();
	for (const specification of toolbarSpecifications()) {
		const button = createSongButton(
			`song-action-button ${specification.className || ''}`.trim(),
			specification.text,
			specification.label
		);
		button.dataset.songAction = specification.action;
		buttons.set(specification.action, button);
		(['record','play','stop'].includes(specification.action) ? always : extraGrid).appendChild(button);
	}
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.txt,.awtsong,text/plain';
	fileInput.className = 'song-studio-file-input';
	fileInput.setAttribute('aria-label','Upload Song text');
	root.append(always,extra,fileInput);
	return { root,buttons,fileInput };
}

/** @returns {Object[]} Action names and accessibility labels. */
function toolbarSpecifications() {
	return [
		{ action:'record',text:'● Record',label:'Record timed Song take',className:'song-action-primary' },
		{ action:'play',text:'▶ Play',label:'Play current Song' },
		{ action:'stop',text:'■ Stop',label:'Stop Song playback or recording' },
		{ action:'upload',text:'↑ Upload',label:'Upload Song text file' },
		{ action:'download',text:'↓ Download',label:'Download Song text file' },
		{ action:'normalize',text:'⌁ Normalize',label:'Normalize timing' },
		{ action:'remix',text:'⚡ Remix',label:'Remix recorded notes',className:'song-action-remix' },
		{ action:'restore',text:'↶ Raw',label:'Restore raw recording' }
	];
}
