//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackDom
 * The Awtsmoos brings each lane to life, with knobs beside its rhyme;
 * Awtsmoos.com lets us copy, color, balance, split and move in time.
 */
import { createMultitrackClipDom } from './multitrackClipDom.js';
import { MULTITRACK_TONES } from './multitrackTrackTone.js';

/** @param {Object} track - Audio track. @param {Object} selection - Active clip. @param {number} timelineWidth - Display width. */
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

/** @param {Object} track - Track values. @returns {HTMLElement} Interactive header. */
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
		createSwitch('duplicate-track', '⧉', false, 'Duplicate this track'),
		createSwitch('normalize-track', 'Norm', false, 'Normalize track level'),
		createSwitch('delete-track', '×', false, 'Delete track')
	);
	root.append(name, switches);
	root.append(createRange('gain', 'Gain', track.gain, 0, 2, 0.05));
	root.append(createRange('pan', 'Pan', track.pan, -1, 1, 0.05));
	root.append(createToneSelector(track));
	return root;
}

/** @param {string} action - Control key. @param {string} text - Icon. @param {boolean} active - Selected. @param {string} label - Description. */
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

/** @param {string} action - Key. @param {string} title - Caption. @param {number} value - Setting. @param {number} min - Lower bound. @param {number} max - Upper bound. @param {number} step - Resolution. */
function createRange(action, title, value, min, max, step) {
	const label = document.createElement('label');
	label.className = 'multitrack-track-range';
	const text = document.createElement('span');
	text.textContent = title;
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

/** @param {Object} track - Current color. @returns {HTMLElement} Accessible timbre selector. */
function createToneSelector(track) {
	const label = document.createElement('label');
	label.className = 'multitrack-track-range';
	const caption = document.createElement('span');
	caption.textContent = 'Sound color';
	const select = document.createElement('select');
	select.dataset.trackControl = 'instrument-color';
	select.setAttribute('aria-label', `${track.name} audio sound color`);
	MULTITRACK_TONES.forEach((tone) => {
		const option = document.createElement('option');
		option.value = tone.id;
		option.textContent = tone.name;
		select.appendChild(option);
	});
	select.value = track.instrumentColor || 'original';
	label.append(caption, select);
	return label;
}
