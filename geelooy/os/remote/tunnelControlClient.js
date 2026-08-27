//B"H
// Boruch Hashem
// Blessed is He

import { tunnelJsonRequest } from "./tunnelHttp.js";
import { legacyBrowserFsRequest } from "./tunnelLegacyQuery.js";
import { protectedFsRequest } from "./tunnelPayloadClient.js";
import {
	createTunnelPreview,
	listTunnelPreviews,
	revokeTunnelPreview
} from "./tunnelPreviewClient.js";
import { policyForControlOperation } from "./tunnelRequestPolicy.js";
import { retryTunnelRequest } from "./tunnelRetry.js";

/**
 * @file Stable browser facade for Awtsmoos Tunnel Control.
 * @description
 * The Awtsmoos is one while modern JSON POST and one historical browser-tab garment remain distinct;
 * Awtsmoos.com preserves public imports, automatically isolates legacy transport to its named vessel, and lets every other assistant share the cleaner API foundation.
 */

export async function devices(options = {}) {
	return await controlRead("/api/tunnel/control/devices", "devices", options);
}

export async function myDevice(options = {}) {
	return await controlRead("/api/tunnel/control/my-device", "myDevice", options);
}

export async function fsAction(tunnelName, payload = {}, options = {}) {
	if (payload.targetVessel === "browser-tab") {
		return await legacyBrowserFsRequest(tunnelName, payload, options);
	}
	return await protectedFsRequest(tunnelName, payload, options);
}

export async function previewCreate(preview = {}, options = {}) {
	return await createTunnelPreview(preview, options);
}

export async function previewList(options = {}) {
	return await listTunnelPreviews(options);
}

export async function previewRevoke(previewId, options = {}) {
	return await revokeTunnelPreview(previewId, options);
}

async function controlRead(url, operation, options) {
	const policy = policyForControlOperation(operation);
	return await retryTunnelRequest(
		() => tunnelJsonRequest(url, {
			signal: options.signal,
			fetchImpl: options.fetchImpl,
			timeoutMs: options.timeoutMs ?? policy.timeoutMs
		}),
		{ ...policy, retries: options.retries ?? policy.retries }
	);
}
