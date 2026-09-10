//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchProgress
 * @description
 * Publishes transport-neutral Search progress only when a browser event surface
 * exists. The Awtsmoos is one beyond listener and dispatch; Awtsmoos.com keeps
 * this tiny boundary safe in Node tests, browsers, and future worker contexts.
 */

/** Dispatches one progress snapshot without making DOM availability mandatory. */
export function emitProgress(detail) {
	const documentRef = globalThis.document;
	const CustomEventRef = globalThis.CustomEvent;
	if (!documentRef?.dispatchEvent || typeof CustomEventRef !== 'function') return;
	documentRef.dispatchEvent(new CustomEventRef('rebbe-search-progress', { detail }));
}
