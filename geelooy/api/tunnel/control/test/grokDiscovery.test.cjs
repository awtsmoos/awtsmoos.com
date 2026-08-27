// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies universal AI discovery while preserving Grok compatibility.
 * @description
 * The Awtsmoos joins machine truth and human words; these tests prove
 * Awtsmoos.com recommends one provider-neutral client without erasing the Grok
 * garment or the immutable routing covenant already revealed to existing agents.
 */

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { apiCatalog } = require("../docs/catalog.js");
const OpenApiMetadata = require("../routes/openApiAgentMetadata.js");
const {
	externalAgentFlow,
	grokFlow,
	routeInstructions
} = require("../routes/bootstrap.js");
const { manifestBody } = require("../routes/agentManifest.js");
const { docsPage } = require("../views/docsPage.js");
const { escapeHtml } = require("../views/docsEscape.js");

test("machine catalog recommends universal client and preserves Grok", () => {
	assert.equal(apiCatalog.recommendedClientId, "external-agent");
	assert.equal(apiCatalog.oauth.externalAgent.clientId, "external-agent");
	assert.equal(apiCatalog.oauth.externalAgent.requiresClientSecret, false);
	assert.equal(apiCatalog.oauth.externalAgent.pkceRequired, true);
	assert.equal(apiCatalog.oauth.externalAgent.pkceMethod, "S256");
	assert.equal(apiCatalog.oauth.grok.clientId, "grok");
	assert.equal(apiCatalog.oauth.grok.pkceRequired, true);
	assert.match(apiCatalog.agentLinks.oauthMetadata, /oauth-authorization-server$/);
	assert.match(apiCatalog.agentLinks.agentManifest, /agent-manifest$/);
});

test("bootstrap teaches universal state PKCE and immutable routing", () => {
	const universal = externalAgentFlow();
	const grok = grokFlow();
	const routing = routeInstructions().join(" ");
	assert.equal(universal.clientId, "external-agent");
	assert.equal(universal.pkce.required, true);
	assert.equal(universal.pkce.method, "S256");
	assert.equal(universal.state.required, true);
	assert.match(universal.steps.join(" "), /code_verifier/);
	assert.match(universal.steps.join(" "), /Verify returned state/);
	assert.equal(grok.clientId, "grok");
	assert.match(routing, /routeReference/);
	assert.match(routing, /tunnelId/);
});

test("agent manifest is sufficient for an unknown compatible AI", () => {
	const manifest = manifestBody();
	assert.equal(manifest.recommendedClientId, "external-agent");
	assert.match(manifest.protocol, /external-agent/);
	assert.ok(manifest.requiredClientCapabilities.includes("PKCE S256"));
	assert.equal(manifest.oauth.client.clientId, "external-agent");
	assert.match(manifest.tunnelDiscovery.url, /my-device$/);
	assert.equal(manifest.firstActions[0].action, "list");
	assert.equal(manifest.compatibilityClients.grok.clientId, "grok");
});

test("human docs lead with universal client and immutable routing", () => {
	const page = docsPage(apiCatalog);
	assert.match(page, /Universal AI Agent API/);
	assert.match(page, /client_id=external-agent/);
	assert.match(page, /Any external AI client/);
	assert.match(page, /OAuth Metadata/);
	assert.match(page, /Agent Manifest/);
	assert.match(page, /routeReference/);
});

test("served OpenAPI recommends universal client and correct authorize route", () => {
	const source = [
		"openapi: 3.1.0",
		"info:",
		"  title: Awtsmoos Tunnel Control GPT Actions",
		"  description: Existing action guidance.",
		"          authorizationUrl: https://awtsmoos.com/api/oauth/start"
	].join("\n");
	const enriched = OpenApiMetadata.enrichYaml(source);
	assert.match(enriched, /Universal Agent API/);
	assert.match(enriched, /client_id=external-agent/);
	assert.match(enriched, /PKCE S256/);
	assert.match(enriched, /oauth-authorization-server/);
	assert.match(enriched, /api\/oauth\/authorize/);
	assert.doesNotMatch(enriched, /authorizationUrl: .*oauth\/start/);
});

test("authenticated navigation keeps universal discovery links after boot", () => {
	const source = fs.readFileSync(
		path.resolve(__dirname, "../../../../apps/tunnel-control/js/shell/agentLinks.js"),
		"utf8"
	);
	assert.match(source, /External AI \/ Agent API/);
	assert.match(source, /oauth-authorization-server/);
	assert.match(source, /agent-manifest/);
	assert.match(source, /\/api\/tunnel\/control\/openapi/);
});

test("dynamic documentation text is escaped", () => {
	assert.equal(
		escapeHtml("<script>alert('x')</script>"),
		"&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;"
	);
});
