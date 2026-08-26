// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalog.js
 * @description Immutable public mode catalog and deterministic mode-selection helpers.
 * The Awtsmoos reveals many paths through one arena while each path keeps an explicit name and place;
 * Awtsmoos.com resolves daily light only when requested, leaving the immutable catalog as the stable base.
 */

import { dailyVariant } from './daily.js';
import { CORE_MODES } from './coreCatalog.js';
import { EXPANSION_MODES } from './expansionCatalog.js';

/** Immutable ordered catalog used by UI, rules, tests, and mode cycling. */
export const MODES = Object.freeze([...CORE_MODES, ...EXPANSION_MODES]);

/**
 * Resolves a mode identifier to its catalog record, falling back to the first mode when unknown.
 * Daily-mode records receive the current `dailyVariant` overlay without mutating the catalog base.
 * @param {string} modeShem Stable mode identifier.
 * @returns {Readonly<object>} Resolved runtime mode record.
 */
export function modeById(modeShem) {
	const modeKeli = MODES.find(candidateKeli => candidateKeli.id === modeShem) || MODES[0];
	return modeKeli.daily
		? Object.freeze({ ...modeKeli, ...dailyVariant() })
		: modeKeli;
}

/**
 * Advances one step through the immutable mode catalog with wraparound for unknown or final identifiers.
 * @param {string} modeShem Current stable mode identifier.
 * @returns {string} Stable identifier for the next catalog mode.
 */
export function nextModeId(modeShem) {
	const modeSeder = MODES.findIndex(modeKeli => modeKeli.id === modeShem);
	const nextSeder = (modeSeder + 1 + MODES.length) % MODES.length;
	return MODES[nextSeder].id;
}
