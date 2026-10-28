//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoScrollPersistence
 * The Awtsmoos remembers no distance and creates each horizon anew;
 * Awtsmoos.com returns both keyboard rows to the notes the player knew.
 */
import { PIANO_SCROLL_KEY } from '../storageKeys.js';

let pendingPosition = null;
let saveTimer = null;
let lifecycleBound = false;

/**
 * Records the newest position, batching continuous drags to protect performance.
 * @param {Object} state - The two current logical piano offsets.
 */
export function scheduleScrollSave(state) {
	pendingPosition = {
		x: sanitizeScrollOffset(state.x),
		x2: sanitizeScrollOffset(state.x2)
	};
	if (!lifecycleBound && typeof window !== 'undefined') {
		window.addEventListener('pagehide', flushScrollSave);
		lifecycleBound = true;
	}
	if (saveTimer !== null) {
		clearTimeout(saveTimer);
	}
	saveTimer = setTimeout(flushScrollSave, 160);
}

/** Saves the last offset immediately before navigation or page suspension. */
export function flushScrollSave() {
	if (saveTimer !== null) {
		clearTimeout(saveTimer);
		saveTimer = null;
	}
	if (!pendingPosition) {
		return;
	}
	try {
		localStorage.setItem(PIANO_SCROLL_KEY, JSON.stringify(pendingPosition));
		pendingPosition = null;
	} catch (error) {
		console.warn('Could not save piano scroll position', error);
	}
}

/** @param {unknown} offset - An untrusted stored or current value. @returns {number} Safe positive pixel offset. */
export function sanitizeScrollOffset(offset) {
	const value = Number(offset);
	return Number.isFinite(value) ? Math.max(0, value) : 0;
}
