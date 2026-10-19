// B"H
/**
 * @file MerkavaVirtualRequire.test.js
 * @description Regression coverage for bounded virtual CommonJS and mixed-file
 * loader selection without access to the host module loader.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const { executeVmFiles, usesVirtualCommonJs } = require("./MerkavaVmFileExecutor.js");

/** Evaluate one self-contained virtual project. */
async function run(files, entry = "index.js") {
	return executeVmFiles({ files, entry, runtime: "node" });
}

test("CommonJS require loads a sibling and returns module.exports", async () => {
	const result = await run({
		"index.js": "const helper = require('./helper'); module.exports = { answer: helper.value + 1 };",
		"helper.js": "exports.value = 41;"
	});
	assert.equal(result.exports.answer, 42);
});

test("CommonJS module cache handles a circular pair", async () => {
	const result = await run({
		"index.js": "const a = require('./a'); module.exports = { answer: a.other };",
		"a.js": "exports.value = 21; exports.other = require('./b').answer;",
		"b.js": "exports.answer = require('./a').value * 2;"
	});
	assert.equal(result.exports.answer, 42);
});

test("require cannot import arbitrary host Node modules", async () => {
	await assert.rejects(run({
		"index.js": "module.exports = require('node:child_process');"
	}), { code: "MODULE_NOT_FOUND" });
});

test("missing virtual modules produce module-not-found errors", async () => {
	await assert.rejects(run({
		"index.js": "require('./does-not-exist');"
	}), { code: "MODULE_NOT_FOUND" });
});

test("ES module sources retain their original executor", async () => {
	const files = { "index.js": "export const answer = 42;" };
	assert.equal(usesVirtualCommonJs(files, "index.js"), false);
	const result = await run(files);
	assert.equal(result.exports.answer, 42);
});

test("CommonJS entrypoint survives unrelated ESM modules in the same virtual file set", async () => {
	const files = {
		"index.js": "module.exports = require('./helper.js');",
		"helper.js": "exports.answer = 42;",
		"unused.mjs": "export const unrelated = 99;"
	};
	assert.equal(usesVirtualCommonJs(files, "index.js"), true);
	const result = await run(files);
	assert.equal(result.exports.answer, 42);
});

test("ESM entrypoint survives unrelated CommonJS modules in the same virtual file set", async () => {
	const files = {
		"index.js": "export const answer = 42;",
		"unused.cjs": "module.exports = { unrelated: 99 };"
	};
	assert.equal(usesVirtualCommonJs(files, "index.js"), false);
	const result = await run(files);
	assert.equal(result.exports.answer, 42);
});

test("virtual CommonJS import restrictions survive mixed-file selection", async () => {
	await assert.rejects(run({
		"index.js": "module.exports = require('node:child_process');",
		"unrelated.mjs": "export const exists = true;"
	}), { code: "MODULE_NOT_FOUND" });
});
