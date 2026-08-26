//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { CompactModuleCache } = require("../compactJs/cache.js");
const {
	countingFs,
	fixtureOptions,
	writeFixture
} = require("./compactJsCacheSupport.js");

/**
 * @file Proves CompactJS warm memory, deep renewal, concurrent unity, and failed-compile recovery.
 * @description The Awtsmoos renews every dependency while Awtsmoos.com remembers only what remains true;
 * warm speed may never become stale light, and simultaneous callers should share one compiling vessel in view.
 */
async function run() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-compact-cache-"));
	try {
		await verifyWarmHit(root);
		await verifyDeepInvalidation(root);
		await verifyInflightDeduplication(root);
		await verifyFailedCompileRecovery(root);
		console.log("CompactJS cache tests passed.");
	} finally {
		await fs.rm(root, {
			force: true,
			recursive: true
		});
	}
}

/** Proves the second unchanged compile returns identical source without another source read. */
async function verifyWarmHit(root) {
	const fixture = await writeFixture(root, "warm", "export const value = 1;");
	const counter = { reads: 0 };
	const cache = new CompactModuleCache();
	const options = fixtureOptions(fixture, countingFs(counter));
	const first = await cache.compile(options);
	const readsAfterFirst = counter.reads;
	const second = await cache.compile(options);
	assert.strictEqual(second, first);
	assert.strictEqual(counter.reads, readsAfterFirst);
	assert.ok(readsAfterFirst >= 2);
}

/** Proves a deep dependency edit breaks the manifest seal and rebuilds the compact source. */
async function verifyDeepInvalidation(root) {
	const fixture = await writeFixture(root, "deep", "export const value = 1;");
	const counter = { reads: 0 };
	const cache = new CompactModuleCache();
	const options = fixtureOptions(fixture, countingFs(counter));
	const first = await cache.compile(options);
	const readsAfterFirst = counter.reads;
	await fs.writeFile(fixture.dependency, "export const value = 222;\n// renewed\n");
	const second = await cache.compile(options);
	assert.ok(counter.reads > readsAfterFirst);
	assert.notStrictEqual(second, first);
}

/** Proves concurrent requests for one entry share one compilation instead of racing duplicate work. */
async function verifyInflightDeduplication(root) {
	const fixture = await writeFixture(root, "inflight", "export const value = 7;");
	const counter = { reads: 0 };
	const cache = new CompactModuleCache();
	const options = fixtureOptions(fixture, countingFs(counter, 25));
	const [first, second] = await Promise.all([
		cache.compile(options),
		cache.compile(options)
	]);
	assert.strictEqual(first, second);
	assert.strictEqual(counter.reads, 2);
}

/** Proves a missing local dependency cannot poison the cache after the graph is repaired. */
async function verifyFailedCompileRecovery(root) {
	const folder = path.join(root, "recovery");
	await fs.mkdir(folder, { recursive: true });
	const entry = path.join(folder, "entry.js");
	const missing = path.join(folder, "missing.js");
	await fs.writeFile(
		entry,
		"import { restored } from './missing.js';\nexport const result = restored;\n"
	);
	const cache = new CompactModuleCache();
	const options = {
		entryFile: entry,
		fs,
		rootDir: folder
	};
	await assert.rejects(() => cache.compile(options));
	await fs.writeFile(missing, "export const restored = 9;\n");
	const source = await cache.compile(options);
	assert.ok(source.includes("restored"));
}

run().catch((error) => {
	console.error(error.stack || error);
	process.exit(1);
});
