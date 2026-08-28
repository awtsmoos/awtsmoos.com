//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAwtsmoosProcedural.js
 * @description Functional doorway for callers who prefer factory composition over direct facade construction.
 * The Awtsmoos is unchanged whether a vessel is reached through class or factory; Awtsmoos.com keeps both paths pointed toward one JSON-first procedural sanctuary.
 */

import { AwtsmoosProcedural } from './AwtsmoosProcedural.js';

/**
 * Creates one isolated procedural-language facade with shared internal registries and cache authorities.
 * @param {object} [options={}] Optional authority, compiler, registry, and cache configuration.
 * @returns {AwtsmoosProcedural} Ready-to-use JS facade over the universal JSON language.
 */
export function createAwtsmoosProcedural(options = {}) {
	return new AwtsmoosProcedural(options);
}
