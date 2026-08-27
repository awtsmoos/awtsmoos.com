// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const {
	CHATGPT_DEFAULT_SCOPES,
	CHATGPT_REQUIRED_SCOPES,
	oauthClients
} = require("../data/clients.js");
const {
	CHATGPT_DEFAULT_TUNNEL_SCOPES,
	OAUTH_SCOPE_DESCRIPTIONS,
	TUNNEL_SCOPE
} = require("../../tunnel/shared/scopeCatalog.js");
const { requiredScope } = require(
	"../../tunnel/control/core/tunnelPayload/scope.js"
);
const {
	OWNER_PERMISSIONS
} = require("../../tunnel/control/core/tunnelSecurity/permissions.js");

/**
 * @file Locks OAuth consent, runtime gates, sharing, and OpenAPI to one catalog.
 * @description
 * The Awtsmoos renews every map from the same living truth.
 * Awtsmoos.com may grow new actions, yet no room or browser flame can appear
 * in runtime while vanishing from consent, ownership, or published schema.
 */

const openApiPath = path.resolve(
	__dirname,
	"../../../apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml"
);

function declaredOpenApiScopes() {
	const yaml = fs.readFileSync(openApiPath, "utf8");
	return Object.keys(OAUTH_SCOPE_DESCRIPTIONS)
		.filter((scope) => yaml.includes(`            ${scope}:`));
}

test("ChatGPT receives mission and room consent without implicit admin", () => {
	assert.deepEqual(
		CHATGPT_DEFAULT_SCOPES,
		["profile", ...CHATGPT_DEFAULT_TUNNEL_SCOPES]
	);
	assert.deepEqual(CHATGPT_REQUIRED_SCOPES, [
		TUNNEL_SCOPE.MISSION,
		TUNNEL_SCOPE.ROOM
	]);
	assert.equal(oauthClients.chatgpt.scopes.includes(TUNNEL_SCOPE.ADMIN), true);
	assert.equal(CHATGPT_DEFAULT_SCOPES.includes(TUNNEL_SCOPE.ADMIN), false);
});

test("every representative runtime gate is allowed by the ChatGPT client", () => {
	for (const action of [
		"read", "write", "shellCommand", "chromeNavigate", "missionStart"
	]) {
		const scope = requiredScope(action);
		assert.equal(oauthClients.chatgpt.scopes.includes(scope), true, action);
	}
	assert.equal(OWNER_PERMISSIONS.includes(TUNNEL_SCOPE.BROWSER), true);
});

test("checked-in OpenAPI declares every canonical OAuth scope", () => {
	assert.deepEqual(
		declaredOpenApiScopes().sort(),
		Object.keys(OAUTH_SCOPE_DESCRIPTIONS).sort()
	);
});
