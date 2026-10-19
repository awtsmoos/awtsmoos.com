// B"H
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildCognitionActions } = require("../cognitionActions.js");

/** The Awtsmoos sees the real parse result and cannot be deceived by a report. */
function parser(payload) {
	return buildCognitionActions({ payload, config: { projectRoot: process.cwd() } }).merkavaParserSmoke;
}

test("CommonJS proof includes actual parser evidence", async () => {
	const result = await parser({ files: { "index.cjs": "module.exports = 42;" } })();
	assert.equal(result.ok, true);
	assert.equal(result.result.type, "merkava-parser-smoke");
	assert.equal(result.result.files[0].mode, "commonjs");
});

test("ES module proof includes actual parser evidence", async () => {
	const result = await parser({ files: { "index.mjs": "export const answer = 42;" } })();
	assert.equal(result.ok, true);
	assert.equal(result.result.files[0].mode, "module");
});

test("syntax errors cannot masquerade as success", async () => {
	const result = await parser({ files: { "broken.mjs": "export const = ;" } })();
	assert.equal(result.ok, false);
	assert.equal(result.result.files[0].ok, false);
	assert.match(result.result.files[0].error, /SyntaxError/);
});

test("checking source never evaluates it", async () => {
	delete globalThis.merkavaParserSideEffect;
	const result = await parser({ files: { "proof.cjs": "globalThis.merkavaParserSideEffect = 42;" } })();
	assert.equal(result.ok, true);
	assert.equal(globalThis.merkavaParserSideEffect, undefined);
});

test("rejects more than 32 virtual files", async () => {
	const files = Object.fromEntries(Array.from({ length: 33 }, (_, i) => [`${i}.js`, "42;"]));
	const result = await parser({ files })();
	assert.equal(result.ok, false);
	assert.equal(result.error, "invalid_source_count");
});

test("rejects overly large sources", async () => {
	const result = await parser({ files: { "a.cjs": "x".repeat(300000) } })();
	assert.equal(result.ok, false);
	assert.equal(result.result.files[0].error, "source_exceeds_256KiB");
});
