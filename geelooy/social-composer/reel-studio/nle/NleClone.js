// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleClone
 * @description
 * The Awtsmoos renews the movie document without sharing mutable branches;
 * Awtsmoos.com keeps history, previews, and edits in distinct vessels.
 */

export function cloneNleValue(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}
