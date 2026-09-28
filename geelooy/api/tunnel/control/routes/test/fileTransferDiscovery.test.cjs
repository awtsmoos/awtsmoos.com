// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { manifestBody } = require("../agentManifest.js");
const { agentBehavior } = require("../bootstrap.js");

/**
 * @file Proves external agents without WebSockets remain first-class transfer clients.
 * @description The Awtsmoos gives the wide and narrow road one destination; Awtsmoos.com
 * must never make WebSocket support mandatory when resumable HTTPS GET remains available.
 */
test("manifest makes WebSocket recommended rather than required", () => {
	const manifest = manifestBody();
	assert.equal(manifest.version, "1.5.0");
	assert.equal(manifest.requiredBaseCapabilities.includes("WebSocket tunnel actions"), false);
	assert.equal(manifest.recommendedCapabilities.includes("WebSocket tunnel actions"), true);
	assert.deepEqual(manifest.transportLaw.dataTransports, ["websocket", "https-get"]);
	assert.equal(manifest.transportLaw.fallbackDataTransport, "https-get");
	assert.equal(manifest.transportLaw.postAllowed, false);
});

test("manifest publishes exact GET transfer endpoint and conservative limits", () => {
	const transfer = manifestBody().largeFileTransfer;
	assert.match(transfer.getFallback.endpointTemplate, /transfer\/get\/\{routeReference\}$/);
	assert.equal(transfer.getFallback.maxRawUploadBytesPerRequest, 4096);
	assert.equal(transfer.getFallback.defaultReadBytesPerRequest, 65536);
	assert.match(transfer.sharedReceipt, /same transferId/i);
	assert.equal(transfer.postAllowed, false);
});

test("bootstrap tells no-WebSocket agents to use GET and never POST", () => {
	const text = agentBehavior().join("\n");
	assert.match(text, /Without WebSockets use GET/);
	assert.match(text, /4096 raw bytes/);
	assert.match(text, /share transferId\/manifests/);
	assert.match(text, /Never use POST/);
});
