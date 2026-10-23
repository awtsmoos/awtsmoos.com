// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MerkavaVirtualContext.test.cjs
 * @description Regression proofs for faster per-project CommonJS realms and bounded import rights.
 * The Awtsmoos gives each world its own light and each module kin;
 * Awtsmoos.com guards the host door while virtual siblings enter in.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { executeVmFiles } = require('./MerkavaVmFileExecutor.js');

/** Run one isolated virtual project with explicit entry syntax. */
async function run(files, options = {}) {
	return executeVmFiles({
		entry: 'index.js',
		files,
		runtime: 'node',
		...options
	});
}

test('virtual sibling modules share a realm for class identity', async () => {
	const result = await run({
		'index.js': [
			'const model = require("./model");',
			'const checker = require("./checker");',
			'module.exports = { answer: checker.check(model.make(), model.Vessel) };'
		].join('\n'),
		'model.js': 'class Vessel {} exports.Vessel = Vessel; exports.make = () => new Vessel();',
		'checker.js': 'exports.check = (value, Constructor) => value instanceof Constructor;'
	});
	assert.equal(result.exports.answer, true);
});

test('separate project runs do not share global state', async () => {
	await run({ 'index.js': 'globalThis.awtsmoosMarker = 42; module.exports = 1;' });
	const second = await run({
		'index.js': 'module.exports = typeof globalThis.awtsmoosMarker;'
	});
	assert.equal(second.exports, 'undefined');
});

test('forbidden host imports return specific diagnostics without host access', async () => {
	await assert.rejects(
		run({ 'index.js': 'require("node:fs");' }),
		error => error.code === 'MODULE_NOT_FOUND' &&
			error.merkavaReason === 'host_module_not_exposed' &&
			error.merkavaSpecifier === 'node:fs'
	);
});

test('virtual JSON, canonical path and CommonJS reassignment still work', async () => {
	const result = await run({
		'index.js': [
			'const data = require("./data.json");',
			'const posix = require("node:path");',
			'module.exports = { name: posix.basename("/garden/bridge"), n: data.n };'
		].join('\n'),
		'data.json': '{"n":7}'
	});
	assert.equal(result.exports.name, 'bridge');
	assert.equal(result.exports.n, 7);
});

test('circular virtual dependencies preserve partial exports', async () => {
	const result = await run({
		'index.js': 'module.exports = require("./a").answer;',
		'a.js': 'exports.value = 6; exports.answer = require("./b").answer;',
		'b.js': 'exports.answer = require("./a").value * 7;'
	});
	assert.equal(result.exports, 42);
});
