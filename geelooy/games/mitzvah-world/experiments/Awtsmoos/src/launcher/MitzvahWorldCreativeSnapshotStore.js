// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeSnapshotStore.js
 * @description Persists one validated gameplay capture for the explicit Movie Studio route.
 * The Awtsmoos renews memory without making it eternal; Awtsmoos.com keeps one bounded session
 * vessel, rejects corruption, and reveals exact write, read, and clear receipts to every caller.
 */

import { normalizeMitzvahWorldCreativeSnapshot } from './MitzvahWorldCreativeSnapshot.js';

export const MITZVAH_WORLD_CAPTURE_STORAGE_KEY = 'awtsmoos.mitzvah-world.capture.current';
const MAX_CAPTURE_BYTES = 16384;

export function writeMitzvahWorldCreativeSnapshot(snapshot, storage = globalThis.sessionStorage) {
	const normalized = normalizeMitzvahWorldCreativeSnapshot(snapshot);
	if (!normalized) return receipt(false, 'INVALID_CAPTURE');
	const serialized = JSON.stringify(normalized);
	if (serialized.length > MAX_CAPTURE_BYTES) return receipt(false, 'CAPTURE_TOO_LARGE');
	try {
		storage?.setItem?.(MITZVAH_WORLD_CAPTURE_STORAGE_KEY, serialized);
		return { ...receipt(true, null), snapshot: normalized, bytes: serialized.length };
	} catch (error) {
		return receipt(false, 'STORAGE_WRITE_FAILED', error);
	}
}

export function readMitzvahWorldCreativeSnapshot(storage = globalThis.sessionStorage) {
	try {
		const serialized = storage?.getItem?.(MITZVAH_WORLD_CAPTURE_STORAGE_KEY);
		if (!serialized) return receipt(false, 'CAPTURE_NOT_FOUND');
		if (serialized.length > MAX_CAPTURE_BYTES) return receipt(false, 'CAPTURE_TOO_LARGE');
		const snapshot = normalizeMitzvahWorldCreativeSnapshot(JSON.parse(serialized));
		return snapshot
			? { ...receipt(true, null), snapshot, bytes: serialized.length }
			: receipt(false, 'INVALID_CAPTURE');
	} catch (error) {
		return receipt(false, 'STORAGE_READ_FAILED', error);
	}
}

export function clearMitzvahWorldCreativeSnapshot(storage = globalThis.sessionStorage) {
	try {
		storage?.removeItem?.(MITZVAH_WORLD_CAPTURE_STORAGE_KEY);
		return receipt(true, null);
	} catch (error) {
		return receipt(false, 'STORAGE_CLEAR_FAILED', error);
	}
}

function receipt(ok, code, error = null) {
	return {
		ok,
		code,
		message: error?.message || null
	};
}
