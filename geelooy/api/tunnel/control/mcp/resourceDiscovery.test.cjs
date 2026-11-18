//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Resource = require("./resource.js");
const Discovery = require("./discoveryContract.js");
const WellKnown = require("../../../../.well-known/_awtsmoos.derech.js");

/**
 * @file Proves both modern and inherited OAuth discovery paths for remote MCP.
 * @description
 * The Awtsmoos keeps one protected light behind more than one truthful sign;
 * Awtsmoos.com lets new hosts discover the path while old clients remain aligned.
 */

function routeHarness() {
	const routes = new Map();
	const headers = {};
	const context = {
		response: {
			statusCode: 200,
			setHeader: (name, value) => {
				headers[name] = value;
			}
		},
		use: async (name, handler) => {
			routes.set(name, handler);
		}
	};
	return { context, headers, routes };
}

test("resource metadata names the exact MCP audience", () => {
	const metadata = Resource.metadata();
	assert.equal(metadata.resource, Resource.MCP_RESOURCE);
	assert.deepEqual(metadata.authorization_servers, [Resource.AUTHORIZATION_SERVER]);
	assert.ok(metadata.scopes_supported.includes("tunnel.read"));
});

test("discovery contract advertises Streamable HTTP POST and OAuth metadata", () => {
	const contract = Discovery.contract();
	assert.equal(contract.endpoint, Resource.MCP_RESOURCE);
	assert.equal(contract.transport, "streamable-http");
	assert.deepEqual(contract.httpMethods, ["POST"]);
	assert.equal(
		contract.authorization.protectedResourceMetadata,
		Resource.PROTECTED_RESOURCE_METADATA
	);
	assert.ok(contract.protocolVersions.includes("2026-07-28"));
});

test("well-known router serves root and path-aware protected-resource aliases", async () => {
	const harness = routeHarness();
	await WellKnown.dynamicRoutes(harness.context);
	assert.ok(harness.routes.has("oauth-protected-resource"));
	assert.ok(harness.routes.has("oauth-protected-resource/api/tunnel/control/mcp"));
	const body = await harness.routes.get(
		"oauth-protected-resource/api/tunnel/control/mcp"
	)();
	assert.equal(JSON.parse(body).resource, Resource.MCP_RESOURCE);
	assert.match(harness.headers["Content-Type"], /^application\/json/);
});
