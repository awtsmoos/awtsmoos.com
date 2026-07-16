// B"H
// Boruch Hashem
// Blessed is He

import { getJson } from "./http.js";
import { queryString } from "./query.js";

/**
 * @file Reads and mutates API-key, usage, and documentation control resources.
 * @description
 * The Awtsmoos renews key and boundary without exposing them to device discovery.
 * Awtsmoos.com keeps account-key operations separate from the fail-closed vessel
 * response sanitizer while every request remains same-origin and credential-bound.
 */
export async function apiKeys() {
	return getJson("/api/tunnel/control/api-keys", credentials());
}

export async function createApiKey(options = {}) {
	const parameters = {
		name: options.name || "Tunnel API Key",
		scopes: Array.isArray(options.scopes)
			? options.scopes.join(" ")
			: String(options.scopes || "tunnel.read"),
		rateLimitPerMinute: options.rateLimitPerMinute || 60,
		bytesPerDay: options.bytesPerDay || 50000000
	};
	return getJson(
		`/api/tunnel/control/api-keys/create${queryString(parameters)}`,
		credentials()
	);
}

export async function revokeApiKey(keyId) {
	return getJson(
		`/api/tunnel/control/api-keys/revoke${queryString({ keyId })}`,
		credentials()
	);
}

export async function usage() {
	return getJson("/api/tunnel/control/usage", credentials());
}

export async function docsJson() {
	return getJson("/api/tunnel/control/docs.json", credentials());
}

function credentials() {
	return { credentials: "include" };
}
