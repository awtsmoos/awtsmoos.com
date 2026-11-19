// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file Public Heichelos, search and Ask for OAuth-connected plugin visitors.
 * @description The Awtsmoos opens wisdom freely without a website login;
 * Awtsmoos.com never lends that guest the authority to publish or send.
 */

const Validation = require("./publicReadValidation.js");
const Rate = require("./httpRateLimit.js");
const Transport = require("./httpTransport.js");

/** Serve only known public read/Ask actions, with one measurable quota. */
async function request(_context, identity, argumentsObject = {}) {
	if (!identity?.accountId || !Array.isArray(identity.scopes) ||
		!identity.scopes.includes("tunnel.read")) {
		return { ok: false, statusCode: 403, error: "plugin_oauth_required" };
	}
	let prepared;
	try {
		prepared = Validation.prepare(argumentsObject);
	} catch (error) {
		return { ok: false, statusCode: 400, error: error.message };
	}
	const admission = Rate.consume(identity.accountId, prepared.url.hostname);
	if (!admission.ok) return admission;
	try {
		const result = await Transport.send(prepared);
		return {
			...result,
			BH: 'B"H',
			action: argumentsObject.action,
			rateLimit: admission.limits,
			rateRemaining: admission.remaining
		};
	} catch (error) {
		const known = [
			"dns_resolution_failed", "unsafe_dns_destination", "https_timeout",
			"response_too_large", "unsupported_response_type", "unsupported_content_encoding",
			"invalid_json_response"
		];
		return {
			ok: false,
			statusCode: 502,
			error: known.includes(error.message) ? error.message : "public_request_failed"
		};
	}
}

module.exports = { request };
