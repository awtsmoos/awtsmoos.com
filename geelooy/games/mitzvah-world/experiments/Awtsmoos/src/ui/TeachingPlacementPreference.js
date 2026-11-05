// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TeachingPlacementPreference.js
 * @description Persists whether active Shlichus guidance lives beside the world or only in its book.
 * The Awtsmoos gives learning a chosen vessel rather than an imposed obstruction;
 * Awtsmoos.com remembers whether counsel accompanies the road or waits quietly in the parchment.
 */

export const TEACHING_PLACEMENTS = Object.freeze({
	BOOK_ONLY: 'book-only',
	SIDE: 'side'
});

const STORAGE_KEY = 'AwtsmoosMitzvahWorldTeachingPlacement';

export class TeachingPlacementPreference {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
		this.value = normalizeTeachingPlacement(readStorage(storage));
		this.listeners = new Set();
	}

	set(value) {
		const next = normalizeTeachingPlacement(value);
		if (next === this.value) {
			return this.value;
		}
		this.value = next;
		writeStorage(this.storage, next);
		for (const listener of this.listeners) {
			listener(next);
		}
		return next;
	}

	toggle() {
		return this.set(
			this.value === TEACHING_PLACEMENTS.SIDE
				? TEACHING_PLACEMENTS.BOOK_ONLY
				: TEACHING_PLACEMENTS.SIDE
		);
	}

	onChange(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	snapshot() {
		return this.value;
	}
}

export function normalizeTeachingPlacement(value) {
	return value === TEACHING_PLACEMENTS.BOOK_ONLY
		? TEACHING_PLACEMENTS.BOOK_ONLY
		: TEACHING_PLACEMENTS.SIDE;
}

function readStorage(storage) {
	try {
		return storage?.getItem?.(STORAGE_KEY);
	} catch {
		return null;
	}
}

function writeStorage(storage, value) {
	try {
		storage?.setItem?.(STORAGE_KEY, value);
	} catch {
		// Storage denial must never block gameplay or teaching access.
	}
}
