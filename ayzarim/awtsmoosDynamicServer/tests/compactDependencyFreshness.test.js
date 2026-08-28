//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file compactDependencyFreshness.test.js
 * @description Proves packed JS and folded CSS reuse unchanged graphs yet invalidate on same-size deep replacements while filesystem time precision may vary by a millisecond.
 * The Awtsmoos renews hidden dependencies beneath one visible doorway; Awtsmoos.com therefore lets no stale child remain concealed in a warm cache,
 * while unchanged source rests peacefully in memory and avoids needless rereading of the same revealed light.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { CompactStylesheetCache } = require('../compactCss/cache.js');
const { CompactModuleCache } = require('../compactJs/cache.js');

/** @returns {{fs: object, reads: () => number}} Filesystem witness counting source reads while preserving other fs behavior. */
function createReadWitness() {
	let readCount = 0;
	const witnessedFs = new Proxy(fs, {
		get(target, property) {
			if (property === 'readFile') {
				return async (...args) => {
					readCount += 1;
					return target.readFile(...args);
				};
			}
			const value = target[property];
			return typeof value === 'function' ? value.bind(target) : value;
		}
	});
	return { fs: witnessedFs, reads: () => readCount };
}

/**
 * @description Normalizes one source mtime to millisecond precision before its manifest is captured.
 * @param {string} filePath Source path whose mtime becomes deterministic.
 * @returns {Promise<void>} Completion after mtime normalization.
 */
async function normalizeMtime(filePath) {
	const stats = await fs.stat(filePath);
	const normalized = new Date(Math.floor(stats.mtimeMs));
	await fs.utimes(filePath, stats.atime, normalized);
}

/**
 * @description Replaces one file with same-size bytes while preserving mtime within filesystem precision and changing inode identity.
 * @param {string} filePath Source path to replace atomically.
 * @param {string} source Equal-length replacement source.
 * @returns {Promise<void>} Completion after replacement invariants are proven.
 */
async function replacePreservingMtime(filePath, source) {
	const before = await fs.stat(filePath);
	const replacement = `${filePath}.renewed`;
	await fs.writeFile(replacement, source);
	await fs.utimes(replacement, before.atime, before.mtime);
	await fs.rename(replacement, filePath);
	const after = await fs.stat(filePath);
	assert.equal(after.size, before.size);
	assert.ok(Math.abs(after.mtimeMs - before.mtimeMs) <= 1);
	assert.notEqual(after.ino, before.ino);
}

test('CompactJS reuses an unchanged graph and busts on a same-size deep replacement', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-js-cache-'));
	try {
		const entryFile = path.join(root, 'entry.js');
		const childFile = path.join(root, 'child.js');
		await fs.writeFile(entryFile, 'import { VALUE } from "./child.js";\nglobalThis.__CACHE_VALUE__ = VALUE;\n');
		await fs.writeFile(childFile, 'export const VALUE = "RED";\n');
		await normalizeMtime(childFile);
		const witness = createReadWitness();
		const cache = new CompactModuleCache();
		const options = { entryFile, fs: witness.fs, rootDir: root };
		const first = await cache.compile(options);
		const firstReads = witness.reads();
		const second = await cache.compile(options);
		assert.equal(second, first);
		assert.equal(witness.reads(), firstReads);
		await replacePreservingMtime(childFile, 'export const VALUE = "TAN";\n');
		const renewed = await cache.compile(options);
		assert.notEqual(renewed, first);
		assert.match(renewed, /TAN/);
		assert.ok(witness.reads() > firstReads);
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});

test('CompactCSS reuses folded imports and busts on a same-size nested replacement', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-css-cache-'));
	try {
		const entryFile = path.join(root, 'entry.css');
		const childFile = path.join(root, 'child.css');
		await fs.writeFile(entryFile, '@import "./child.css";\nbody { display: block; }\n');
		await fs.writeFile(childFile, '.card { color: red; }\n');
		await normalizeMtime(childFile);
		const witness = createReadWitness();
		const cache = new CompactStylesheetCache();
		const options = { entryFile, fs: witness.fs, rootDir: root };
		const first = await cache.compile(options);
		const firstReads = witness.reads();
		const second = await cache.compile(options);
		assert.equal(second, first);
		assert.equal(witness.reads(), firstReads);
		await replacePreservingMtime(childFile, '.card { color: tan; }\n');
		const renewed = await cache.compile(options);
		assert.notEqual(renewed, first);
		assert.match(renewed, /color: tan/);
		assert.ok(witness.reads() > firstReads);
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
});
