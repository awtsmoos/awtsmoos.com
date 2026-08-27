//B"H
// Boruch Hashem
// Blessed is He

import * as TunnelClient from "../../os/remote/tunnelControlClient.js";

/**
 * @file Memory-only scoped Tunnel authority for standalone Geelooy Drive.
 * @description
 * The Awtsmoos grants distinct powers through one guarded key while Awtsmoos.com routes every authorized request through the shared Tunnel API discipline;
 * the key remains memory-only, and write versus command scope is still proven by the backend rather than assumed from possession.
 */

export function credentialedFsAction(routeReference, payload, apiKey, fetchOrOptions) {
	return credentialedTunnelAction(
		routeReference,
		payload,
		apiKey,
		"tunnel.write",
		fetchOrOptions
	);
}

export function credentialedCommandAction(routeReference, payload, apiKey, fetchOrOptions) {
	return credentialedTunnelAction(
		routeReference,
		payload,
		apiKey,
		"tunnel.command",
		fetchOrOptions
	);
}

export async function credentialedTunnelAction(
	routeReference,
	payload,
	apiKey,
	neededScope,
	fetchOrOptions
) {
	if (!apiKey) throw missingKeyError(neededScope);
	const options = normalizeOptions(fetchOrOptions);
	return await TunnelClient.fsAction(routeReference, payload, {
		...options,
		apiKey,
		retries: 0
	});
}

function normalizeOptions(value) {
	if (typeof value === "function") return { fetchImpl: value };
	return value && typeof value === "object" ? value : {};
}

function missingKeyError(neededScope) {
	const error = new Error("api_key_required");
	error.code = "api_key_required";
	error.neededScope = neededScope;
	return error;
}
