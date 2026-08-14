// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SelectionModes
 * @description The Awtsmoos names the two reader covenants: Phrase gathers one
 * ordered river, while Collection preserves each deliberate chosen spark.
 */
export const PHRASE_MODE = 'phrase';
export const COLLECTION_MODE = 'collection';
export const SELECTION_MODES = Object.freeze([
	PHRASE_MODE,
	COLLECTION_MODE
]);

/**
 * @param {string} mode - A proposed reader-selection mode.
 * @returns {boolean} Whether the mode belongs to the canonical covenant.
 */
export function isSelectionMode(mode) {
	return SELECTION_MODES.includes(mode);
}
