//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file staticAssetFreshness.test.js
 * @description Proves stale precompressed sidecars can never outrank a newer identity asset.
 * The Awtsmoos renews source before vessel, so an older garment may not speak a newer word;
 * Awtsmoos.com tests the filesystem covenant directly, where freshness must be measured before compression is heard.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	selectStaticRepresentation
} = require('../static/StaticAssetNegotiation.js');

/**
 * @description Creates one temporary identity asset and optional compression siblings with explicit modification times.
 * @param {object} options Sidecar freshness configuration.
 * @returns {Promise<{assetPath:string,cleanup:()=>Promise<void>}>} Temporary asset fixture and cleanup function.
 */
async function createAssetFixture(options = {}) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-static-freshness-'));
	const assetPath = path.join(root, 'runtime.js');
	const sourceTime = new Date('2026-08-27T03:00:00Z');
	await fs.writeFile(assetPath, 'const Awtsmoos = "renewed";\n');
	await fs.utimes(assetPath, sourceTime, sourceTime);

	for (const sidecar of options.sidecars || []) {
		const sidecarPath = `${assetPath}${sidecar.suffix}`;
		await fs.writeFile(sidecarPath, sidecar.content || Buffer.from('compressed'));
		await fs.utimes(sidecarPath, sidecar.time, sidecar.time);
	}

	return {
		assetPath,
		cleanup: () => fs.rm(root, { force: true, recursive: true })
	};
}

test('B"H stale Brotli falls through to fresh gzip', async (context) => {
	const fixture = await createAssetFixture({
		sidecars: [
			{ suffix: '.br', time: new Date('2026-08-27T02:00:00Z') },
			{ suffix: '.gz', time: new Date('2026-08-27T04:00:00Z') }
		]
	});
	context.after(fixture.cleanup);
	const selected = await selectStaticRepresentation(fs, fixture.assetPath, 'br, gzip');
	assert.equal(selected.encoding, 'gzip');
	assert.equal(selected.path, `${fixture.assetPath}.gz`);
});

test('B"H stale compressed siblings fall back to identity', async (context) => {
	const fixture = await createAssetFixture({
		sidecars: [
			{ suffix: '.br', time: new Date('2026-08-27T01:00:00Z') },
			{ suffix: '.gz', time: new Date('2026-08-27T02:00:00Z') }
		]
	});
	context.after(fixture.cleanup);
	const selected = await selectStaticRepresentation(fs, fixture.assetPath, 'br, gzip');
	assert.equal(selected.encoding, 'identity');
	assert.equal(selected.path, fixture.assetPath);
});

test('B"H fresh Brotli remains the preferred compact vessel', async (context) => {
	const fixture = await createAssetFixture({
		sidecars: [
			{ suffix: '.br', time: new Date('2026-08-27T04:00:00Z') }
		]
	});
	context.after(fixture.cleanup);
	const selected = await selectStaticRepresentation(fs, fixture.assetPath, 'br');
	assert.equal(selected.encoding, 'br');
	assert.equal(selected.path, `${fixture.assetPath}.br`);
});
