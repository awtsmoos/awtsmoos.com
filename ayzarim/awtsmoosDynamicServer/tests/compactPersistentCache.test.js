//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { CompactModuleCache } = require('../compactJs/cache.js');
const compactModuleCacheKey = require('../compactJs/cacheKey.js');
const PersistentCompactStore = require('../compactCache/PersistentCompactStore.js');
const { compactCacheArtifactPath } = require('../compactCache/cacheArtifactPath.js');
const {
	countingFs,
	fixtureOptions,
	writeFixture
} = require('./compactJsCacheSupport.js');

/**
 * @file compactPersistentCache.test.js
 * @description Proves generated CompactJS survives process-like cache renewal without ever surviving dependency truth.
 * The Awtsmoos lets warm light cross a server rebirth while every source seal remains under review;
 * Awtsmoos.com breaks stale and corrupt vessels instantly, then compiles the living graph anew.
 */
async function run() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-persistent-test-'));
	const cacheRoot = path.join(root, 'cache');
	const previousRoot = process.env.AWTSMOOS_COMPACT_CACHE_DIR;
	process.env.AWTSMOOS_COMPACT_CACHE_DIR = cacheRoot;
	try {
		await verifyPersistentReuse(root);
		await verifyDependencyInvalidation(root);
		await verifyCorruptionRecovery(root);
		console.log('Compact persistent cache tests passed.');
	} finally {
		restoreCacheRoot(previousRoot);
		await fs.rm(root, { force: true, recursive: true });
	}
}

/**
 * @description Proves a fresh in-memory cache rehydrates durable source without reading authored modules again.
 * @param {string} root Temporary test universe root.
 * @returns {Promise<void>} Resolves after exact source equality and zero source-read reuse are proven.
 */
async function verifyPersistentReuse(root) {
	const fixture = await writeFixture(root, 'reuse', 'export const value = 11;');
	const store = persistentStore();
	const first = await new CompactModuleCache({ persistentStore: store }).compile(fixtureOptions(fixture, fs));
	const counter = { reads: 0 };
	const second = await new CompactModuleCache({ persistentStore: store }).compile(
		fixtureOptions(fixture, countingFs(counter))
	);
	assert.strictEqual(second, first);
	assert.strictEqual(counter.reads, 0);
}

/**
 * @description Proves a deep dependency edit invalidates persisted output and forces real source reads.
 * @param {string} root Temporary test universe root.
 * @returns {Promise<void>} Resolves after stale source is rejected and replacement source differs.
 */
async function verifyDependencyInvalidation(root) {
	const fixture = await writeFixture(root, 'renew', 'export const value = 21;');
	const store = persistentStore();
	const first = await new CompactModuleCache({ persistentStore: store }).compile(fixtureOptions(fixture, fs));
	await fs.writeFile(fixture.dependency, 'export const value = 2222;\n// renewed\n');
	const counter = { reads: 0 };
	const second = await new CompactModuleCache({ persistentStore: store }).compile(
		fixtureOptions(fixture, countingFs(counter))
	);
	assert.notStrictEqual(second, first);
	assert.ok(counter.reads >= 2);
}

/**
 * @description Proves malformed persisted JSON never blocks compilation and is replaced by truthful generated source.
 * @param {string} root Temporary test universe root.
 * @returns {Promise<void>} Resolves after corrupt persistence fails open into a valid compile.
 */
async function verifyCorruptionRecovery(root) {
	const fixture = await writeFixture(root, 'corrupt', 'export const value = 31;');
	const options = fixtureOptions(fixture, fs);
	const store = persistentStore();
	await new CompactModuleCache({ persistentStore: store }).compile(options);
	const artifact = compactCacheArtifactPath('js', compactModuleCacheKey(options));
	await fs.writeFile(artifact, '{corrupt', 'utf8');
	const source = await new CompactModuleCache({ persistentStore: store }).compile(options);
	assert.ok(source.includes('value'));
}

/** @description Creates the production-shaped durable store for CompactJS implementation sealing. @returns {PersistentCompactStore} Fresh store. */
function persistentStore() {
	return new PersistentCompactStore({
		implementationDirectory: path.resolve(__dirname, '../compactJs'),
		kind: 'js'
	});
}

/** @description Restores the caller's cache-root environment exactly. @param {string|undefined} previous Previous environment value. @returns {void} */
function restoreCacheRoot(previous) {
	if (previous === undefined) delete process.env.AWTSMOOS_COMPACT_CACHE_DIR;
	else process.env.AWTSMOOS_COMPACT_CACHE_DIR = previous;
}

run().catch((error) => {
	console.error(error.stack || error);
	process.exit(1);
});
