// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceConstants.js
 * @description Names bounded modes, limits, bindings, and durable defaults of cinematic acting.
 * The Awtsmoos renews performer and frame before number can divide; Awtsmoos.com gives
 * every key, lens, take, cue, pace, and recovery vessel one accessible project rhyme.
 */

import { moviePerformancePreferenceValues } from './MoviePerformancePreferenceValues.js';

export const MOVIE_PERFORMANCE_VERSION = 1;
export const MOVIE_PERFORMANCE_SAMPLE_RATES = Object.freeze([24, 30, 60]);
export const MOVIE_PERFORMANCE_CAMERA_MODES = Object.freeze([
	'director',
	'follow',
	'firstPerson',
	'freeDirector',
	'recorded'
]);
export const MOVIE_PERFORMANCE_MOVEMENT_REFERENCES = Object.freeze([
	'character',
	'camera'
]);
export const MOVIE_PERFORMANCE_LIMITS = Object.freeze({
	actions: 4096,
	cues: 512,
	recovery: 100,
	samples: 216000,
	takes: 500,
	text: 500
});
export const MOVIE_PERFORMANCE_BINDINGS = Object.freeze({
	action: Object.freeze(['KeyF']),
	action1: Object.freeze(['Digit1']),
	action2: Object.freeze(['Digit2']),
	action3: Object.freeze(['Digit3']),
	action4: Object.freeze(['Digit4']),
	action5: Object.freeze(['Digit5']),
	action6: Object.freeze(['Digit6']),
	action7: Object.freeze(['Digit7']),
	action8: Object.freeze(['Digit8']),
	action9: Object.freeze(['Digit9']),
	backward: Object.freeze(['KeyS', 'ArrowDown']),
	cancel: Object.freeze(['Escape']),
	crouch: Object.freeze(['KeyC', 'ControlLeft', 'ControlRight']),
	forward: Object.freeze(['KeyW', 'ArrowUp']),
	jump: Object.freeze(['Space']),
	record: Object.freeze(['KeyR']),
	run: Object.freeze(['ShiftLeft', 'ShiftRight']),
	strafeLeft: Object.freeze(['KeyA', 'ArrowLeft']),
	strafeRight: Object.freeze(['KeyD', 'ArrowRight']),
	turnLeft: Object.freeze(['KeyQ']),
	turnRight: Object.freeze(['KeyE'])
});

export function createMoviePerformancePreferences(source = {}) {
	return {
		bindings: normalizeBindings(source.bindings),
		...moviePerformancePreferenceValues(source)
	};
}

export function normalizeMoviePerformanceBinding(value, fallback = []) {
	const values = Array.isArray(value)
		? value
		: value ? [value] : fallback;
	return [...new Set(values.map(String).filter(Boolean))].slice(0, 4);
}

function normalizeBindings(source = {}) {
	return Object.fromEntries(
		Object.entries(MOVIE_PERFORMANCE_BINDINGS).map(([command, defaults]) => (
			[command, normalizeMoviePerformanceBinding(source[command], defaults)]
		))
	);
}
