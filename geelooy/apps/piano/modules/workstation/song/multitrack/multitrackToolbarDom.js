//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarDom
 * The Awtsmoos makes the waveform the room and the tools its servants;
 * Awtsmoos.com lets one transport button carry the rhythm's current.
 */
import { createTimelineNavigation } from './multitrackTimelineNavigation.js';

/** @returns {Object} Compact mobile audio editing toolbar. */
export function createMultitrackToolbarDom() {
	const root = document.createElement('div');
	root.className = 'multitrack-toolbar';
	const essentials = document.createElement('div');
	essentials.className = 'multitrack-essential-tools';
	const advanced = document.createElement('details');
	advanced.className = 'multitrack-extra-tools';
	const summary = document.createElement('summary');
	summary.textContent = 'More tools · Record · Zoom';
	const advancedGrid = document.createElement('div');
	advancedGrid.className = 'multitrack-extra-grid';
	advanced.append(summary, advancedGrid);
	const buttons = new Map();
	for (const [action, label, description] of toolbarSpecs()) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.multitrackAction = action;
		button.className = `multitrack-tool ${action === 'import' ? 'multitrack-tool-primary' : ''}`;
		button.textContent = label;
		button.setAttribute('aria-label', description);
		buttons.set(action, button);
		(['import', 'play', 'split', 'delete'].includes(action) ? essentials : advancedGrid).appendChild(button);
	}
	const navigation = createTimelineNavigation();
	const snap = createSnapSelect();
	const preferences = document.createElement('div');
	preferences.className = 'multitrack-edit-preferences';
	preferences.append(snap.root);
	const ripple = document.createElement('label');
	ripple.className = 'multitrack-ripple-toggle';
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.checked = true;
	checkbox.setAttribute('aria-label', 'Close the gap when deleting audio');
	ripple.append(checkbox, document.createTextNode(' Close gaps'));
	preferences.appendChild(ripple);
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'audio/*';
	fileInput.multiple = true;
	fileInput.className = 'multitrack-file-input';
	root.append(essentials, navigation.root, preferences, advanced, fileInput);
	return {
		root, buttons, snapSelect: snap.select, rippleCheckbox: checkbox, fileInput,
		playheadInput: navigation.playheadInput, overview: navigation.overview
	};
}

/** @returns {Array[]} Button descriptions. */
function toolbarSpecs() {
	return [
		['import', '＋ Add', 'Add audio files in one sequential track'],
		['play', '▶ Play', 'Play or stop multitrack audio'],
		['split', '✂ Cut', 'Split audio clip at playhead'],
		['delete', '⌫ Delete', 'Delete selected audio and close gap'],
		['punch', '● Record', 'Record new audio from the playhead'],
		['fit', '⇤ Fit', 'Fit song to visible width'],
		['duplicate', '⧉ Copy', 'Duplicate selected audio clip'],
		['repeat', '↻ Repeat', 'Repeat selected clip four times'],
		['ratchet', '⚡ Ratchet', 'Create rhythmic ratchet drop'],
		['zoomOut', '− Zoom', 'Zoom out'],
		['zoomIn', '+ Zoom', 'Zoom in']
	];
}

/** @returns {Object} Always-visible beat and magnetic snapping control. */
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
