// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { manifestBody } = require("../agentManifest.js");
const { agentBehavior } = require("../bootstrap.js");

/**
 * @file Proves external agents remain first-class with or without WebSockets and see mission law.
 * @description The Awtsmoos gives wide and narrow transfer roads one destination while
 * Awtsmoos.com makes visible three-pass coordination part of the same machine contract.
 */
test("manifest keeps WebSocket optional and publishes mission planning", () => {
	const manifest = manifestBody();
	assert.equal(manifest.version, "1.6.0");
	assert.equal(manifest.requiredBaseCapabilities.includes("WebSocket tunnel actions"), false);
	assert.equal(manifest.recommendedCapabilities.includes("WebSocket tunnel actions"), true);
	assert.deepEqual(manifest.transportLaw.dataTransports, ["websocket", "https-get"]);
	assert.equal(manifest.transportLaw.fallbackDataTransport, "https-get");
	assert.equal(manifest.transportLaw.postAllowed, false);
	assert.deepEqual(manifest.missionPlanning.passes, [1, 2, 3]);
	assert.equal(manifest.missionPlanning.listAction, "missionVisibilityList");
	assert.equal(manifest.missionPlanning.directMessageAction, "missionAgentMessage");
});

test("manifest publishes exact GET transfer endpoint and conservative limits", () => {
	const transfer = manifestBody().largeFileTransfer;
	assert.match(transfer.getFallback.endpointTemplate, /transfer\/get\/\{routeReference\}$/);
	assert.equal(transfer.getFallback.maxRawUploadBytesPerRequest, 4096);
	assert.equal(transfer.getFallback.defaultReadBytesPerRequest, 65536);
	assert.match(transfer.sharedReceipt, /same transferId/i);
	assert.equal(transfer.postAllowed, false);
});

test("bootstrap teaches GET fallback and visible three-pass work", () => {
	const text = agentBehavior().join("\n");
	assert.match(text, /Without WebSockets use GET/);
	assert.match(text, /4096 raw bytes/);
	assert.match(text, /share transferId\/manifests/);
	assert.match(text, /missionVisibilityList/);
	assert.match(text, /planning passes 1, 2, and 3/);
	assert.match(text, /missionAgentMessage/);
	assert.match(text, /Never use POST/);
});
