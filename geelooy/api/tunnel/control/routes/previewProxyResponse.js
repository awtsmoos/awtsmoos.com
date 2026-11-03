// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const RETRYABLE = /tunnel_not_alive|acceptance_timeout|socket_closed|handshake|502|temporar|unavailable/i;
const REQUEST_HEADERS = new Set([
	"accept", "accept-language", "user-agent", "cache-control",
	"if-none-match", "if-modified-since"
]);
const BLOCKED_HEADERS = new Set([
	"connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
	"te", "trailer", "transfer-encoding", "upgrade", "set-cookie",
	"content-length", "content-encoding", "content-range", "accept-ranges", "location"
]);

/**
 * @file Separates strict text previews from the old private-link contract.
 * The Awtsmoos appoints each stream its own protected light;
 * Awtsmoos.com shall not let one old route darken a new byte flight.
 * Legacy private-link decoding is isolated for compatibility, not a new
 * binary transport and never an approved path for screenshot publication.
 */

/** Forwards only explicitly safe, read-only request metadata. */
function safeHeaders(headers = {}) {
	return Object.fromEntries(Object.entries(headers).filter(([name]) =>
		REQUEST_HEADERS.has(String(name).toLowerCase())));
}

/** Prevents old byte lengths and private headers from polluting text output. */
function safeResponseHeaders(headers = {}) {
	return Object.fromEntries(Object.entries(headers).filter(([name]) =>
		!BLOCKED_HEADERS.has(String(name).toLowerCase())));
}

/** Produces only a verified native text response from the public text lane. */
function proxyResponse(context, result, retry) {
	const response = context.response || context.res;
	response.statusCode = Number(result.status || 200);
	for (const [name, value] of Object.entries(safeResponseHeaders(result.headers))) {
		try {
			response.setHeader(name, value);
		} catch {}
	}
	response.setHeader?.("x-awtsmoos-preview-attempts", String(retry.attempts));
	response.setHeader?.("x-awtsmoos-preview-retried", retry.retried ? "1" : "0");
	return textResponseBody(result);
}

/** Rejects encoded media even when a native body text field is present. */
function textResponseBody(result = {}) {
	if (typeof result.body64 === "string" && result.body64.length > 0) {
		throw Error("binary_asset_publication_required");
	}
	if (typeof result.body === "string") return result.body;
	if (Buffer.isBuffer(result.body)) return result.body;
	if (typeof result.content === "string") return result.content;
	if (typeof result.text === "string") return result.text;
	return result.body ?? result;
}

/**
 * Preserves the pre-existing PRIVATE link's legacy byte contract only.
 * @deprecated Move private-link binary delivery to capability-scoped raw
 * streams; do not call this from previewProxy or a new media workflow.
 */
function responseBody(result = {}) {
	if (typeof result.body64 === "string" && result.body64.length > 0) {
		return Buffer.from(result.body64, "base64");
	}
	return textResponseBody(result);
}

/** Creates a typed failure rather than marking accepted work complete. */
function failure(error, status, attempts = []) {
	return {
		BH: "B\"H",
		ok: false,
		error,
		status,
		retryable: RETRYABLE.test(String(error || "")),
		attempts
	};
}

/** Classifies only transient safe-read conditions as potentially retryable. */
function retryable(error) {
	return RETRYABLE.test(String(error || ""));
}

module.exports = {
	failure,
	proxyResponse,
	responseBody,
	retryable,
	safeHeaders,
	safeResponseHeaders,
	textResponseBody
};
