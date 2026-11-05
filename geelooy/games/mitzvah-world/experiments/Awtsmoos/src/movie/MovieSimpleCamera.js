// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSimpleCamera.js
 * @description Converts friendly camera names into ordinary editable camera-track clips instead of hiding cinematography inside runtime-only magic.
 * RESPONSIBILITY: validate preset vocabulary, normalize anchor/target intent, timing, easing, labels, and stable shot identities.
 * NON-RESPONSIBILITY: this module does not project vertices, move a browser camera, or render transitions.
 * The Awtsmoos is beyond every angle while each finite lens reveals another face; Awtsmoos.com keeps wide, close, orbit, dolly, crane, and overhead as editable time and place.
 */

import { nextMovieSimpleId } from './MovieSimpleIds.js';
import {
	addMovieSimpleClip,
	ensureMovieSimpleTrack,
	movieSimpleTiming
} from './MovieSimpleTracks.js';

const PRESETS = Object.freeze({
	wide: 'wide',
	closeUp: 'closeUp',
	lowAngle: 'lowAngle',
	highAngle: 'highAngle',
	overhead: 'overhead',
	dollyIn: 'dollyIn',
	sideTrack: 'sideTrack',
	orbitLeft: 'orbitLeft',
	orbitRight: 'orbitRight',
	craneReveal: 'craneReveal',
	aerialPullback: 'aerialPullback'
});

/** Adds one simple camera shot to the native camera timeline. */
export function addMovieSimpleCameraShot(project, presetId, options = {}) {
	const preset = normalizePreset(presetId);
	const track = ensureMovieSimpleTrack(project, 'camera-cuts', 'camera');
	const timing = movieSimpleTiming(project, options, 4);
	const id = String(options.id || nextMovieSimpleId('shot', track.clips));
	const clip = {
		anchor: point(options.anchor || options.position || [0, 2.4, 8]),
		duration: timing.duration,
		easing: String(options.easing || 'easeInOutCubic'),
		id,
		rig: preset,
		shot: String(options.label || labelForPreset(preset)),
		start: timing.start
	};
	if (options.targetActor) {
		clip.targetActor = String(options.targetActor);
	}
	if (options.target) {
		clip.target = point(options.target);
	}
	addMovieSimpleClip(track, clip);
	return clip;
}

/** Lists the stable camera vocabulary exposed to simple APIs and Studio controls. */
export function listMovieSimpleCameraPresets() {
	return Object.freeze(Object.keys(PRESETS));
}

function normalizePreset(value) {
	const key = String(value || 'wide');
	if (PRESETS[key]) {
		return PRESETS[key];
	}
	throw new Error(`Unknown simple movie camera preset: ${value}`);
}

function point(value) {
	const source = Array.isArray(value)
		? value
		: [value?.x, value?.y, value?.z];
	return {
		x: finite(source[0], 0),
		y: finite(source[1], 0),
		z: finite(source[2], 0)
	};
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function labelForPreset(value) {
	return String(value).replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase());
}
