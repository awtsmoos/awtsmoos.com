//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { openApiKey } = require("../openApiKey.js");
const {
	ACTIONS,
	NETWORK_ACTIONS,
	PUBLICATION_ACTIONS
} = require("../openApiKeySchema/fsAction.js");

/**
 * The Awtsmoos lets one composed schema reveal publishing, network, browser, and advanced deeds in light;
 * Awtsmoos.com proves first-class parameters stay discoverable while duplicate shadows remain out of sight.
 */

test("API-key OpenAPI exposes publication, network, and browser contracts", async () => {
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
	assert.match(schema, /- publishWebsite/);
	assert.match(schema, /- publicRootPublishFolder/);
	assert.match(schema, /- httpRequest/);
	assert.match(schema, /- name: path/);
	assert.match(schema, /- name: name/);
	assert.match(schema, /- name: publicPath/);
	assert.match(schema, /- name: verify/);
	assert.match(schema, /- name: method/);
	assert.match(schema, /- name: headers/);
	assert.match(schema, /- name: body/);
	assert.match(schema, /- name: chromeTargetId/);
	assert.match(schema, /- name: url/);
	assert.match(schema, /- name: selector/);
	assert.match(schema, /description: Route-kind hint only\./);
	assert.match(schema, /- semanticDiff/);
	assert.match(schema, /- runtimeSnapshot/);
	assert.match(schema, /- universalAppManifest/);
	assert.equal(new Set(ACTIONS).size, ACTIONS.length);
	assert.equal(ACTIONS.some(action => action.includes(",")), false);
	assert.equal(PUBLICATION_ACTIONS.includes("publishWebsite"), true);
	assert.equal(NETWORK_ACTIONS.includes("httpRequest"), true);
	assert.equal(ACTIONS.includes("chromeNavigate"), true);
	assert.equal(ACTIONS.includes("autonomousBackgroundAgents"), true);
});
