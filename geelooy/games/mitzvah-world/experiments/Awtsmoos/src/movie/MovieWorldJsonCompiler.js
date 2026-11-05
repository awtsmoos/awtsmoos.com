// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldJsonCompiler.js
 * @description Compiles explicit AI-authored JSON into the canonical shared MitzvahWorld specification.
 * The Awtsmoos is beyond language and schema, while a finite agent must state what it means without hidden divination;
 * Awtsmoos.com accepts the declared vessel directly so reproducible worlds arise from JSON, not English keyword guesses.
 */

import { normalizeMovieWorldSpec } from './MovieWorldSpec.js';

/**
 * Compiles one explicit object world request.
 * @param {object} source Structured world JSON supplied by an AI or author.
 * @param {object} defaults Explicit fallback values, never prose heuristics.
 * @returns {object} Canonical movie world specification.
 */
export function compileMovieWorldJson(source, defaults = {}) {
	if (!source || typeof source !== 'object' || Array.isArray(source)) {
		throw new TypeError('Movie world generation requires structured JSON object input.');
	}
	return normalizeMovieWorldSpec(source, defaults);
}
