//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { OAUTH_SCOPE_DESCRIPTIONS } = require("../../../geelooy/api/tunnel/shared/scopeCatalog.js");
const Support = require("./renderControlSupport.cjs");
const Renderer = require("./renderControlOpenApi.cjs");

/** Ensure new API scopes reach freshly built public OAuth consent documents. */
test("OpenAPI advertises exactly the canonical OAuth scope catalog", () => {
	const declared = Support.oauthScopeLines();
	assert.equal(declared.length, Object.keys(OAUTH_SCOPE_DESCRIPTIONS).length);
	for (const [scope, description] of Object.entries(OAUTH_SCOPE_DESCRIPTIONS)) {
		assert(declared.includes(`            ${scope}: ${JSON.stringify(description)}`));
	}
	assert(declared.some(line => line.includes("awtsmoos.api:")));
});

test("generated schema binds OAuth authority to the advertised authorization endpoint", () => {
	const yaml = Renderer.render(["commandRun"]);
	assert(yaml.includes("authorizationUrl: https://awtsmoos.com/api/oauth/authorize"));
	assert(yaml.includes("            awtsmoos.api:"));
	assert(yaml.includes("            tunnel.command:"));
});
