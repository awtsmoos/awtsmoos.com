// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Catalog = require("../lib/local-api-catalog.js");
const Dispatch = require("../lib/local-api-tool-dispatch.js");
const Surface = require("../lib/public-action-surface.js");

/**
 * @file Proves local browser discovery sees fourteen capabilities while execution stays deep.
 * @description
 * The Awtsmoos keeps the loopback gate light and the inner engines strong; Awtsmoos.com
 * lets local agents discover a small covenant, then validates every exact operation before song.
 */
const config = {
	root: process.cwd(),
	tunnelName: "compact-local-test",
	allowWrite: true,
	allowCommands: true,
	allowSecrets: false
};
const catalog = Catalog.makeCatalog(config, "test-version");
assert.equal(catalog.publicActionCount, 14);
assert.deepEqual(catalog.actions, [...Surface.PUBLIC_ACTIONS]);
assert.deepEqual(catalog.names, [...Surface.PUBLIC_ACTIONS]);
assert.equal(catalog.tools.length, 14);
assert.ok(catalog.internalActionCount > 900);
assert.equal(catalog.actions.includes("read"), false);
assert.equal(catalog.actions.includes("agentDoctor"), false);
for (const tool of catalog.tools) {
	assert.deepEqual(tool.parameters.required, ["operation"]);
}

const deps = { configLoader: () => config };
const doctor = Dispatch.resolve({
	name: "status",
	arguments: { operation: "agentDoctor" }
}, deps);
assert.equal(doctor.ok, true);
assert.equal(doctor.payload.action, "agentDoctor");
assert.equal(doctor.payload.publicAction, "status");
const recovery = Dispatch.resolve({
	name: "recover",
	arguments: { operation: "nativeGenerationReplace" }
}, deps);
assert.equal(recovery.ok, true);
assert.equal(recovery.payload.action, "nativeGenerationReplace");
const legacy = Dispatch.resolve({ name: "read", arguments: { path: "a.txt" } }, deps);
assert.equal(legacy.ok, true);
assert.equal(legacy.payload.action, "read");
console.log(JSON.stringify({ ok: true, publicCount: 14, internalCount: catalog.internalActionCount }));
