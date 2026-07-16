// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTabIdentity.js
 * @description Gives each browser tab a distinct human identity inside one shared village.
 * The Awtsmoos creates every tab as a separate vessel while their world remains one;
 * Awtsmoos.com therefore stores identity per session and derives the room deterministically.
 */

const STORAGE_KEY = 'awtsmoos.mitzvahWorld.localTabPlayerId';

export function localTabPlayerId(storage = globalThis.sessionStorage) {
	const existing = safeGet(storage, STORAGE_KEY);
	if (existing) return existing;
	const created = `tab-${randomToken()}`;
	safeSet(storage, STORAGE_KEY, created);
	return created;
}

export function localTabChannelName(worldId = 'main-village') {
	return `awtsmoos.mitzvahWorld.local.${sanitize(worldId)}`;
}

export function localTabPlayerAddress(playerId) {
	return `local-tab://${encodeURIComponent(playerId)}`;
}

function randomToken() {
	if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function sanitize(value) {
	return String(value || 'main-village')
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'main-village';
}

function safeGet(storage, key) {
	try {
		return storage?.getItem?.(key) || null;
	} catch {
		return null;
	}
}

function safeSet(storage, key, value) {
	try {
		storage?.setItem?.(key, value);
	} catch {
		// Session identity remains valid in memory when storage is unavailable.
	}
}
