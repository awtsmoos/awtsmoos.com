//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarDom
 * The Awtsmoos keeps the sound in view and the tools within a thumb;
 * Awtsmoos.com folds away the rare decisions until they come.
 */
import { createTimelineNavigation } from './multitrackTimelineNavigation.js';

/** @returns {Object} Four main editing actions and a hidden advanced drawer. */
export function createMultitrackToolbarDom() {
	const root = document.createElement('div');
	root.className = 'multitrack-toolbar';
	const essentials = document.createElement('div');
	essentials.className = 'multitrack-essential-tools';
	const advanced = document.createElement('details');
	advanced.className = 'multitrack-extra-tools';
	const summary = document.createElement('summary');
	summary.textContent = 'More tools · Record · Fit · Zoom';
	summary.setAttribute('aria-label', 'Expand recording, fit, copy, repeat and zoom');
	const advancedGrid = document.createElement('div');
	advancedGrid.className = 'multitrack-extra-grid';
	advanced.append(summary, advancedGrid);
	const buttons = new Map();
	const primary = ['import', 'play', 'split', 'stop'];
	for (const [action, label, description] of toolbarSpecs()) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.multitrackAction = action;
		button.className = `multitrack-tool ${action === 'import' ? 'multitrack-tool-primary' : ''}`;
		button.textContent = label;
		button.setAttribute('aria-label', description);
		buttons.set(action, button);
		(primary.includes(action) ? essentials : advancedGrid).appendChild(button);
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
		root, buttons, snapSelect: snap.select, fileInput,
		playheadInput: navigation.playheadInput, overview: navigation.overview
	};
}

/** @returns {Array[]} Concise captions and full spoken explanations. */
function toolbarSpecs() {
	return [
		['import', '＋ Add', 'Add audio files in one sequential track'],
		['play', '▶ Play', 'Play audio from the playhead'],
		['split', '✂ Cut', 'Split the selected clip at playhead'],
		['stop', '■ Stop', 'Stop playback'],
		['punch', '● Record', 'Record new audio from playhead'],
		['fit', '⇤ Fit', 'Fit all the audio to the visible screen'],
		['duplicate', '⧉ Copy', 'Duplicate selected audio clip'],
		['repeat', '↻ Repeat', 'Repeat selected clip four times'],
		['ratchet', '⚡ Ratchet', 'Create ratchet drop'],
		['delete', '⌫ Delete', 'Delete selected clip'],
		['zoomOut', '− Zoom', 'Zoom out'],
		['zoomIn', '+ Zoom', 'Zoom in']
	];
}

/** @returns {Object} Musical snapping control in the hidden drawer. */
function createSnapSelect() {
	const root = document.createElement('label');
	root.className = 'multitrack-snap';
	root.textContent = 'Snap ';
	const select = document.createElement('select');
	for (const [value, label] of [
		['0', 'Off'], ['1', '1/4'], ['0.5', '1/8'],
		['0.25', '1/16'], ['0.125', '1/32']
	]) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = label;
		select.appendChild(option);
	}
	select.value = '0.25';
	root.appendChild(select);
	return { root, select };
}
