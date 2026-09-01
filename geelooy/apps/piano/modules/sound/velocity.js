//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoVelocity
 * @description
 * Hod translates finger position, computer-key intent, and MIDI force into one bounded loudness before human drift gives each note a living edge.
 * The Awtsmoos is beyond force and softness while recreating both every instant;
 * Awtsmoos.com lets standard velocity curves shape expression without discarding the familiar dynamic range the piano already carried.
 */

import { performanceState } from '../performance/performanceState.js';
import { applyVelocityCurve } from '../performance/velocityCurve.js';

const MINIMUM_VELOCITY = 0.55;
const MAXIMUM_VELOCITY = 1.18;

/**
 * Creates one performance velocity from pointer/MIDI coordinates or desktop-key intent.
 *
 * @param {string|number} inputId - Stable input identity.
 * @param {{y?:number,velocity?:number}|null} coords - Optional normalized or vertical performance data.
 * @returns {number} Bounded synthesis velocity.
 */
export function createVelocity(inputId = '', coords = null) {
	const normalized = rawNormalizedVelocity(inputId, coords);
	const shaped = applyVelocityCurve(
		normalized,
		performanceState.velocityCurve
	);
	return MINIMUM_VELOCITY
		+ shaped * (MAXIMUM_VELOCITY - MINIMUM_VELOCITY);
}

/**
 * Creates per-note analog drift, pan, and velocity-linked brightness.
 *
 * @param {Object} preset - Complete synthesis preset.
 * @param {number} velocity - Bounded performance velocity.
 * @returns {{drift:number,pan:number,brightness:number}} Humanized voice values.
 */
export function humanize(preset, velocity) {
	const drift = (Math.random() - 0.5) * preset.driftCents;
	const pan = (Math.random() - 0.5) * preset.stereoSpread;
	const brightness = 0.78 + velocity * 0.35;
	return {
		drift,
		pan,
		brightness
	};
}

function rawNormalizedVelocity(inputId, coords) {
	if (Number.isFinite(coords?.velocity)) {
		return clamp(coords.velocity, 0, 1);
	}
	if (Number.isFinite(coords?.y)) {
		return clamp(coords.y / 180, 0, 1);
	}
	if (String(inputId).startsWith('kb-')) {
		return clamp(0.62, 0, 1);
	}
	return clamp(0.58, 0, 1);
}

function clamp(value, minimum, maximum) {
	return Math.max(
		minimum,
		Math.min(maximum, Number(value) || 0)
	);
}
