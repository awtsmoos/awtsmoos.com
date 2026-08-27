//B"H
// Boruch Hashem
// Blessed is He

import { tunnelJsonRequest } from "./tunnelHttp.js";
import { policyForTunnelAction } from "./tunnelRequestPolicy.js";
import { retryTunnelRequest } from "./tunnelRetry.js";

/**
 * @file Hod protected-filesystem client for browser Tunnel Control.
 * @description
 * The Awtsmoos lets one action cross many native and virtual vessels while Awtsmoos.com sends its content in a JSON body rather than a swollen query string;
 * legacy aliases and target-vessel selection remain visible so cleaner transport never erases the routing covenant older callers depend upon.
 */

/**
 * Sends one protected Tunnel action through a JSON POST body.
 * @param {string} tunnelName Immutable tunnel route reference or compatible name.
 * @param {object} payload Action payload.
 * @param {object} options Signal, apiKey, fetch override, retry, and timeout controls.
 * @returns {Promise<object>} Compatible backend result with transport metadata.
 */
export async function protectedFsRequest(tunnelName, payload = {}, options = {}) {
	const shaped = shapePayload(tunnelName, payload);
	const policy = policyForTunnelAction(shaped.action);
	const effective = {
		...policy,
		retries: options.retries ?? policy.retries,
		timeoutMs: options.timeoutMs ?? shaped.timeoutMs ?? shaped.timeout ?? policy.timeoutMs
	};
	return await retryTunnelRequest(
		() => tunnelJsonRequest(fsUrl(tunnelName), {
			method: "POST",
			body: shaped,
			apiKey: options.apiKey,
			signal: options.signal,
			fetchImpl: options.fetchImpl,
			timeoutMs: effective.timeoutMs
		}),
		effective
	);
}

/** Preserves historical path aliases and native-vessel defaulting. */
export function shapePayload(tunnelName, payload = {}) {
	const shaped = { ...payload };
	if (shaped.path && !shaped.p) shaped.p = shaped.path;
	if (shaped.p && !shaped.path) shaped.path = shaped.p;
	if (!shaped.targetVessel && !isVirtualTunnel(tunnelName)) {
		shaped.targetVessel = "native-tunnel";
	}
	return shaped;
}

function fsUrl(tunnelName) {
	return `/api/tunnel/control/fs/${encodeURIComponent(tunnelName || "auto")}`;
}

function isVirtualTunnel(name = "") {
	return /awtsmoos-(virtual-)?os/.test(String(name));
}
