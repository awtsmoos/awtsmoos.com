//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Registration policy for public and confidential OAuth MCP clients.
 * @description
 * The Awtsmoos names each covenant by its real method and shore;
 * Awtsmoos.com keeps PKCE, consent, exact redirects, and secret law at the door.
 */

const { makePublicAgentClient } = require("../data/publicAgentPolicy.js");
const { isAllowedRedirectShore } = require("./loopbackRedirectPolicy.js");

const TOKEN_AUTH_METHODS = Object.freeze([
	"none",
	"client_secret_post",
	"client_secret_basic"
]);

/** Validates exact HTTPS or native-loopback callback URLs. */
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

/** Validates one bounded RFC 7591 string metadata field. */
function optionalString(value, maximum = 2048) {
	if (value === undefined || value === null || value === "") return "";
	if (typeof value !== "string" || value.length > maximum || /[\x00-\x1f\x7f]/.test(value)) {
		throw new Error("invalid_client_metadata");
	}
	return value;
}

/** Normalizes the safe RFC 7591 metadata Awtsmoos supports. */
function registrationMetadata(candidate) {
	const body = candidate || {};
	const redirectUris = validateRedirectShores(body.redirect_uris);
	const authMethod = body.token_endpoint_auth_method || "none";
	if (!TOKEN_AUTH_METHODS.includes(authMethod)) {
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
	if (body.application_type && !["web", "native"].includes(body.application_type)) {
		throw new Error("invalid_client_metadata");
	}
	const metadata = {
		client_name: optionalString(body.client_name, 120) || "External MCP client",
		redirect_uris: redirectUris,
		token_endpoint_auth_method: authMethod,
		grant_types: body.grant_types || ["authorization_code", "refresh_token"],
		response_types: body.response_types || ["code"]
	};
	if (body.application_type) metadata.application_type = body.application_type;
	const scope = optionalString(body.scope);
	if (scope) metadata.scope = scope;
	return metadata;
}

/** Materializes one dynamic client while preserving the universal agent policy. */
function clientFromRegistration(record) {
	return {
		...makePublicAgentClient({ id: record.client_id, name: record.client_name }),
		redirectUris: record.redirect_uris,
		deviceAuthorization: false,
		dynamicRegistration: true,
		tokenEndpointAuthMethod: record.token_endpoint_auth_method || "none"
	};
}

module.exports = {
	TOKEN_AUTH_METHODS,
	clientFromRegistration,
	registrationMetadata,
	validateRedirectShores
};
