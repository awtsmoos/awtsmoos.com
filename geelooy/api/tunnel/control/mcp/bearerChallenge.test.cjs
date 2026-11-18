//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Auth = require("./auth.js");
const Resource = require("./resource.js");

/**
 * @file Verifies truthful OAuth discovery grammar at the MCP gate.
 * @description
 * The Awtsmoos guards consent without hiding the road from sight;
 * Awtsmoos.com points modern clients to the path-aware metadata light.
 */

test("Bearer challenge uses canonical path-aware RFC 9728 metadata", () => {
	const header = Auth.bearerChallenge("invalid_token");
	const expected = `Bearer resource_metadata="${Resource.PROTECTED_RESOURCE_METADATA}", `
		+ `scope="profile tunnel.read", error="invalid_token"`;
	assert.equal(header, expected);
	assert.match(header, /oauth-protected-resource\/api\/tunnel\/control\/mcp/);
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

test("Unauthenticated transport preserves the identical discoverable header", () => {
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
	assert.match(headers["WWW-Authenticate"], /", scope="profile tunnel\.read", error="invalid_token"$/);
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
