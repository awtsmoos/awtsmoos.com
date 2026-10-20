// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Sends guarded tunnel requests through stable route references.
 * @description
 * The Awtsmoos renews every request through the smallest truthful vessel;
 * Awtsmoos.com keeps small GETs direct while great writes and batches become
 * resumable staged rivers before any proxy can answer with a 414.
 */

import { getJson } from "./http.js";
import { authHeaders, getActiveApiKey } from "./keySession.js";
import { performLargeBatch, shouldPromoteLargeBatch } from "./largeBatchTransport.js";
import { performLargeWrite, shouldPromoteLargeWrite } from "./largeWriteTransport.js";
import { log } from "../logger.js";
import { attachRequestGuard, validateResponseGuard } from "./requestGuard.js";
import { observePendingReceipt } from "./observeReceipt.js";
import { buildFsUrl, resolveTargetTunnelName } from "./tunnelUrlBuilder.js";
import { missingCredentialResponse, sessionMayCall } from "./sessionActionPolicy.js";

export { buildFsUrl, resolveTargetTunnelName };

export async function callFs(tunnelNameOrOptions, maybeOptions) {
	const rawOptions = maybeOptions || tunnelNameOrOptions || {};
	const options = attachRequestGuard(rawOptions);
	const tunnelName = maybeOptions ? tunnelNameOrOptions : options.tunnelName;
	const action = options.action || "list";
	const targetName = resolveTargetTunnelName(tunnelName, options);
	const url = buildFsUrl(targetName, options);
	const apiKey = await getActiveApiKey();
	logRequest(action, targetName, options, url, apiKey);
	if (!apiKey && !sessionMayCall(action)) {
		return missingCredentialResponse(action);
	}
	const headers = apiKey ? await authHeaders() : {};
	if (shouldPromoteLargeBatch(url, options)) {
		return performLargeBatch({
			tunnelName: targetName,
			options,
			headers,
			credentials: "include"
		});
	}
	if (shouldPromoteLargeWrite(url, options)) {
		return performLargeWrite({
			tunnelName: targetName,
			options,
			headers,
			credentials: "include"
		});
	}
	const first = await getJson(url, {
		headers,
		credentials: "include"
	});
	const settled = await observePendingReceipt(first, {
		action,
		postObserve: body => postObserveRequest(targetName, headers, body)
	});
	return validateResponseGuard(settled, options);
}

/**
 * @description Sends one retryAction observation for a pending receipt.
 * The relay accepts observation as a POST carrying the receipt's own
 * observation payload; the terminal envelope answers on the same vessel.
 */
async function postObserveRequest(targetName, headers, body) {
	const url = new URL(
		`/api/tunnel/control/fs/${encodeURIComponent(targetName)}`,
		location.origin
	);
	return getJson(url, {
		method: "POST",
		credentials: "include",
		headers: {
			"content-type": "application/json",
			...(headers || {})
		},
		body: JSON.stringify(body)
	});
}

export async function buildCurl(tunnelName, options = {}) {
	const apiKey = await getActiveApiKey();
	const targetName = resolveTargetTunnelName(tunnelName, options);
	const url = buildFsUrl(targetName, options);
	if (shouldPromoteLargeBatch(url, options) || shouldPromoteLargeWrite(url, options)) {
		return "# Large payload: use Tunnel Control; resumable GET transfer promotion is required.";
	}
	const credential = apiKey || "PASTE_API_KEY_HERE";
	return [
		"curl \\",
		`\t-H \"x-awtsmoos-api-key: ${credential}\" \\`,
		`\t\"${url}\"`
	].join("\n");
}

function logRequest(action, tunnelName, options, url, apiKey) {
	log("callFs", {
		action,
		tunnelName,
		clientRequestId: options.clientRequestId,
		urlChars: url.length,
		hasApiKey: Boolean(apiKey)
	});
}
