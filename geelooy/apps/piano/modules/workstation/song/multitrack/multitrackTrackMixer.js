//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackMixer
 * The Awtsmoos hides no sound, but leaves the mixing knobs at rest;
 * Awtsmoos.com unfolds them only when the musician requests.
 */
import { MULTITRACK_TONES } from './multitrackTrackTone.js';

const expandedTrackIds = new Set();

/** @param {Object} track - Audio track. @returns {HTMLElement} Retractable, full-width track mixer. */
export function createMultitrackTrackMixer(track) {
	const details = document.createElement('details');
	details.className = 'multitrack-track-mixer';
	details.open = expandedTrackIds.has(track.id);
	const summary = document.createElement('summary');
	summary.textContent = `🎚 ${track.name} · mixer / actions`;
	details.addEventListener('toggle', () => {
		if (details.open) expandedTrackIds.add(track.id);
		else expandedTrackIds.delete(track.id);
	});
	const controls = document.createElement('div');
	controls.className = 'multitrack-mixer-controls';
	for (const [action, label, active, description] of [
		['mute', 'Mute', track.muted, 'Mute this track'],
		['solo', 'Solo', track.solo, 'Solo this track'],
		['duplicate-track', 'Copy track', false, 'Duplicate track'],
		['normalize-track', 'Normalize', false, 'Normalize track volume'],
		['delete-track', 'Delete track', false, 'Remove this track']
	]) {
		controls.appendChild(createSwitch(action, label, active, description));
	}
	controls.append(createRange('gain', 'Gain', track.gain, 0, 2));
	controls.append(createRange('pan', 'Pan', track.pan, -1, 1));
	controls.append(createSoundColor(track));
	details.append(summary, controls);
	return details;
}

/** @returns {HTMLElement} Track action button. */
function createSwitch(action, text, active, description) {
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.trackControl = action;
	button.textContent = text;
	button.className = `multitrack-track-switch ${active ? 'multitrack-track-switch-active' : ''}`;
	button.setAttribute('aria-label', description);
	return button;
}

/** @returns {HTMLElement} Gain/pan slider with readable label. */
function createRange(action, title, value, minimum, maximum) {
	const label = document.createElement('label');
	label.className = 'multitrack-track-range';
	const text = document.createElement('span');
	text.textContent = title;
	const input = document.createElement('input');
	input.type = 'range';
	input.min = String(minimum);
	input.max = String(maximum);
	input.step = '0.05';
	input.value = String(value);
	input.dataset.trackControl = action;
	label.append(text, input);
	return label;
}

/** @param {Object} track - Track. @returns {HTMLElement} Instrument color selector. */
function createSoundColor(track) {
	const label = document.createElement('label');
	label.className = 'multitrack-track-range';
	const text = document.createElement('span');
	text.textContent = 'Sound color';
	const select = document.createElement('select');
	select.dataset.trackControl = 'instrument-color';
	select.setAttribute('aria-label', `${track.name} sound color`);
	for (const tone of MULTITRACK_TONES) {
		const option = document.createElement('option');
		option.value = tone.id;
		option.textContent = tone.name;
		select.appendChild(option);
	}
	select.value = track.instrumentColor || 'original';
	label.append(text, select);
	return label;
}
