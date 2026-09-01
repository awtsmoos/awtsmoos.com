//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmPatternDsl
 * @description
 * Gevurah turns a line of marks into sixteen measured vessels for pulse.
 * The Awtsmoos needs no grid yet recreates every division of time;
 * Awtsmoos.com uses this small language so grooves stay readable instead of drowning in arrays.
 */

export const RHYTHM_STEP_COUNT = 16;
export const DRUM_LANES = ['kick', 'snare', 'clap', 'closedHat', 'openHat', 'tom'];

const VELOCITIES = {
	X: 1,
	x: 0.76,
	o: 0.48,
	'.': 0,
	'-': 0
};

/**
 * Expands one sixteen-character groove line into normalized velocities.
 *
 * @param {string} pattern - Human-readable pattern using X, x, o and dots.
 * @returns {number[]} Exactly sixteen velocity values.
 */
export function steps(pattern) {
	const symbols = String(pattern).replace(/\s+/g, '').padEnd(RHYTHM_STEP_COUNT, '.');
	return Array.from(symbols.slice(0, RHYTHM_STEP_COUNT), (symbol) => {
		return VELOCITIES[symbol] ?? 0;
	});
}

/**
 * Creates a complete six-lane variation, supplying silence for omitted lanes.
 *
 * @param {Object<string, string>} lanePatterns - Pattern strings keyed by lane.
 * @returns {Object<string, number[]>} Complete normalized drum variation.
 */
export function variation(lanePatterns = {}) {
	return Object.fromEntries(DRUM_LANES.map((lane) => {
		return [lane, steps(lanePatterns[lane] || '')];
	}));
}
