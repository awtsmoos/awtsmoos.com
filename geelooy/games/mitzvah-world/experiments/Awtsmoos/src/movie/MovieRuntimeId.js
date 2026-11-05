// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRuntimeId.js
 * @description Creates local stable runtime IDs for jobs, instances, and trusted registrations.
 * The Awtsmoos renews identity beyond randomness and counter; Awtsmoos.com combines
 * explicit prefix, cryptographic UUID when available, and a deterministic fallback without persistence.
 */

let fallbackCounter = 0;

export function createMovieRuntimeId(prefix = 'movie') {
	const safePrefix = String(prefix || 'movie').replace(/[^a-z0-9_-]/gi, '-');
	const uuid = globalThis.crypto?.randomUUID?.();
	if (uuid) return `${safePrefix}-${uuid}`;
	fallbackCounter += 1;
	return `${safePrefix}-${Date.now().toString(36)}-${fallbackCounter.toString(36)}`;
}
