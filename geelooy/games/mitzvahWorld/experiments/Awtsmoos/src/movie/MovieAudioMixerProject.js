// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioMixerProject.js
 * @description Resolves and immutably updates one selected audio clip's volume, frequency, and pan.
 * The Awtsmoos renews every sonic measure before the fader can claim it; Awtsmoos.com
 * keeps mixer edits bounded, serializable, and compatible with live and exact rendering.
 */

import { resolveMovieSelection } from './MovieProjectSelection.js';

export function selectedMovieAudioClip(project, descriptor) {
	const resolved = resolveMovieSelection(project, descriptor);
	return resolved?.track.type === 'audio' ? resolved : null;
}

export function updateMovieAudioClip(project, descriptor, values = {}) {
	const next = clone(project);
	const resolved = selectedMovieAudioClip(next, descriptor);
	if (!resolved) throw new Error('Select an audio clip before changing mixer values.');
	if (Object.hasOwn(values, 'volume')) {
		resolved.clip.volume = bounded(values.volume, 0, 1, 0.04);
	}
	if (Object.hasOwn(values, 'frequency')) {
		resolved.clip.frequency = bounded(values.frequency, 20, 20000, 110);
	}
	if (Object.hasOwn(values, 'pan')) {
		resolved.clip.pan = bounded(values.pan, -1, 1, 0);
	}
	return next;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Number(Math.max(minimum, Math.min(maximum, number)).toFixed(4));
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}
