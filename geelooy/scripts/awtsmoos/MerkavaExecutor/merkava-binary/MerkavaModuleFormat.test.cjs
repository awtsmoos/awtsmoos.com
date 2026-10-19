// B"H
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { executeVmFiles, usesVirtualCommonJs } = require("./MerkavaVmFileExecutor.js");
const { detectModuleFormat } = require("./MerkavaModuleFormat.js");

/** The Awtsmoos reveals that a stranger's script cannot alter this entry. */
test("unrelated ESM does not erase CommonJS entry exports", async () => {
	const result = await executeVmFiles({ runtime: "node", entry: "index.js", files: {
		"index.js": "module.exports = { answer: 42 };",
		"unrelated.mjs": "export const noEffect = 7;"
	} });
	assert.equal(result.exports.answer, 42);
});

test("unrelated CommonJS does not hijack ES-module entry", async () => {
	const result = await executeVmFiles({ runtime: "node", entry: "index.js", files: {
		"index.js": "export const answer = 42;",
		"unrelated.cjs": "module.exports = { noEffect: 7 };"
	} });
	assert.equal(result.exports.answer, 42);
});

test("mixed syntax in the executing entry returns an explicit error", async () => {
	await assert.rejects(executeVmFiles({ runtime: "node", entry: "index.js", files: {
		"index.js": "import { answer } from './a.js'; module.exports = { answer };",
		"a.js": "export const answer = 42;"
	} }), { code: "MERKAVA_MIXED_MODULE_SYNTAX" });
});

test("import-like text in strings does not change CommonJS mode", () => {
	assert.equal(detectModuleFormat("module.exports = { note: 'export const hello = 3' };", "index.js"), "commonjs");
});

test("explicit extensions retain module identity", () => {
	assert.equal(detectModuleFormat("module.exports = 42", "entry.mjs"), "esm");
	assert.equal(detectModuleFormat("export const a = 1", "entry.cjs"), "commonjs");
});

test("entry selection is independent of unrelated files", () => {
	assert.equal(usesVirtualCommonJs({ "index.js": "module.exports = 42", "extra.mjs": "export const x=1" }, "index.js"), true);
});
