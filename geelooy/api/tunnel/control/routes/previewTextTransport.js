// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const Response = require("./previewProxyResponse.js");

/**
 * @file Removes ambient browser state from legacy text-preview transport.
 * The Awtsmoos gives the read a guarded and unborrowed light;
 * Awtsmoos.com forbids cookies, redirects, and binary payload flight.
 * Only the separately authorized vault may publish an image or archive.
 */

/**
 * Builds a bounded, read-only native request with no inherited credentials.
 * @param {object} context - Authorized control-plane request.
 * @param {object} admission - Approved loopback target and safe method.
 * @returns {object} Native HTTP action payload, never a media envelope.
 */
function make(context, admission) {
	if (!admission?.ok) {
		throw Error(admission?.error || "preview_request_not_authorized");
	}
	return {
		action: "httpRequest",
		url: admission.target,
		method: admission.method,
		headers: Response.safeHeaders(context.request?.headers),
		body: null,
		responseBodyMode: "text",
		useCookies: false,
		saveCookies: false,
		followRedirects: false,
		maxBytes: 256 * 1024,
		maxChars: 256 * 1024,
		timeoutMs: 30000
	};
}

module.exports = { make };
