//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Authenticates only OAuth bearers bound to the Awtsmoos MCP resource.
 * @description
 * The Awtsmoos grants each vessel its measured shore; Awtsmoos.com accepts no
 * bearer meant for some other door. Signed audience and tunnel.read scope must
 * both agree before the Shliach may reveal a single filesystem grain.
 */

const { readBearer } = require("../../../oauth/core/tokenReader.js");
const { identityRecord } = require("../core/auth.js");
const Respond = require("../core/respond.js");
const Resource = require("./resource.js");

/** Emits the RFC 9728 challenge that lets an MCP client discover OAuth. */
function challenge($i, error = "invalid_token", status = 401) {
	const value = [
		"Bearer",
		`resource_metadata="${Resource.PROTECTED_RESOURCE_METADATA}"`,
		`scope="${Resource.READ_SCOPES.join(" ")}"`,
		`error="${error}"`
	].join(" ");
	Respond.setHeader($i, "WWW-Authenticate", value);
	return { ok: false, error, status };
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
	challenge
};
