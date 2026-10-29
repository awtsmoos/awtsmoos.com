//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarDom
 * The Awtsmoos gives each useful action a nearby button and a name;
 * Awtsmoos.com folds the rarer tools away without hiding the flame.
 */
import { createTimelineNavigation } from './multitrackTimelineNavigation.js';

/** @returns {Object} Mobile-priority tools, edit actions and time navigation. */
export function createMultitrackToolbarDom() {
	const root = document.createElement('div');
	root.className = 'multitrack-toolbar';
	const essentials = document.createElement('div');
	essentials.className = 'multitrack-essential-tools';
	const advanced = document.createElement('details');
	advanced.className = 'multitrack-extra-tools';
	const summary = document.createElement('summary');
	summary.textContent = 'More editing tools';
	summary.setAttribute('aria-label', 'Copy, repeat, delete and zoom audio');
	const advancedGrid = document.createElement('div');
	advancedGrid.className = 'multitrack-extra-grid';
	advanced.append(summary, advancedGrid);
	const buttons = new Map();
	const primary = ['import','play','stop','split','punch','fit'];
	for (const [action,label,description] of toolbarSpecs()) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.multitrackAction = action;
		button.className = `multitrack-tool ${action==='import'?'multitrack-tool-primary':''}`;
		button.textContent = label;
		button.setAttribute('aria-label',description);
		buttons.set(action,button);
		(primary.includes(action)?essentials:advancedGrid).appendChild(button);
	}
	const navigation = createTimelineNavigation();
	const snap = createSnapSelect();
	advancedGrid.appendChild(snap.root);
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'audio/*';
	fileInput.multiple = true;
	fileInput.className = 'multitrack-file-input';
	root.append(essentials,navigation.root,advanced,fileInput);
	return {
		root,buttons,snapSelect:snap.select,fileInput,
		playheadInput:navigation.playheadInput,overview:navigation.overview
	};
}

/** @returns {Array[]} Concise visual labels and full accessibility descriptions. */
function toolbarSpecs() {
	return [
		['import','＋ Audio','Import audio into the timeline'],
		['play','▶ Play','Play audio from playhead'],
		['stop','■ Stop','Stop audio playback'],
		['split','✂ Cut','Cut audio under the red marker at the current time'],
		['punch','● Record','Record piano sound at playhead'],
		['fit','⇤ Fit','Fit the whole recording on screen'],
		['duplicate','⧉ Copy','Duplicate selected audio'],
		['repeat','↻ Repeat','Repeat selected clip four times'],
		['ratchet','⚡ Ratchet','Create a ratchet pattern'],
		['delete','⌫ Delete','Remove selected clip'],
		['zoomOut','− Zoom','Zoom out for long recordings'],
		['zoomIn','+ Zoom','Zoom in for precise edits']
	];
}

/** @returns {Object} Retractable snap-grid control. */
function createSnapSelect() {
	const root = document.createElement('label');
	root.className = 'multitrack-snap';
	root.textContent = 'Snap ';
	const select = document.createElement('select');
	for (const [value,label] of [['0','Off'],['1','1/4'],['0.5','1/8'],['0.25','1/16'],['0.125','1/32']]) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = label;
		select.appendChild(option);
	}
	select.value = '0.25';
	root.appendChild(select);
	return { root,select };
}
