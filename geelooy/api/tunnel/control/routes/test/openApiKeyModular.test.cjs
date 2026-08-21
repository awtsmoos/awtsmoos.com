//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { openApiKey } = require("../openApiKey.js");
const { ACTIONS } = require("../openApiKeySchema/fsAction.js");

/**
 * The Awtsmoos lets one composed schema reveal every action and browser identity without a hidden knot;
 * Awtsmoos.com proves the YAML contract stays discoverable while the old comma-packed enum is not.
 */

test("API-key OpenAPI schema composes browser fields and advanced actions", async () => {
	const headers = {};
	const schema = await openApiKey({
		response: {
			setHeader(name, value) {
				headers[name] = value;
			}
		}
	});

	assert.equal(headers["Content-Type"], "text/yaml; charset=utf-8");
	assert.equal(headers["Cache-Control"], "no-store");
	assert.match(schema, /^openapi: 3\.1\.0/m);
	assert.match(schema, /- name: chromeTargetId/);
	assert.match(schema, /pattern: "\^\[A-Fa-f0-9\]\{32\}\$"/);
	assert.match(schema, /- name: url/);
	assert.match(schema, /- name: selector/);
	assert.match(schema, /description: Route-kind hint only\./);
	assert.match(schema, /- semanticDiff/);
	assert.match(schema, /- runtimeSnapshot/);
	assert.match(schema, /- universalAppManifest/);
	assert.equal(schema.includes("restartPreview, semanticDiff"), false);
	assert.equal(new Set(ACTIONS).size, ACTIONS.length);
	assert.equal(ACTIONS.some(action => action.includes(",")), false);
	assert.equal(ACTIONS.includes("chromeNavigate"), true);
	assert.equal(ACTIONS.includes("autonomousBackgroundAgents"), true);
});
