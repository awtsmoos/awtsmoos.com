//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { CompactStylesheetCache } = require('../compactCss/cache.js');
const PersistentCompactStore = require('../compactCache/PersistentCompactStore.js');

/**
 * @file compactPersistentCss.test.js
 * @description Proves folded CSS can survive cache-object renewal while a nested stylesheet edit still destroys stale persistence.
 * The Awtsmoos remembers the cascade only while every imported garment stays true;
 * Awtsmoos.com renews one deep sheet and the persisted river must immediately compile anew.
 */
async function run() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-persistent-css-'));
	const previousRoot = process.env.AWTSMOOS_COMPACT_CACHE_DIR;
	process.env.AWTSMOOS_COMPACT_CACHE_DIR = path.join(root, 'cache');
	try {
		await verifyPersistentCssReuse(root);
		await verifyPersistentCssInvalidation(root);
		console.log('Compact persistent CSS tests passed.');
	} finally {
		restoreCacheRoot(previousRoot);
		await fs.rm(root, { force: true, recursive: true });
	}
}

/**
 * @description Proves a fresh CSS cache object rehydrates an identical persisted cascade.
 * @param {string} root Temporary test universe root.
 * @returns {Promise<void>} Resolves after identical durable reuse is proven.
 */
async function verifyPersistentCssReuse(root) {
	const fixture = await writeCssFixture(root, 'reuse', 'red');
	const store = persistentStore();
	const first = await new CompactStylesheetCache({ persistentStore: store }).compile(fixture.options);
	const second = await new CompactStylesheetCache({ persistentStore: store }).compile(fixture.options);
	assert.equal(second, first);
	assert.match(second, /color: red/);
}

/**
 * @description Proves a nested imported stylesheet change invalidates the persisted parent cascade.
 * @param {string} root Temporary test universe root.
 * @returns {Promise<void>} Resolves after renewed nested CSS replaces the old generated result.
 */
async function verifyPersistentCssInvalidation(root) {
	const fixture = await writeCssFixture(root, 'renew', 'red');
	const store = persistentStore();
	const first = await new CompactStylesheetCache({ persistentStore: store }).compile(fixture.options);
	await fs.writeFile(fixture.dependency, '.card { color: tan; }\n');
	const second = await new CompactStylesheetCache({ persistentStore: store }).compile(fixture.options);
	assert.notEqual(second, first);
	assert.match(second, /color: tan/);
}

/**
 * @description Creates one entry/import CSS fixture for durable-cache tests.
 * @param {string} root Temporary test root.
 * @param {string} name Fixture folder name.
 * @param {string} color Authored nested card color.
 * @returns {Promise<{dependency:string,options:object}>} Fixture dependency path and compiler options.
 */
async function writeCssFixture(root, name, color) {
	const folder = path.join(root, name);
	const dependency = path.join(folder, 'card.css');
	const entryFile = path.join(folder, 'main.css');
	await fs.mkdir(folder, { recursive: true });
	await fs.writeFile(dependency, `.card { color: ${color}; }\n`);
	await fs.writeFile(entryFile, '@import "./card.css";\n.root { display: block; }\n');
	return {
		dependency,
		options: { entryFile, fs, rootDir: folder }
	};
}

/** @description Creates a production-shaped durable store for CompactCSS. @returns {PersistentCompactStore} Fresh store. */
function persistentStore() {
	return new PersistentCompactStore({
		implementationDirectory: path.resolve(__dirname, '../compactCss'),
		kind: 'css'
	});
}

/** @description Restores the previous cache-root environment. @param {string|undefined} previous Prior value. @returns {void} */
function restoreCacheRoot(previous) {
	if (previous === undefined) delete process.env.AWTSMOOS_COMPACT_CACHE_DIR;
	else process.env.AWTSMOOS_COMPACT_CACHE_DIR = previous;
}

run().catch((error) => {
	console.error(error.stack || error);
	process.exit(1);
});
