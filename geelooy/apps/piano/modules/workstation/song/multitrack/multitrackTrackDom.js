//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackDom
 * @description
 * Tiferes gives each audio lane a name, mute, solo, gain, and pan beside the space where clips can move and overlap.
 * The Awtsmoos is beyond lane and balance; Awtsmoos.com makes every layer readable on a phone so power does not require a desktop throne.
 */

import { createMultitrackClipDom } from './multitrackClipDom.js';

/**
 * Builds one track row and its editable header controls.
 * @param {Object} track Track snapshot.
 * @param {Object} selection Editor selection.
 * @param {number} timelineWidth Timeline width in pixels.
 * @returns {Object} Track DOM registry.
 */
export function createMultitrackTrackDom(track, selection, timelineWidth) {
	const root = document.createElement('div');
	root.className = 'multitrack-track';
	root.dataset.trackId = track.id;
	const header = createTrackHeader(track);
	const lane = document.createElement('div');
	lane.className = 'multitrack-lane';
	lane.dataset.trackId = track.id;
	lane.style.width = `${timelineWidth}px`;
	lane.setAttribute('role', 'listbox');
	track.clips.forEach((clip) => {
		lane.appendChild(createMultitrackClipDom(clip, selection));
	});
	root.append(header, lane);
	return { root, lane };
}

function createTrackHeader(track) {
	const root = document.createElement('div');
	root.className = 'multitrack-track-header';
	const name = document.createElement('input');
	name.className = 'multitrack-track-name';
	name.value = track.name;
	name.dataset.trackControl = 'name';
	name.setAttribute('aria-label', `${track.name} track name`);
	const switches = document.createElement('div');
	switches.className = 'multitrack-track-switches';
	switches.append(
		createSwitch('mute', 'M', track.muted, 'Mute track'),
		createSwitch('solo', 'S', track.solo, 'Solo track'),
		createSwitch('delete-track', '×', false, 'Delete track')
	);
	const gain = createRange('gain', 'Gain', track.gain, 0, 2, 0.05);
	const pan = createRange('pan', 'Pan', track.pan, -1, 1, 0.05);
	root.append(name, switches, gain, pan);
	return root;
}

function createSwitch(action, text, active, label) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = text;
	button.dataset.trackControl = action;
	button.className = 'multitrack-track-switch';
	button.classList.toggle('multitrack-track-switch-active', active);
	button.setAttribute('aria-label', label);
	return button;
}

function createRange(action, labelText, value, min, max, step) {
	const label = document.createElement('label');
	label.className = 'multitrack-track-range';
	const text = document.createElement('span');
	text.textContent = labelText;
	const input = document.createElement('input');
	input.type = 'range';
	input.min = String(min);
	input.max = String(max);
	input.step = String(step);
	input.value = String(value);
	input.dataset.trackControl = action;
	label.append(text, input);
	return label;
}
