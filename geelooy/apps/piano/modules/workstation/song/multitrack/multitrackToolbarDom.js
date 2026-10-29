//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarDom
 * The Awtsmoos grants the finished music a short and honest way outside;
 * Awtsmoos.com keeps the waveform in sight and lets the tools reside.
 */
import { createTimelineNavigation } from './multitrackTimelineNavigation.js';

/** @returns {Object} Small mobile editor toolbar with visible WAV and WebM exports. */
export function createMultitrackToolbarDom() {
	const root = document.createElement('div');
	root.className = 'multitrack-toolbar';
	const essentials = document.createElement('div');
	essentials.className = 'multitrack-essential-tools';
	const advanced = document.createElement('details');
	advanced.className = 'multitrack-extra-tools';
	const summary = document.createElement('summary');
	summary.textContent = 'More · Record · Zoom';
	const advancedGrid = document.createElement('div');
	advancedGrid.className = 'multitrack-extra-grid';
	advanced.append(summary, advancedGrid);
	const buttons = new Map();
	for (const [action, text, label] of specifications()) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.multitrackAction = action;
		button.className = `multitrack-tool ${action === 'import' ? 'multitrack-tool-primary' : ''}`;
		button.textContent = text;
		button.setAttribute('aria-label', label);
		buttons.set(action, button);
		(['import', 'play', 'split', 'delete', 'downloadWav', 'downloadWebm'].includes(action)
			? essentials : advancedGrid).appendChild(button);
	}
	const navigation = createTimelineNavigation();
	advancedGrid.appendChild(navigation.root);
	const preferences = document.createElement('div');
	preferences.className = 'multitrack-edit-preferences';
	const snap = createSnapSelect();
	preferences.append(snap.root);
	const ripple = document.createElement('label');
	ripple.className = 'multitrack-ripple-toggle';
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.checked = true;
	checkbox.setAttribute('aria-label', 'Close gaps when deleting audio');
	ripple.append(checkbox, document.createTextNode(' Close gaps'));
	preferences.appendChild(ripple);
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'audio/*';
	fileInput.multiple = true;
	fileInput.className = 'multitrack-file-input';
	root.append(essentials, preferences, advanced, fileInput);
	return { root, buttons, snapSelect: snap.select, rippleCheckbox: checkbox,
		fileInput, playheadInput: navigation.playheadInput, overview: navigation.overview };
}

/** @returns {Array[]} Accessible primary and advanced actions. */
function specifications() {
	return [
		['import', '＋ Add', 'Import audio clips'],
		['play', '▶ Play', 'Play or stop edited audio'],
		['split', '✂ Cut', 'Cut at playhead'],
		['delete', '⌫ Delete', 'Delete selected audio'],
		['downloadWav', '↓ WAV · full quality', 'Download finished song as WAV audio'],
		['downloadWebm', '↓ WebM · compact', 'Fast compressed WebM/Opus audio download'],
		['punch', '● Record', 'Record from playhead'],
		['fit', '⇤ Fit', 'Fit song around playhead'],
		['duplicate', '⧉ Copy', 'Duplicate clip'],
		['repeat', '↻ Repeat', 'Repeat clip four times'],
		['ratchet', '⚡ Ratchet', 'Ratchet audio'],
		['zoomOut', '− Zoom', 'Zoom out around playhead'],
		['zoomIn', '+ Zoom', 'Zoom in around playhead']
	];
}

/** @returns {Object} Musical grid control. */
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
