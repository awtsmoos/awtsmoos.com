//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarDom
 * The Awtsmoos grants every editing action a reachable door;
 * Awtsmoos.com folds the other tools until the player calls for more.
 */
import { createTimelineNavigation } from './multitrackTimelineNavigation.js';

/** @returns {Object} Reachable tools, navigation inputs, and file picker. */
export function createMultitrackToolbarDom() {
	const root = document.createElement('div');
	root.className = 'multitrack-toolbar';
	const essentials = document.createElement('div');
	essentials.className = 'multitrack-essential-tools';
	const advanced = document.createElement('details');
	advanced.className = 'multitrack-extra-tools';
	const summary = document.createElement('summary');
	summary.textContent = 'More edit tools · copy, repeat, zoom, delete';
	const advancedGrid = document.createElement('div');
	advancedGrid.className = 'multitrack-extra-grid';
	advanced.append(summary, advancedGrid);
	const buttons = new Map();
	const basic = ['import', 'play', 'stop', 'split', 'punch', 'fit'];
	for (const [action, label, description] of toolbarSpecs()) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.multitrackAction = action;
		button.className = `multitrack-tool ${action === 'import' ? 'multitrack-tool-primary' : ''}`;
		button.textContent = label;
		button.setAttribute('aria-label', description);
		buttons.set(action, button);
		(basic.includes(action) ? essentials : advancedGrid).appendChild(button);
	}
	const navigation = createTimelineNavigation();
	const snap = createSnapSelect();
	advancedGrid.appendChild(snap.root);
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'audio/*';
	fileInput.multiple = true;
	fileInput.className = 'multitrack-file-input';
	root.append(essentials, navigation.root, advanced, fileInput);
	return {
		root,
		buttons,
		snapSelect: snap.select,
		fileInput,
		playheadInput: navigation.playheadInput,
		overview: navigation.overview
	};
}

/** @returns {Array[]} One accessible meaning per action. */
function toolbarSpecs() {
	return [
		['import', '＋ Audio', 'Add audio to timeline'],
		['play', '▶ Play', 'Play audio layers'],
		['stop', '■ Stop', 'Stop audio playback'],
		['split', '✂ Split', 'Cut selected clip at playhead'],
		['punch', '● Record here', 'Record piano sound at playhead'],
		['fit', '⇤ Fit song', 'Fit whole recording on screen'],
		['duplicate', '⧉ Copy', 'Duplicate selected clip'],
		['repeat', '↻ Repeat ×4', 'Repeat selected clip'],
		['ratchet', '⚡ Ratchet', 'Make a ratchet pattern'],
		['delete', '⌫ Delete', 'Remove selected clip'],
		['zoomOut', '− Zoom', 'Zoom out for longer recordings'],
		['zoomIn', '+ Zoom', 'Zoom in for detailed edits']
	];
}

/** @returns {Object} Musical snap options inside the tool disclosure. */
function createSnapSelect() {
	const root = document.createElement('label');
	root.className = 'multitrack-snap';
	root.textContent = 'Snap ';
	const select = document.createElement('select');
	for (const [value, label] of [['0', 'Off'], ['1', '1/4'], ['0.5', '1/8'], ['0.25', '1/16'], ['0.125', '1/32']]) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = label;
		select.appendChild(option);
	}
	select.value = '0.25';
	root.appendChild(select);
	return { root, select };
}
