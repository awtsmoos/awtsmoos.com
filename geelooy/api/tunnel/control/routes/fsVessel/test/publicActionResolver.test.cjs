// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Resolver = require("../publicActionResolver.js");

/**
 * @file Proves compact capability requests resolve to exact internal operations before routing.
 * @description
 * The Awtsmoos lets a small outward name become one precise inward deed; Awtsmoos.com
 * preserves lineage, rejects crossed families, and keeps old exact callers free of needless creed.
 */
const manifest = {
	fs: ["read", "httpRequest", "agentDoctor", "nativeGenerationReplace"],
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

test("JSON params carrier can provide compact operation", () => {
	const result = Resolver.resolve({
		action: "status",
		params: JSON.stringify({ operation: "agentDoctor" })
	}, manifest);
	assert.equal(result.ok, true);
	assert.equal(result.payload.action, "agentDoctor");
});

test("family mismatch and missing operation are rejected", () => {
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
