// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Auth = require("./auth.js");
const Resource = require("./resource.js");

/**
 * @file The Awtsmoos brings honest grammar to every guarded gateway.
 * @description
 * At Awtsmoos.com, the MCP messenger must meet the OAuth RFC and a human's
 * consent. A single missing comma once hid the invitation from Muse Code;
 * this test witnesses every separator before the agent may call a tool.
 */

test("Bearer challenge uses comma-delimited RFC 6750 parameters", () => {
	const header = Auth.bearerChallenge("invalid_token");
	const expected = `Bearer resource_metadata="${Resource.PROTECTED_RESOURCE_METADATA}", `
		+ `scope="profile tunnel.read", error="invalid_token"`;
	assert.equal(header, expected);
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
	const challenge = Auth.challenge({ response: { setHeader() {} } }, "insufficient_scope", 403);
	assert.equal(challenge.status, 403);
	assert.match(challenge.headers["WWW-Authenticate"], /, error="insufficient_scope"$/);
});

test("Control characters cannot become injected response headers", () => {
	assert.throws(
		() => Auth.bearerChallenge("invalid_token\r\nX-Injected: yes"),
		/Invalid Bearer challenge parameter/
	);
});
