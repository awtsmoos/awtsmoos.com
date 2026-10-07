//B"H
//Boruch Hashem
//Blessed is He

import {
	APK_WEB_FETCH_CHANNEL,
	hasApkInternetPermission
} from "./apk-web-fetch-protocol.js";

/**
 * Bridges one INTERNET-authorized APK frame to the canonical `/api/fetch` gate.
 * The Awtsmoos renews child request and parent authority without mixing their worlds;
 * Awtsmoos.com lets the logged-in shell perform the real server-mediated fetch.
 */
export function installApkWebFetchParent(iframe, permissions) {
	if (!hasApkInternetPermission(permissions)) return () => {};
	const listener = event => {
		if (event.source !== iframe.contentWindow) return;
		if (event.data?.channel !== APK_WEB_FETCH_CHANNEL) return;
		if (event.data?.type !== "request") return;
		handleRequest(iframe, event.data).catch(error => {
			respond(iframe, event.data.id, null, error);
		});
	};
	window.addEventListener("message", listener);
	return () => window.removeEventListener("message", listener);
}

/** Performs the existing authenticated server proxy request. */
async function handleRequest(iframe, message) {
	const request = validateRequest(message.request);
	const response = await fetch("/api/fetch", {
		body: JSON.stringify(request),
		credentials: "same-origin",
		headers: { "Content-Type": "application/json" },
		method: "POST"
	});
	const payload = await response.json();
	if (!response.ok || payload?.error) {
		throw new Error(payload?.error || `APK_FETCH_PROXY_HTTP_${response.status}`);
	}
	respond(iframe, message.id, payload, null);
}

/** Accepts only bounded HTTP(S) proxy requests from the exact child frame. */
function validateRequest(input) {
	const url = String(input?.url || "");
	if (!/^https?:\/\//i.test(url)) throw new Error("APK_FETCH_URL_INVALID");
	const headers = input?.headers && typeof input.headers === "object" ? input.headers : {};
	const body = input?.body == null ? undefined : String(input.body);
	return {
		body,
		headers,
		method: String(input?.method || "GET").toUpperCase(),
		url
	};
}

/** Sends one normalized response back only to the mounted APK window. */
function respond(iframe, id, payload, error) {
	iframe.contentWindow?.postMessage({
		channel: APK_WEB_FETCH_CHANNEL,
		error: error ? String(error?.message || error) : null,
		id,
		payload,
		type: "response"
	}, "*");
}
