//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackDom
 * @description
 * Malchus keeps track identity, Mute, and Solo visible while the Awtsmoos remains beyond control and concealment.
 * Awtsmoos.com folds gain, pan, tone, copy, normalize, and delete into an advanced vessel, so narrow screens give the waveform more revelation.
 */

import { createMultitrackClipDom } from './multitrackClipDom.js';
import { MULTITRACK_TONES } from './multitrackTrackTone.js';

/** Creates one sticky track header and its scrollable clip lane. */
export function createMultitrackTrackDom(track, selection, timelineWidth) {
	const root = document.createElement('div');
	root.className = 'multitrack-track';
	root.dataset.trackId = track.id;
	const lane = document.createElement('div');
	lane.className = 'multitrack-lane';
	lane.dataset.trackId = track.id;
	lane.style.width = `${timelineWidth}px`;
	lane.setAttribute('role', 'listbox');
	track.clips.forEach((clip) => lane.appendChild(createMultitrackClipDom(clip, selection)));
	root.append(createTrackHeader(track), lane);
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
	const essentials = document.createElement('div');
	essentials.className = 'multitrack-track-switches multitrack-track-essentials';
	essentials.append(
		createSwitch('mute', 'M', track.muted, 'Mute track'),
		createSwitch('solo', 'S', track.solo, 'Solo track')
	);
	const advanced = createAdvancedTrackControls(track);
	root.append(name, essentials, advanced);
	return root;
}

function createAdvancedTrackControls(track) {
	const details = document.createElement('details');
	details.className = 'multitrack-track-advanced';
	const summary = document.createElement('summary');
	summary.textContent = 'Mix';
	const actions = document.createElement('div');
	actions.className = 'multitrack-track-switches';
	actions.append(
		createSwitch('duplicate-track', '⧉', false, 'Duplicate this track'),
		createSwitch('normalize-track', 'Norm', false, 'Normalize track level'),
		createSwitch('delete-track', '×', false, 'Delete track')
	);
	details.append(
		summary,
		actions,
		createRange('gain', 'Gain', track.gain, 0, 2, 0.05),
		createRange('pan', 'Pan', track.pan, -1, 1, 0.05),
		createToneSelector(track)
	);
	return details;
}

function createSwitch(action, text, active, label) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = text;
	button.dataset.trackControl = action;
	button.className = 'multitrack-track-switch';
	button.classList.toggle('multitrack-track-switch-active', active);
	button.setAttribute('aria-label', label);
	button.title = label;
	return button;
}

function createRange(action, title, value, min, max, step) {
	const label = document.createElement('label');
	label.className = 'multitrack-track-range';
	const text = document.createElement('span');
	text.textContent = title;
	const input = document.createElement('input');
	Object.assign(input, {
		type: 'range',
		min: String(min),
		max: String(max),
		step: String(step),
		value: String(value)
	});
	input.dataset.trackControl = action;
	label.append(text, input);
	return label;
}

function createToneSelector(track) {
	const label = document.createElement('label');
	label.className = 'multitrack-track-range';
	const caption = document.createElement('span');
	caption.textContent = 'Tone';
	const select = document.createElement('select');
	select.dataset.trackControl = 'instrument-color';
	MULTITRACK_TONES.forEach((tone) => select.appendChild(new Option(tone.name, tone.id)));
	select.value = track.instrumentColor || 'original';
	label.append(caption, select);
	return label;
}
