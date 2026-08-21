//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedNetworkResponsePolicy
 * @description The Awtsmoos measures the returning packet before guest eyes may see;
 * Awtsmoos.com rejects cross-origin redirect treasure, oversized testimony, and cookie
 * garments, so a helpful proxy never becomes a hidden CORS or session doorway at sea.
 */

import {
	assertEmbeddedSameOrigin,
	decodedBase64Length,
	embeddedPolicyError,
	requiredEmbeddedHttpUrl,
	requiredEmbeddedRequestId
} from "./embeddedNetworkPolicyShared.js";

const MAX_RESPONSE_BYTES = 25 * 1024 * 1024;
const MAX_HEADERS = 32;
const MAX_HEADER_VALUE = 8192;
const FORBIDDEN_RESPONSE_HEADERS = new Set([
	"cookie",
	"set-cookie",
	"set-cookie2"
]);

export function shapeEmbeddedNetworkResponse(result, pageUrl, requestId) {
	const page = requiredEmbeddedHttpUrl(
		pageUrl,
		"BROWSER_EMBEDDED_PAGE_URL_INVALID"
	);
	const finalUrl = requiredEmbeddedHttpUrl(
		result?.url,
		"BROWSER_EMBEDDED_RESPONSE_URL_INVALID"
	);
	assertEmbeddedSameOrigin(
		finalUrl,
		page,
		"BROWSER_EMBEDDED_CROSS_ORIGIN_REDIRECT"
	);
	const status = Number(result?.status);
	if (!Number.isInteger(status) || status < 200 || status > 599) {
		throw embeddedPolicyError("BROWSER_EMBEDDED_RESPONSE_STATUS_INVALID", 502);
	}
	const bodyBase64 = typeof result?.bodyBase64 === "string"
		? result.bodyBase64
		: "";
	if (decodedBase64Length(bodyBase64) > MAX_RESPONSE_BYTES) {
		throw embeddedPolicyError("BROWSER_EMBEDDED_RESPONSE_TOO_LARGE", 502);
	}
	return {
		bodyBase64,
		headers: safeResponseHeaders(result?.headers),
		id: requiredEmbeddedRequestId(requestId),
		redirected: Array.isArray(result?.redirects) && result.redirects.length > 0,
		status,
		url: finalUrl.href
	};
}

function safeResponseHeaders(input) {
	const output = {};
	for (const [rawName, rawValue] of Object.entries(input || {})) {
		if (Object.keys(output).length >= MAX_HEADERS) break;
		const name = String(rawName).toLowerCase();
		if (FORBIDDEN_RESPONSE_HEADERS.has(name) || /[\r\n]/.test(name)) continue;
		const value = String(rawValue);
		if (/[\r\n]/.test(value)) continue;
		output[name] = value.slice(0, MAX_HEADER_VALUE);
	}
	return output;
}
