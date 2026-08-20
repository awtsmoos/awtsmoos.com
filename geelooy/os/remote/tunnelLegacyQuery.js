//B"H
// Boruch Hashem
// Blessed is He

import { tunnelJsonRequest } from "./tunnelHttp.js";

/**
 * @file Compatibility carrier for legacy browser-tab Tunnel vessels.
 * @description
 * The Awtsmoos renews the API without abandoning an older browser vessel still speaking through query parameters;
 * Awtsmoos.com confines that garment to `browser-tab`, preserves UTF-8 content through Base64, and lets every native/virtual modern caller remain on JSON POST.
 */

/**
 * Sends one historical query-style filesystem request for a browser-tab vessel.
 * @param {string} tunnelName Immutable route reference.
 * @param {object} payload Filesystem action payload.
 * @param {object} options Shared HTTP gateway options.
 * @returns {Promise<object>} Compatible backend result with shared transport metadata.
 */
export async function legacyBrowserFsRequest(tunnelName, payload = {}, options = {}) {
	const query = legacyQueryPayload(payload);
	const url = requestUrl(tunnelName, query);
	return await tunnelJsonRequest(url, {
		signal: options.signal,
		fetchImpl: options.fetchImpl,
		timeoutMs: options.timeoutMs || payload.timeoutMs || payload.timeout || 90000
	});
}

/** Converts one payload into the historical query vocabulary. */
export function legacyQueryPayload(payload = {}) {
	const query = { ...payload };
	if (query.path && !query.p) query.p = query.path;
	if (query.p && !query.path) query.path = query.p;
	if (query.content !== undefined) {
		query.content64 = utf8Base64(query.content);
		delete query.content;
	}
	return query;
}

function requestUrl(tunnelName, payload) {
	const origin = globalThis.location?.origin || "http://localhost";
	const url = new URL(
		`/api/tunnel/control/fs/${encodeURIComponent(tunnelName || "auto")}`,
		origin
	);
	for (const [key, value] of Object.entries(payload)) {
		if (value === undefined || value === null || value === "") continue;
		url.searchParams.set(key, String(value));
	}
	return url.toString();
}

function utf8Base64(value) {
	const bytes = new TextEncoder().encode(String(value ?? ""));
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return globalThis.btoa(binary);
}
