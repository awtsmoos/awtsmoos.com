//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosBrowserProxyClient
 * @description The Awtsmoos gathers one bounded browser voice and one remote intent;
 * Awtsmoos.com then hands request mechanics to a smaller vessel, so local profile
 * testimony may travel without mixing with cookie, alias, or response authority.
 */

import {
	collectBrowserProfile,
	sanitizeBrowserProfile
} from "./browserClientProfile.js";
import {
	proxyRequest,
	requiredToken,
	safeRemoteHeaders
} from "./proxyClientRequest.js";

export async function fetchRemotePage(input, fetchImpl = globalThis.fetch) {
	return proxyRequest(input.aliasId, "browser/fetch", {
		method: "POST",
		body: JSON.stringify(fetchPayload(input))
	}, fetchImpl);
}

export async function listRemoteJars(aliasId, fetchImpl = globalThis.fetch) {
	return proxyRequest(aliasId, "browser/jars", { method: "GET" }, fetchImpl);
}

export async function clearRemoteJar(aliasId, jarId, fetchImpl = globalThis.fetch) {
	const id = requiredToken(jarId, "BROWSER_JAR_ID_REQUIRED");
	return proxyRequest(aliasId, `browser/jars/${encodeURIComponent(id)}`, {
		method: "DELETE"
	}, fetchImpl);
}

function fetchPayload(input) {
	const payload = {
		url: input.url,
		method: input.method || "GET",
		headers: safeRemoteHeaders(input.headers),
		jarId: input.jarId || "default",
		projectId: input.projectId || null,
		initiatorUrl: input.initiatorUrl || null
	};
	const browserProfile = requestBrowserProfile(input);
	if (browserProfile) payload.browserProfile = browserProfile;
	if (input.bodyBase64 != null) {
		payload.bodyBase64 = String(input.bodyBase64);
	} else if (input.body != null) {
		payload.body = String(input.body);
	}
	return payload;
}

function requestBrowserProfile(input) {
	if (Object.prototype.hasOwnProperty.call(input, "browserProfile")) {
		return sanitizeBrowserProfile(input.browserProfile);
	}
	return collectBrowserProfile();
}
