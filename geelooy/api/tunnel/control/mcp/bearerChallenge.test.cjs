//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Auth = require("./auth.js");
const Resource = require("./resource.js");

/**
 * @file Verifies truthful OAuth discovery grammar and working scope invitation.
 * @description
 * The Awtsmoos guards consent without hiding the road from sight;
 * Awtsmoos.com asks once for the ordinary tools the user expects to ignite.
 */

test("Bearer challenge advertises canonical metadata and full working scopes", () => {
	const header = Auth.bearerChallenge("invalid_token");
	assert.match(header, /oauth-protected-resource\/api\/tunnel\/control\/mcp/);
	for (const scope of [
		"profile",
		"tunnel.read",
		"tunnel.write",
		"tunnel.command",
		"tunnel.browser",
		"tunnel.mission",
		"tunnel.room",
		"awtsmoos.api"
	]) {
		assert.ok(Resource.CONNECTION_SCOPES.includes(scope));
		assert.match(header, new RegExp(scope.replace(".", "\\.")));
	}
	assert.doesNotMatch(header, /tunnel\.admin/);
});

test("minimum scopes remain read-only compatible", () => {
	assert.deepEqual(Resource.MINIMUM_SCOPES, ["profile", "tunnel.read"]);
	assert.equal(Resource.READ_SCOPES, Resource.MINIMUM_SCOPES);
});

test("legacy root metadata remains available as a compatibility alias", () => {
	assert.equal(
		Resource.LEGACY_PROTECTED_RESOURCE_METADATA,
		"https://awtsmoos.com/.well-known/oauth-protected-resource"
	);
	assert.notEqual(
		Resource.PROTECTED_RESOURCE_METADATA,
		Resource.LEGACY_PROTECTED_RESOURCE_METADATA
	);
});

test("Unauthenticated transport preserves the discoverable working challenge", () => {
	const headers = {};
	const $i = {
		response: {
			setHeader: (name, value) => {
				headers[name] = value;
			}
		}
	};
	const result = Auth.challenge($i);
	assert.equal(result.status, 401);
	assert.equal(result.headers["WWW-Authenticate"], headers["WWW-Authenticate"]);
	assert.match(headers["WWW-Authenticate"], /tunnel\.write/);
	assert.match(headers["WWW-Authenticate"], /tunnel\.command/);
	assert.match(headers["WWW-Authenticate"], /tunnel\.browser/);
});

test("Insufficient-scope challenge retains 403 and a valid Bearer error", () => {
	const response = { setHeader() {} };
	const challenge = Auth.challenge({ response }, "insufficient_scope", 403);
	assert.equal(challenge.status, 403);
	assert.match(challenge.headers["WWW-Authenticate"], /, error="insufficient_scope"$/);
});

test("Control characters cannot become injected response headers", () => {
	assert.throws(
		() => Auth.bearerChallenge("invalid_token\r\nX-Injected: yes"),
		/Invalid Bearer challenge parameter/
	);
});
