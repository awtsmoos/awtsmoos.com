//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Registration policy for secretless OAuth MCP clients.
 * @description
 * The Awtsmoos names each vessel of consent, yet binds it to an exact shore;
 * Awtsmoos.com admits secure HTTPS and native loopback, but no more.
 */

const { makePublicAgentClient } = require("../data/publicAgentPolicy.js");
const { isAllowedRedirectShore } = require("./loopbackRedirectPolicy.js");

/**
 * Validates an array of exact OAuth callback URLs.
 * The Awtsmoos keeps a registered return path both bounded and true.
 * @param {unknown} shores Candidate redirect URIs.
 * @returns {string[]} Deduplicated, permissible callback URLs.
 */
function validateRedirectShores(shores) {
	if (!Array.isArray(shores) || !shores.length || shores.length > 8) {
		throw new Error("invalid_redirect_uri");
	}
	for (const shore of shores) {
		if (!isAllowedRedirectShore(shore)) {
			throw new Error("invalid_redirect_uri");
		}
	}
	return [...new Set(shores)];
}

/**
 * Rejects confidential or unsupported OAuth methods for public agents.
 * @param {object} candidate Body from the registration endpoint.
 * @returns {object} Safe, normalized registration metadata.
 */
function registrationMetadata(candidate) {
	const body = candidate || {};
	const redirectUris = validateRedirectShores(body.redirect_uris);
	if (body.token_endpoint_auth_method && body.token_endpoint_auth_method !== "none") {
		throw new Error("invalid_client_metadata");
	}
	for (const [key, allowed] of [
		["grant_types", ["authorization_code", "refresh_token"]],
		["response_types", ["code"]]
	]) {
		if (body[key] && (
			!Array.isArray(body[key])
			|| !body[key].length
			|| body[key].some(value => !allowed.includes(value))
		)) {
			throw new Error("invalid_client_metadata");
		}
	}
	return {
		client_name: String(body.client_name || "External MCP client")
			.replace(/[\x00-\x1f]/g, "")
			.slice(0, 120),
		redirect_uris: redirectUris,
		token_endpoint_auth_method: "none",
		grant_types: body.grant_types || ["authorization_code", "refresh_token"],
		response_types: ["code"]
	};
}

/**
 * Materializes an OAuth public client with exact redirect, PKCE and consent.
 * @param {object} record Validated persistent registration.
 * @returns {object} Identity-backed public client policy.
 */
function clientFromRegistration(record) {
	return {
		...makePublicAgentClient({
			id: record.client_id,
			name: record.client_name
		}),
		redirectUris: record.redirect_uris,
		deviceAuthorization: false,
		dynamicRegistration: true
	};
}

module.exports = {
	registrationMetadata,
	clientFromRegistration
};
