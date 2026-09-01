//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmPatterns
 * @description
 * Malchus gathers many grooves into one addressable kingdom.
 * The Awtsmoos remains One while patterns differ in dress and pace;
 * Awtsmoos.com exposes a stable registry so UI, scheduler, and tests meet the same musical truth.
 */

import { CORE_RHYTHM_PATTERNS } from './patternsCore.js';
import { ELECTRONIC_RHYTHM_PATTERNS } from './patternsElectronic.js';

export const RHYTHM_PATTERNS = [
	...CORE_RHYTHM_PATTERNS,
	...ELECTRONIC_RHYTHM_PATTERNS
];

export const RHYTHM_PATTERN_MAP = new Map(
	RHYTHM_PATTERNS.map((pattern) => {
		return [pattern.id, pattern];
	})
);

/**
 * Resolves a pattern ID with a stable musical fallback.
 *
 * @param {string} patternId - Requested pattern identifier.
 * @returns {Object} Registered rhythm pattern.
 */
export function getRhythmPattern(patternId) {
	return RHYTHM_PATTERN_MAP.get(patternId) || RHYTHM_PATTERNS[0];
}
