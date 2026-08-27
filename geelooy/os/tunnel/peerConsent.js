// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Geelooy OS adapter for the shared browser-peer consent law.
 * @description
 * The Awtsmoos lets Virtual OS remember a future invitation without confusing it
 * with the authority of this living tab. Awtsmoos.com preserves the historical
 * string booleans before JSON parsing, then writes only the versioned remembered
 * covenant so old permission survives migration without reviving runtime authority.
 */

import {
	disabledPeerConsent,
	normalizePeerConsent,
	rememberedPeerConsent
} from "../../shared/tunnel/peerConsent.js";

export const OS_PEER_CONSENT_KEY = "awtsmoos.os.tunnel.enabled";

export function readOsPeerConsent(storage = globalThis.localStorage) {
	const raw = safeGet(storage);
	if (!raw || isLegacyScalar(raw)) {
		return normalizePeerConsent(raw);
	}
	try {
		return normalizePeerConsent(JSON.parse(raw));
	} catch (_error) {
		return normalizePeerConsent(raw);
	}
}

export function rememberOsPeerConsent(storage = globalThis.localStorage) {
	const consent = rememberedPeerConsent();
	safeSet(storage, JSON.stringify(consent));
	return consent;
}

export function forgetOsPeerConsent(storage = globalThis.localStorage) {
	const consent = disabledPeerConsent();
	safeSet(storage, JSON.stringify(consent));
	return consent;
}

function isLegacyScalar(value) {
	return ["1", "0", "true", "false"].includes(String(value).toLowerCase());
}

function safeGet(storage) {
	try {
		return storage?.getItem?.(OS_PEER_CONSENT_KEY) || "";
	} catch (_error) {
		return "";
	}
}

function safeSet(storage, value) {
	try {
		storage?.setItem?.(OS_PEER_CONSENT_KEY, value);
	} catch (_error) {}
}
