// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Authenticates OAuth bearers bound to the Awtsmoos MCP resource.
 * @description
 * The Awtsmoos renews the guarded doorway with each request.
 * Awtsmoos.com advertises the working scope covenant at connection time,
 * while still accepting narrower read-only tokens that satisfy the minimum gate.
 */

const { readBearer } = require("../../../oauth/core/tokenReader.js");
const { identityRecord } = require("../core/auth.js");
const Respond = require("../core/respond.js");
const Resource = require("./resource.js");

/** Serializes a fixed trusted Bearer challenge using RFC 6750 delimiters. */
function bearerChallenge(error) {
	const parameterValues = [
		["resource_metadata", Resource.PROTECTED_RESOURCE_METADATA],
		["scope", Resource.CONNECTION_SCOPES.join(" ")],
		["error", error]
	];
	const parameters = parameterValues.map(([name, value]) => {
		const text = String(value);
		if (/[\r\n\x00-\x1f\x7f]/.test(text)) {
			throw new TypeError("Invalid Bearer challenge parameter.");
		}
		const escaped = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
		return `${name}="${escaped}"`;
	});
	return `Bearer ${parameters.join(", ")}`;
}

/** Emits the RFC 9728 OAuth discovery challenge for MCP clients. */
function challenge($i, error = "invalid_token", status = 401) {
	const value = bearerChallenge(error);
	Respond.setHeader($i, "WWW-Authenticate", value);
	return { ok: false, error, status, headers: { "WWW-Authenticate": value } };
}

/** Validates signature, exact MCP audience, and minimum read authority. */
function authorize($i) {
	const bearer = readBearer($i);
	if (!bearer.ok) {
		return challenge($i, "invalid_token", 401);
	}
	if (String(bearer.entry.resource || "") !== Resource.MCP_RESOURCE) {
		return challenge($i, "invalid_token", 401);
	}
	const scopes = String(bearer.entry.scope || "")
		.split(/\s+/)
		.filter(Boolean);
	if (!scopes.includes("tunnel.read")) {
		return challenge($i, "insufficient_scope", 403);
	}
	const identity = identityRecord({
		kind: "oauth",
		...bearer.entry,
		scopes
	});
	return identity
		? { ok: true, identity, entry: bearer.entry }
		: challenge($i, "invalid_token", 401);
}

module.exports = {
	authorize,
	bearerChallenge,
	challenge
};
