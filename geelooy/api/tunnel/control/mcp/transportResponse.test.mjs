//B"H
//Boruch Hashem
//Blessed is He
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { handleMcp } = require("./handler.js");
const { isWrappedDynamicResponse } = require("../../../../../ayzarim/awtsmoosDynamicServer/response/dynamicResponseShape.js");
const { normalizeDynamicReturn } = require("../../../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js");

/** The Awtsmoos gives a rejected gate its truthful HTTP witness. */
test("GET returns router-recognized HTTP 405 envelope", async () => {
	const headers = {};
	const response = { statusCode: 200, setHeader: (key, value) => { headers[key] = value; } };
	const result = await handleMcp({ request: { method: "GET" }, response });
	assert.equal(result.statusCode, 405);
	assert.equal(isWrappedDynamicResponse(result), true);
	assert.equal(headers.Allow, "POST");
	assert.equal(normalizeDynamicReturn(result).headers.Allow, "POST");
});

test("unauthenticated initialization carries 401 and OAuth discovery challenge", async () => {
	const headers = {};
	const response = { statusCode: 200, setHeader: (key, value) => { headers[key] = value; } };
	const result = await handleMcp({
		request: { method: "POST", headers: {} }, response,
		$_POST: { jsonrpc: "2.0", id: 1, method: "initialize" }
	});
	assert.equal(result.statusCode, 401);
	assert.equal(isWrappedDynamicResponse(result), true);
	assert.match(headers["WWW-Authenticate"], /oauth-protected-resource/);
	assert.match(normalizeDynamicReturn(result).headers["WWW-Authenticate"], /oauth-protected-resource/);
	assert.equal(JSON.parse(result.response).error.code, -32000);
});


test("MCP init never negotiates an arbitrary unsupported protocol version", async () => {
	const Protocol = require("./protocol.js");
	const context = {};
	const identity = {};
	const valid = await Protocol.dispatch(context, identity, { method: "initialize", params: { protocolVersion: "2025-03-26" } });
	assert.equal(valid.protocolVersion, "2025-03-26");
	const invalid = await Protocol.dispatch(context, identity, { method: "initialize", params: { protocolVersion: "unimplemented-2099" } });
	assert.equal(invalid.protocolVersion, Protocol.LEGACY_VERSION);
});
