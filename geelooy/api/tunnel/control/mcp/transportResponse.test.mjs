// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleMcp } = require("./handler.js");
const Resource = require("./resource.js");
const { isWrappedDynamicResponse } = require("../../../../../ayzarim/awtsmoosDynamicServer/response/dynamicResponseShape.js");
const { normalizeDynamicReturn } = require("../../../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js");

/**
 * @file Authenticated and unauthenticated MCP transport witnesses.
 * @description
 * The Awtsmoos reveals the way even to the stranger who has not signed in.
 * Awtsmoos.com speaks OAuth discovery before method restrictions and now invites
 * the ordinary working scopes once, without granting them before human consent.
 */

function anonymousContext(method, postBody) {
	const headers = {};
	const response = {
		statusCode: 200,
		setHeader: (key, value) => {
			headers[key] = value;
		}
	};
	return {
		headers,
		context: {
			request: { method, headers: {} },
			response,
			...(postBody ? { $_POST: postBody } : {})
		}
	};
}

test("unauthenticated GET offers working OAuth discovery instead of premature 405", async () => {
	const { headers, context } = anonymousContext("GET");
	const result = await handleMcp(context);
	const challenge = headers["WWW-Authenticate"];
	assert.equal(result.statusCode, 401);
	assert.equal(isWrappedDynamicResponse(result), true);
	assert.match(challenge, /^Bearer resource_metadata=/);
	assert.match(challenge, new RegExp(`scope="${Resource.CONNECTION_SCOPES.join(" ")}"`));
	assert.match(challenge, /error="invalid_token"$/);
	assert.equal(normalizeDynamicReturn(result).headers["WWW-Authenticate"], challenge);
	assert.equal(headers.Allow, undefined);
});

test("unauthenticated POST initialization carries 401 and OAuth challenge", async () => {
	const { headers, context } = anonymousContext("POST", {
		jsonrpc: "2.0",
		id: 1,
		method: "initialize"
	});
	const result = await handleMcp(context);
	assert.equal(result.statusCode, 401);
	assert.equal(isWrappedDynamicResponse(result), true);
	assert.match(headers["WWW-Authenticate"], /oauth-protected-resource/);
	assert.match(headers["WWW-Authenticate"], /tunnel\.command/);
	assert.equal(normalizeDynamicReturn(result).headers["WWW-Authenticate"], headers["WWW-Authenticate"]);
	assert.equal(JSON.parse(result.response).error.code, -32000);
});

test("unauthenticated malformed POST still challenges before body parsing", async () => {
	const { context } = anonymousContext("POST", { broken: true });
	const result = await handleMcp(context);
	assert.equal(result.statusCode, 401);
});

test("MCP init never negotiates an arbitrary unsupported protocol version", async () => {
	const Protocol = require("./protocol.js");
	const context = {};
	const identity = {};
	const valid = await Protocol.dispatch(context, identity, {
		method: "initialize",
		params: { protocolVersion: "2025-03-26" }
	});
	assert.equal(valid.protocolVersion, "2025-03-26");
	const invalid = await Protocol.dispatch(context, identity, {
		method: "initialize",
		params: { protocolVersion: "unimplemented-2099" }
	});
	assert.equal(invalid.protocolVersion, Protocol.LEGACY_VERSION);
});
