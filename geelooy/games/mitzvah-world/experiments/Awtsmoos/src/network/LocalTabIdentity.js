// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabIdentity.js
	* @description Gives every live browser tab one identity without sharing it across duplicated tabs.
	* The Awtsmoos creates every browser vessel separately; Awtsmoos.com therefore keeps the live
	* identity on the Window itself and uses session storage only as a diagnostic breadcrumb.
	*/

const STORAGE_KEY = 'awtsmoos.mitzvahWorld.localTabPlayerId';
const IDENTITY_PROPERTY = Symbol.for('awtsmoos.mitzvahWorld.liveTabPlayerId');

export function localTabPlayerId(storage = null, scope = globalThis) {
	const liveIdentity = safeScopeValue(scope);
	if (liveIdentity) return liveIdentity;
	const created = `tab-${randomToken(scope)}`;
	rememberOnScope(scope, created);
	safeSet(storage || safeSessionStorage(scope), STORAGE_KEY, created);
	return created;
}

export function localTabChannelName(worldId = 'main-village') {
	return `awtsmoos.mitzvahWorld.local.${sanitize(worldId)}`;
}

export function localTabPlayerAddress(playerId) {
	return `local-tab://${encodeURIComponent(playerId)}`;
}

function randomToken(scope) {
	if (scope?.crypto?.randomUUID) return scope.crypto.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function rememberOnScope(scope, value) {
	try {
		Object.defineProperty(scope, IDENTITY_PROPERTY, {
			configurable: false,
			enumerable: false,
			value,
			writable: false
		});
	} catch {
		// A supplied frozen scope still receives a unique identity for this call.
	}
}

function safeScopeValue(scope) {
	try {
		return typeof scope?.[IDENTITY_PROPERTY] === 'string'
			? scope[IDENTITY_PROPERTY]
			: null;
	} catch {
		return null;
	}
}

function safeSessionStorage(scope) {
	try {
		return scope?.sessionStorage || null;
	} catch {
		return null;
	}
}

function sanitize(value) {
	return String(value || 'main-village')
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'main-village';
}

function safeSet(storage, key, value) {
	try {
		storage?.setItem?.(key, value);
	} catch {
		// Identity remains valid on the live Window when storage is unavailable.
	}
}
