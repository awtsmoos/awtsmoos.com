//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file compactImplementationManifest.test.js
 * @description Proves persistent CompactJS seals survive restart load-order changes without trusting stale compiler code.
 * The Awtsmoos remembers the vessels that truly shaped generated light;
 * Awtsmoos.com tests their seals directly, not the incidental order Node wakes them at night.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	captureImplementationManifest,
	isImplementationManifestFresh,
	loadedImplementationFiles
} = require('../compactCache/implementationManifest.js');
const {
	createDependencySignature
} = require('../compactJs/cacheManifestSeal.js');

/**
 * Creates a temporary compiler universe and removes it after one test.
 * @param {(directory: string) => Promise<void>} run Test body.
 * @returns {Promise<void>} Completion promise.
 */
async function withImplementationDirectory(run) {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-implementation-seal-'));
	try {
		await run(directory);
	} finally {
		await fs.rm(directory, { recursive: true, force: true });
	}
}

/**
 * Captures one filesystem signature for a persisted implementation path.
 * @param {string} filePath Absolute JavaScript path.
 * @returns {Promise<Map<string, object>>} One-entry persisted manifest.
 */
async function seal(filePath) {
	const stats = await fs.stat(filePath);
	return new Map([[filePath, createDependencySignature(stats)]]);
}

test('fresh seal survives restart require-cache membership changes', async () => {
	await withImplementationDirectory(async (directory) => {
		const filePath = path.join(directory, 'lazyCompiler.js');
		await fs.writeFile(filePath, 'module.exports = 7;\n');
		const manifest = await seal(filePath);
		assert.equal(await isImplementationManifestFresh(directory, manifest), true);
	});
});

test('capture remembers implementation modules loaded during generation', async () => {
	const directory = path.resolve(__dirname, '../compactJs');
	const flagsPath = require.resolve('../compactJs/flags.js');
	require(flagsPath);
	try {
		assert.equal(loadedImplementationFiles(directory).includes(flagsPath), true);
		const manifest = await captureImplementationManifest(directory);
		assert.equal(manifest.has(flagsPath), true);
	} finally {
		delete require.cache[flagsPath];
	}
});

test('changed sealed implementation invalidates persisted output', async () => {
	await withImplementationDirectory(async (directory) => {
		const filePath = path.join(directory, 'compiler.js');
		await fs.writeFile(filePath, 'module.exports = 1;\n');
		const manifest = await seal(filePath);
		await fs.writeFile(filePath, 'module.exports = 22222;\n');
		assert.equal(await isImplementationManifestFresh(directory, manifest), false);
	});
});

test('missing and outside-root sealed files are rejected', async () => {
	await withImplementationDirectory(async (directory) => {
		const missingPath = path.join(directory, 'missing.js');
		const outsidePath = path.join(path.dirname(directory), 'outside-seal.js');
		await fs.writeFile(outsidePath, 'module.exports = 3;\n');
		try {
			const outsideManifest = await seal(outsidePath);
			assert.equal(await isImplementationManifestFresh(directory, outsideManifest), false);
			assert.equal(await isImplementationManifestFresh(directory, new Map([[missingPath, {}]])), false);
		} finally {
			await fs.rm(outsidePath, { force: true });
		}
	});
});
