//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { bootstrap } = require("../routes/bootstrap.js");
const { manifestBody } = require("../routes/agentManifest.js");
const OpenApiMetadata = require("../routes/openApiAgentMetadata.js");
const Resource = require("../mcp/resource.js");

/**
 * @file Guards additive MCP discovery without erasing inherited agent contracts.
 * @description
 * The Awtsmoos lets a new river join without draining the streams before;
 * Awtsmoos.com tests MCP beside transfer, recovery, rooms, and every older door.
 */

async function bootstrapBody(userAgent = "Claude-Remote-MCP") {
	const response = await bootstrap({
		request: { headers: { "user-agent": userAgent } }
	});
	return JSON.parse(response);
}

test("generic bootstrap separates MCP POST while preserving direct-agent law", async () => {
	const body = await bootstrapBody();
	const behavior = body.agentBehavior.join(" ");
	const recovery = body.howToGetRouteReference.join(" ");
	assert.equal(body.callerDetected, "generic-agent");
	assert.equal(body.recommendedClientId, "external-agent");
	assert.equal(body.mcp.endpoint, Resource.MCP_RESOURCE);
	assert.deepEqual(body.mcp.httpMethods, ["POST"]);
	assert.deepEqual(body.transportLaw.httpMethods, ["GET"]);
	assert.equal(body.transportLaw.purpose, "legacy-direct-control");
	assert.match(behavior, /MCP.*POST/i);
	assert.match(behavior, /GET and WebSocket share transferId\/manifests/);
	assert.match(behavior, /canonicalVerifiedLive=true/);
	assert.match(recovery, /Virtual OS.*nativeRecoveryPending=true/);
	assert.match(recovery, /never blind-replay/i);
});

test("ChatGPT compatibility guidance remains complete and separate", async () => {
	const body = await bootstrapBody("OpenAI ChatGPT Action");
	const behavior = body.agentBehavior.join(" ");
	assert.equal(body.callerDetected, "chatgpt");
	assert.equal(body.recommendedClientId, "chatgpt");
	assert.match(behavior, /not_authenticated/);
	assert.match(behavior, /more than one live tunnel/);
	assert.match(behavior, /OpenAI attaches the stored OAuth credential automatically/);
});

test("agent manifest exposes OAuth-discoverable Streamable HTTP MCP", () => {
	const manifest = manifestBody();
	assert.equal(manifest.version, "1.9.0");
	assert.equal(manifest.mcp.transport, "streamable-http");
	assert.deepEqual(manifest.mcp.httpMethods, ["POST"]);
	assert.equal(
		manifest.mcp.authorization.protectedResourceMetadata,
		Resource.PROTECTED_RESOURCE_METADATA
	);
	assert.equal(manifest.transportLaw.purpose, "legacy-direct-control");
	assert.equal(manifest.transportLaw.postAllowed, false);
});

test("OpenAPI keeps WebSocket, publication, room guidance and adds MCP", () => {
	const source = [
		"openapi: 3.1.0",
		"info:",
		"  title: Old title",
		"  description: Existing guidance.",
		"          authorizationUrl: https://awtsmoos.com/api/oauth/start"
	].join("\n");
	const enriched = OpenApiMetadata.enrichYaml(source);
	assert.match(enriched, /x-awtsmoos-mcp-url: https:\/\/awtsmoos\.com\/api\/tunnel\/control\/mcp/);
	assert.match(enriched, /x-awtsmoos-mcp-http-method: POST/);
	assert.match(enriched, /oauth-protected-resource\/api\/tunnel\/control\/mcp/);
	assert.match(enriched, /CLIENT_UPLOAD_BEGIN/);
	assert.match(enriched, /publishWebsite/);
	assert.match(enriched, /SHARED AGENT ROOM/);
	assert.match(enriched, /legacy direct-control OAuth and compact control remain GET-only/i);
});
