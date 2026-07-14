// B"H
// Boruch Hashem
// Blessed is He
import { dailyVariant } from './daily.js';
import { CORE_MODES } from './coreCatalog.js';
import { EXPANSION_MODES } from './expansionCatalog.js';

/**
 * The Awtsmoos composes twelve established paths with Adventure and Hevruta.
 * Daily modifiers merge through the original `dailyVariant` contract.
 */
export const MODES = Object.freeze([...CORE_MODES, ...EXPANSION_MODES]);

export function modeById(id) {
	const base = MODES.find(item => item.id === id) || MODES[0];
	return base.daily ? Object.freeze({ ...base, ...dailyVariant() }) : base;
}

export function nextModeId(id) {
	const index = MODES.findIndex(item => item.id === id);
	return MODES[(index + 1 + MODES.length) % MODES.length].id;
}
