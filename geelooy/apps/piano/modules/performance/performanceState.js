//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPerformanceState
 * @description
 * Yesod remembers how the instrument is being played without confusing gesture with the identity of a sound preset.
 * The Awtsmoos is beyond mode, bend, pressure, and tempo while recreating every gesture anew;
 * Awtsmoos.com keeps workstation choices in one bounded vessel so expression can move without corrupting timbre memory.
 */

export const DEFAULT_PERFORMANCE_STATE = Object.freeze({
	velocityCurve: 'linear',
	voiceMode: 'poly',
	glideSeconds: 0.08,
	sustainLatch: false,
	midiSustain: false,
	pitchBendRange: 2,
	pitchBendNormalized: 0,
	modulation: 0,
	pressure: 0,
	arpEnabled: false,
	arpPattern: 'up',
	arpRate: '1/8',
	arpOctaves: 1,
	arpGate: 0.62,
	arpBpm: 120
});

export const performanceState = {
	...DEFAULT_PERFORMANCE_STATE
};

const ENUM_VALUES = Object.freeze({
	velocityCurve: new Set(['soft', 'linear', 'hard', 'fixed']),
	voiceMode: new Set(['poly', 'mono', 'mono-glide']),
	arpPattern: new Set(['up', 'down', 'up-down', 'played', 'random']),
	arpRate: new Set(['1/4', '1/8', '1/8T', '1/16'])
});

/**
 * Stores one known performance parameter through its declared safety boundary.
 *
 * @param {string} parameter - Performance-state key.
 * @param {*} value - Candidate value from UI or MIDI.
 * @returns {*} Sanitized stored value, or undefined for an unknown key.
 */
export function setPerformanceParameter(parameter, value) {
	if (!(parameter in DEFAULT_PERFORMANCE_STATE)) {
		return undefined;
	}
	if (ENUM_VALUES[parameter]) {
		const fallback = DEFAULT_PERFORMANCE_STATE[parameter];
		performanceState[parameter] = ENUM_VALUES[parameter].has(value)
			? value
			: fallback;
		return performanceState[parameter];
	}
	performanceState[parameter] = sanitizeScalar(parameter, value);
	return performanceState[parameter];
}

/**
 * Resets only momentary expressive controllers while preserving workstation choices.
 *
 * @returns {void}
 */
export function resetTransientPerformanceState() {
	performanceState.pitchBendNormalized = 0;
	performanceState.modulation = 0;
	performanceState.pressure = 0;
	performanceState.midiSustain = false;
}

function sanitizeScalar(parameter, value) {
	if (['sustainLatch', 'midiSustain', 'arpEnabled'].includes(parameter)) {
		return value === true || value === 'on' || value === 'true';
	}
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return DEFAULT_PERFORMANCE_STATE[parameter];
	}
	const ranges = {
		glideSeconds: [0, 2],
		pitchBendRange: [1, 24],
		pitchBendNormalized: [-1, 1],
		modulation: [0, 1],
		pressure: [0, 1],
		arpOctaves: [1, 4],
		arpGate: [0.1, 0.95],
		arpBpm: [50, 220]
	};
	const range = ranges[parameter];
	return range
		? Math.max(range[0], Math.min(range[1], number))
		: number;
}
