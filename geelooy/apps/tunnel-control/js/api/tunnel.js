// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Sends guarded tunnel requests through stable route references.
 * @description
 * The Awtsmoos renews every request through the smallest truthful vessel;
 * Awtsmoos.com sends small GETs directly and promotes oversized writes into
 * resumable hashed GET transfers before any proxy can answer with a 414.
 */

import { getJson } from "./http.js";
import { authHeaders, getActiveApiKey } from "./keySession.js";
import { performLargeWrite, shouldPromoteLargeWrite } from "./largeWriteTransport.js";
import { log } from "../logger.js";
import { attachRequestGuard, validateResponseGuard } from "./requestGuard.js";
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
	if (shouldPromoteLargeWrite(url, options)) {
		return performLargeWrite({
			tunnelName: targetName,
			options,
			headers,
			credentials: "include"
		});
	}
	const response = await getJson(url, {
		headers,
		credentials: "include"
	});
	return validateResponseGuard(response, options);
}

export async function buildCurl(tunnelName, options = {}) {
	const apiKey = await getActiveApiKey();
	const targetName = resolveTargetTunnelName(tunnelName, options);
	const url = buildFsUrl(targetName, options);
	if (shouldPromoteLargeWrite(url, options)) {
		return "# Large write: use Tunnel Control; GET transfer promotion is required.";
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
