// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies headless Device Authorization across Tunnel Control discovery.
 * @description
 * The Awtsmoos joins machine manifest, bootstrap, human docs, OpenAPI, and UI;
 * these tests prove Awtsmoos.com reveals the same device-consent path everywhere
 * without silently granting the legacy ChatGPT compatibility client a new grant.
 */

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { DEVICE_GRANT_TYPE } = require("../../../oauth/core/devicePolicy.js");
const { apiCatalog } = require("../docs/catalog.js");
const { manifestBody } = require("../routes/agentManifest.js");
const {
	bootstrap,
	headlessDeviceFlow
} = require("../routes/bootstrap.js");
const OpenApiMetadata = require("../routes/openApiAgentMetadata.js");
const { docsPage } = require("../views/docsPage.js");

test("catalog advertises device grant only for intended public-agent clients", () => {
	assert.equal(apiCatalog.oauth.externalAgent.deviceAuthorization, true);
	assert.equal(apiCatalog.oauth.grok.deviceAuthorization, true);
	assert.equal(apiCatalog.oauth.chatgpt.deviceAuthorization, false);
	assert.equal(apiCatalog.oauth.deviceGrantType, DEVICE_GRANT_TYPE);
	assert.match(apiCatalog.oauth.deviceAuthorizationEndpoint, /device-authorization$/);
	assert.match(apiCatalog.agentLinks.deviceLogin, /\/api\/oauth\/device$/);
});

test("machine manifest exposes callback and headless authorization modes", () => {
	const manifest = manifestBody();
	assert.ok(manifest.authorizationModes.callbackPkce);
	assert.ok(manifest.authorizationModes.headlessDevice);
	assert.equal(
		manifest.authorizationModes.headlessDevice.flow.grantType,
		DEVICE_GRANT_TYPE
	);
	assert.match(manifest.oauth.deviceAuthorization, /device-authorization$/);
	assert.match(manifest.oauth.deviceVerification, /\/api\/oauth\/device$/);
	assert.equal(manifest.credentials.deviceVerificationStoresTokens, false);
});

test("bootstrap and device flow teach polling and immutable routing", async () => {
	const body = JSON.parse(await bootstrap({}));
	assert.equal(body.headlessDevice.grantType, DEVICE_GRANT_TYPE);
	assert.match(body.deviceLogin, /\/api\/oauth\/device$/);
	assert.match(body.headlessDevice.steps.join(" "), /slow_down/);
	assert.match(body.headlessDevice.steps.join(" "), /my-device/);
	assert.match(body.headlessDevice.steps.join(" "), /routeReference/);
	assert.equal(headlessDeviceFlow().initialInterval, 5);
});

test("human docs explain pending slow-down and device verification", () => {
	const page = docsPage(apiCatalog);
	assert.match(page, /Headless AI: Device Authorization/);
	assert.match(page, /authorization_pending/);
	assert.match(page, /slow_down/);
	assert.match(page, /Enter Device Code/);
	assert.match(page, /device-authorization/);
});

test("served OpenAPI advertises headless OAuth beside callback mode", () => {
	const source = [
		"openapi: 3.1.0",
		"info:",
		"  title: Legacy title",
		"  description: Existing guidance.",
		"          authorizationUrl: https://awtsmoos.com/api/oauth/start"
	].join("\n");
	const enriched = OpenApiMetadata.enrichYaml(source);
	assert.match(enriched, /Device Authorization/);
	assert.match(enriched, /device-authorization/);
	assert.match(enriched, /api\/oauth\/device/);
});

test("authenticated navigation exposes device login and headless guide", () => {
	const source = fs.readFileSync(
		path.resolve(__dirname, "../../../../apps/tunnel-control/js/shell/agentLinks.js"),
		"utf8"
	);
	assert.match(source, /Device Login/);
	assert.match(source, /Headless AI Guide/);
	assert.match(source, /\/api\/oauth\/device/);
});
