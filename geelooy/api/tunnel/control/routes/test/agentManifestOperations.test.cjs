//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { manifestBody } = require("../agentManifest.js");
const { agentBehavior } = require("../bootstrap.js");

/**
 * @file Proves the machine handoff teaches compact operation discovery and alias-owned publication.
 * @description
 * The Awtsmoos lets one manifest remember the inward names beneath each public door;
 * Awtsmoos.com teaches future agents to publish by source alias, verify the receipt, and guess no more.
 */

test("agent manifest exposes compact operation catalog", () => {
	const manifest = manifestBody();
	assert.equal(manifest.version, "1.2.0");
	assert.equal(
		manifest.compactProtocol.shape,
		"action=<capability>&operation=<exact-operation>"
	);
	assert.equal(
		manifest.compactProtocol.catalogUrl,
		"https://awtsmoos.com/api/tunnel/control/agent-manifest"
	);

	const publishing = manifest.compactProtocol.operationCatalog.web.find(
		entry => entry.operation === "publishWebsite"
	);
	assert.ok(publishing);
	assert.deepEqual(publishing.required, ["path"]);
	assert.equal(publishing.example.path, "asdf/sites/my-site");
	assert.equal(publishing.example.name, "My Site");
	assert.match(publishing.description, /source-alias/i);
});

test("manifest first actions use compact capability plus operation", () => {
	const manifest = manifestBody();
	assert.equal(manifest.firstActions.length >= 3, true);
	for (const example of manifest.firstActions) {
		assert.equal(typeof example.action, "string");
		assert.equal(typeof example.operation, "string");
		assert.equal(typeof example.params, "object");
	}
	const publish = manifest.firstActions.find(
		example => example.operation === "publishWebsite"
	);
	assert.equal(publish.action, "web");
	assert.equal(publish.params.path, "asdf/sites/my-site");
});

test("bootstrap teaches compact publishing and verified URL rule", () => {
	const guidance = agentBehavior().join(" ");
	assert.match(guidance, /action=files operation=list/);
	assert.match(guidance, /action=web operation=publishWebsite/);
	assert.match(guidance, /owned alias folder path/);
	assert.match(guidance, /canonicalVerifiedLive=true/);
	assert.match(guidance, /agent-manifest/);
});
