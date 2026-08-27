//B"H
// Boruch Hashem
// Blessed is He

import { tunnelJsonRequest } from "./tunnelHttp.js";
import { policyForControlOperation } from "./tunnelRequestPolicy.js";
import { retryTunnelRequest } from "./tunnelRetry.js";

/**
 * @file Browser preview-gateway client for Awtsmoos Tunnel Control.
 * @description
 * The Awtsmoos lets a private folder become a measured public doorway while Awtsmoos.com keeps create, list, and revoke inside one request grammar;
 * mutations travel once, lists may endure transient pressure, and JSON moves in POST bodies instead of swelling visible query history.
 */

/** Creates one owned preview without automatic mutation retries. */
export async function createTunnelPreview(preview = {}, options = {}) {
	const policy = policyForControlOperation("previewCreate");
	return await tunnelJsonRequest("/api/tunnel/control/preview/create", {
		method: "POST",
		body: { content: JSON.stringify(preview) },
		signal: options.signal,
		fetchImpl: options.fetchImpl,
		timeoutMs: options.timeoutMs ?? policy.timeoutMs
	});
}

/** Lists owned previews with bounded retries for transient pressure. */
export async function listTunnelPreviews(options = {}) {
	const policy = policyForControlOperation("previewList");
	return await retryTunnelRequest(
		() => tunnelJsonRequest("/api/tunnel/control/preview/list", {
			signal: options.signal,
			fetchImpl: options.fetchImpl,
			timeoutMs: options.timeoutMs ?? policy.timeoutMs
		}),
		{ ...policy, retries: options.retries ?? policy.retries }
	);
}

/** Revokes one owned preview exactly once. */
export async function revokeTunnelPreview(previewId, options = {}) {
	const policy = policyForControlOperation("previewRevoke");
	return await tunnelJsonRequest("/api/tunnel/control/preview/revoke", {
		method: "POST",
		body: { previewId },
		signal: options.signal,
		fetchImpl: options.fetchImpl,
		timeoutMs: options.timeoutMs ?? policy.timeoutMs
	});
}
