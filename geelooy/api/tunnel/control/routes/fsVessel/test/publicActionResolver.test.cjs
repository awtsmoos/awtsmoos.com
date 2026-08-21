//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Resolver = require("../publicActionResolver.js");

/**
 * @file Proves compact capabilities resolve to truthful inward operations before native routing.
 * @description
 * The Awtsmoos lets files remain files and publication enter through web without crossed disguise;
 * Awtsmoos.com rejects wrong families while legacy exact callers keep their original rise.
 */
const manifest = {
	fs: [
		"read",
		"httpRequest",
		"publishWebsite",
		"publicRootPublishFolder",
		"sitePublishFolder",
		"agentDoctor",
		"nativeGenerationReplace"
	],
	command: ["commandRun"],
	chrome: ["chromeClick"],
	relay: [],
	streaming: []
};

test("compact files request resolves before native routing", () => {
	const result = Resolver.resolve({
		action: "files",
		operation: "read",
		path: "hello.txt"
	}, manifest);
	assert.equal(result.ok, true);
	assert.equal(result.compact, true);
	assert.equal(result.payload.action, "read");
	assert.equal(result.payload.executionAction, "read");
	assert.equal(result.payload.publicAction, "files");
	assert.equal(result.payload.requestAction, "files");
	assert.equal(result.payload.path, "hello.txt");
});

test("publication operations belong to compact web capability", () => {
	for (const operation of [
		"publishWebsite",
		"publicRootPublishFolder",
		"sitePublishFolder"
	]) {
		const result = Resolver.resolve({ action: "web", operation }, manifest);
		assert.equal(result.ok, true, operation);
		assert.equal(result.payload.action, operation);
		assert.equal(result.payload.publicAction, "web");
	}
});

test("network stays web and publication rejects crossed files family", () => {
	const network = Resolver.resolve({ action: "web", operation: "httpRequest" }, manifest);
	assert.equal(network.ok, true);
	assert.equal(network.payload.action, "httpRequest");

	const mismatch = Resolver.resolve({
		action: "files",
		operation: "publishWebsite"
	}, manifest);
	assert.equal(mismatch.ok, false);
	assert.equal(mismatch.error, "compact_operation_family_mismatch");
	assert.equal(mismatch.expectedFamily, "web");
});

test("JSON params carrier can provide compact operation", () => {
	const result = Resolver.resolve({
		action: "status",
		params: JSON.stringify({ operation: "agentDoctor" })
	}, manifest);
	assert.equal(result.ok, true);
	assert.equal(result.payload.action, "agentDoctor");
});

test("missing operation and unrelated family mismatch are rejected", () => {
	const mismatch = Resolver.resolve({ action: "files", operation: "commandRun" }, manifest);
	assert.equal(mismatch.ok, false);
	assert.equal(mismatch.error, "compact_operation_family_mismatch");
	assert.equal(mismatch.expectedFamily, "command");
	const missing = Resolver.resolve({ action: "files" }, manifest);
	assert.equal(missing.ok, false);
	assert.equal(missing.error, "compact_operation_required");
});

test("legacy exact internal action remains unchanged", () => {
	const payload = { action: "read", path: "legacy.txt" };
	const result = Resolver.resolve(payload, manifest);
	assert.equal(result.ok, true);
	assert.equal(result.compact, false);
	assert.equal(result.payload, payload);
});
