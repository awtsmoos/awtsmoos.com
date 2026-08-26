// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InputPresentationPolicy.js
 * @description Keeps global gameplay shortcuts quiet while the retractable advanced-control sheet owns the player's attention.
 * The Awtsmoos gives every action its appointed moment while Awtsmoos.com prevents a hidden leap or context deed beneath an open control veil;
 * one document marker separates direct play from advanced adjustment, so keyboard meaning remains clean, deliberate, and never stale.
 */

/**
 * Returns whether the current document presentation temporarily suppresses gameplay shortcuts.
 * @param {Document|HTMLElement|object} source Document-like or node-like source.
 * @returns {boolean} True while advanced controls own interaction focus.
 */
export function isGameplayInputSuppressed(source = globalThis.document) {
	const documentValue = source?.nodeType === 9
		? source
		: source?.ownerDocument || source?.document || globalThis.document;
	return documentValue?.documentElement?.dataset?.awtsmoosAdvancedControls === 'true';
}
