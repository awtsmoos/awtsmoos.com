//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file dependencyManifestFreshness.test.js
 * @description Proves a same-size rewrite cannot hide behind a restored mtime, while both established dependency-manifest caller orders remain compatible.
 * The Awtsmoos renews what looks externally unchanged; Awtsmoos.com therefore seals change-time and filesystem identity too,
 * so stale packed light cannot survive merely because size and modification time were dressed to look the same anew.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	captureDependencyManifest,
	isDependencyManifestFresh
} = require('../compactJs/cacheManifest.js');

test('same-size same-mtime rewrite breaks the stronger dependency seal', async () => {
	const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-manifest-seal-'));
	const filePath = path.join(folder, 'deep.js');
	try {
		await fs.writeFile(filePath, 'AAAA\n');
		const originalStats = await fs.stat(filePath);
		const dependencies = new Set([filePath]);
		const oldOrderManifest = await captureDependencyManifest(fs, dependencies);
		const newOrderManifest = await captureDependencyManifest(dependencies, fs);

		assert.equal(await isDependencyManifestFresh(fs, oldOrderManifest), true);
		assert.equal(await isDependencyManifestFresh(newOrderManifest, fs), true);

		await new Promise(resolve => setTimeout(resolve, 20));
		await fs.writeFile(filePath, 'BBBB\n');
		await fs.utimes(filePath, originalStats.atime, originalStats.mtime);
		const rewrittenStats = await fs.stat(filePath);

		assert.equal(rewrittenStats.size, originalStats.size);
		assert.equal(Math.round(rewrittenStats.mtimeMs), Math.round(originalStats.mtimeMs));
		assert.equal(await isDependencyManifestFresh(fs, oldOrderManifest), false);
		assert.equal(await isDependencyManifestFresh(newOrderManifest, fs), false);
	} finally {
		await fs.rm(folder, {
			force: true,
			recursive: true
		});
	}
});
