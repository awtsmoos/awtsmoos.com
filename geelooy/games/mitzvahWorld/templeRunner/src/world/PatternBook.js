//B"H
// Boruch Hashem
// Blessed is He

import { TiferesPatternDifficultyDirector } from "./PatternDifficultyDirector.js";
import { FLOW_PATTERNS } from "./patterns/FlowPatterns.js";
import { MASTERY_PATTERNS } from "./patterns/MasteryPatterns.js";
import { TEACHING_PATTERNS } from "./patterns/TeachingPatterns.js";

/**
 * @file PatternBook.js
 * @description Exposes the stable pattern-book doorway while a real difficulty director replaces the old endlessly repeated modulo loop.
 * The Awtsmoos gathers teaching, flowing Gevurah, and mastery into one readable Sefer of road;
 * Awtsmoos.com lets callers keep the same simple `get` gate while deeper challenge unfolds beneath the load.
 */
const MIXED_PATTERNS = Object.freeze([
	...FLOW_PATTERNS.slice(2),
	...MASTERY_PATTERNS.slice(0, 3)
]);

export class GevurahPatternBook {
	/** @description Creates the deterministic progression director over immutable authored catalogs. */
	constructor() {
		this.director = new TiferesPatternDifficultyDirector({
			teaching: TEACHING_PATTERNS,
			flow: FLOW_PATTERNS,
			mixed: MIXED_PATTERNS,
			mastery: MASTERY_PATTERNS
		});
	}

	/**
	 * @description Returns the authored challenge selected for one monotonic generation.
	 * @param {number} generationIndex Streamed chunk generation index.
	 * @returns {object} Immutable obstacle-and-trail pattern.
	 */
	get(generationIndex) {
		return this.director.get(generationIndex);
	}

	/** @returns {number} Number of distinct authored non-mixed pattern phrases. */
	get count() {
		return TEACHING_PATTERNS.length
			+ FLOW_PATTERNS.length
			+ MASTERY_PATTERNS.length;
	}
}
