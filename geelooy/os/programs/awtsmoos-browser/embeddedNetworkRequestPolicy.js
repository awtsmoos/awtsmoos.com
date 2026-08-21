//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedNetworkRequestPolicy
 * @description The Awtsmoos opens one measured same-origin road and no hidden sea;
 * Awtsmoos.com lets guest fetch testimony cross the host proxy without granting a
 * cookie crown, opaque CORS oracle, unsupported method, or transport power to be.
 */

import {
	assertEmbeddedSameOrigin,
	decodeEmbeddedBase64,
	embeddedPolicyError,
	requiredEmbeddedHttpUrl,
	requiredEmbeddedRequestId
} from "./embeddedNetworkPolicyShared.js";

const MAX_BODY_BYTES = 1024 * 1024;
const MAX_HEADERS = 32;
const MAX_HEADER_VALUE = 8192;
const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST"]);
const ALLOWED_CREDENTIALS = new Set(["same-origin", "include"]);
const ALLOWED_MODES = new Set(["cors", "same-origin"]);
const ALLOWED_HEADERS = new Set([
	"accept",
	"authorization",
	"cache-control",
	"content-type",
	"if-modified-since",
	"if-none-match",
	"range"
]);

export function validateEmbeddedNetworkRequest(input, pageUrl) {
	const page = requiredEmbeddedHttpUrl(
		pageUrl,
		"BROWSER_EMBEDDED_PAGE_URL_INVALID"
	);
	const url = requiredEmbeddedHttpUrl(
		input?.url,
		"BROWSER_EMBEDDED_REQUEST_URL_INVALID",
		page
	);
	assertEmbeddedSameOrigin(url, page, "BROWSER_EMBEDDED_CROSS_ORIGIN_REQUEST");
	const method = allowedValue(
		String(input?.method || "GET").toUpperCase(),
		ALLOWED_METHODS,
		"BROWSER_EMBEDDED_METHOD_FORBIDDEN",
		405
	);
	const body = decodeEmbeddedBase64(input?.bodyBase64, MAX_BODY_BYTES);
	if ((method === "GET" || method === "HEAD") && body.byteLength) {
		throw embeddedPolicyError("BROWSER_EMBEDDED_BODY_FORBIDDEN", 400);
	}
	const credentials = allowedValue(
		input?.credentials || "same-origin",
		ALLOWED_CREDENTIALS,
		"BROWSER_EMBEDDED_CREDENTIALS_UNSUPPORTED",
		400
	);
	const mode = allowedValue(
		input?.mode || "cors",
		ALLOWED_MODES,
		"BROWSER_EMBEDDED_MODE_UNSUPPORTED",
		400
	);
	const redirect = input?.redirect || "follow";
	if (redirect !== "follow") {
		throw embeddedPolicyError("BROWSER_EMBEDDED_REDIRECT_UNSUPPORTED", 400);
	}
	return {
		body,
		credentials,
		headers: safeRequestHeaders(input?.headers),
		id: requiredEmbeddedRequestId(input?.id),
		method,
		mode,
		redirect,
		url: url.href
	};
}

function safeRequestHeaders(input) {
	const entries = Object.entries(input || {});
	if (entries.length > MAX_HEADERS) {
		throw embeddedPolicyError("BROWSER_EMBEDDED_HEADERS_TOO_MANY", 400);
	}
	const output = {};
	for (const [rawName, rawValue] of entries) {
		const name = String(rawName).toLowerCase();
		if (!ALLOWED_HEADERS.has(name)) {
			throw embeddedPolicyError("BROWSER_EMBEDDED_HEADER_FORBIDDEN", 400);
		}
		const value = String(rawValue);
		if (/[\r\n]/.test(value) || value.length > MAX_HEADER_VALUE) {
			throw embeddedPolicyError("BROWSER_EMBEDDED_HEADER_INVALID", 400);
		}
		output[name] = value;
	}
	return output;
}

function allowedValue(value, allowed, code, status) {
	if (!allowed.has(value)) throw embeddedPolicyError(code, status);
	return value;
}
