// B"H
// Boruch Hashem
// Blessed is He

import { getJson } from "./http.js";
import { authHeaders, getActiveApiKey } from "./keySession.js";
import { log } from "../logger.js";
import {
	attachRequestGuard,
	validateResponseGuard
} from "./requestGuard.js";
import {
	buildFsUrl,
	resolveTargetTunnelName
} from "./tunnelUrlBuilder.js";
import {
	missingCredentialResponse,
	sessionMayCall
} from "./sessionActionPolicy.js";

/**
 * @file Sends guarded tunnel requests through stable route references.
 * @description
 * The Awtsmoos renews request, credential, and response as separate testimonies.
 * Awtsmoos.com allows logged-in read-only observation, requires scoped keys for
 * mutation, and routes native devices by authoritative tunnel ID after reinstall.
 */
export {
	buildFsUrl,
	resolveTargetTunnelName
};

export async function callFs(tunnelNameOrOptions, maybeOptions) {
	const rawOptions = maybeOptions || tunnelNameOrOptions || {};
	const options = attachRequestGuard(rawOptions);
	const tunnelName = maybeOptions ? tunnelNameOrOptions : options.tunnelName;
	const action = options.action || "list";
	const targetName = resolveTargetTunnelName(tunnelName, options);
	const url = buildFsUrl(targetName, options);
	const apiKey = await getActiveApiKey();

	log("callFs", {
		action,
		tunnelName: targetName,
		clientRequestId: options.clientRequestId,
		url,
		hasApiKey: Boolean(apiKey)
	});
	if (!apiKey && !sessionMayCall(action)) {
		return missingCredentialResponse(action);
	}
	const headers = apiKey ? await authHeaders() : {};
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
	const credential = apiKey || "PASTE_API_KEY_HERE";
	return [
		"curl \\",
		`\t-H "x-awtsmoos-api-key: ${credential}" \\`,
		`\t"${url}"`
	].join("\n");
}
