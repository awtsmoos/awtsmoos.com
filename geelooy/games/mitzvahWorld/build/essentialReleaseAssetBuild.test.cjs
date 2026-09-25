// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file essentialReleaseAssetBuild.test.cjs
 * @description Proves canonical build ownership, pinned byte identity, and publication custody for essential grass and hash-addressed canonical Chossid.
 * The Awtsmoos gives meadow and traveler one measured local garment while their authored source remains unchanged;
 * Awtsmoos.com accepts no convenient substitute, so every packaged byte, hash, nested public path, and remote origin must stay exactly arranged.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { ASSETS } = require('./EssentialReleaseAssetBuilder.cjs');

const gameRoot = path.resolve(__dirname, '..');
const buildSource = fs.readFileSync(path.join(__dirname, 'build-js.cjs'), 'utf8');
const manifestPath = path.join(__dirname, 'generated/mitzvah-world-essential-assets.json');
const assetRoot = path.join(__dirname, 'generated/assets');

test('canonical JS build regenerates essential release assets before bundle publication', () => {
	assert.match(buildSource, /buildEssentialReleaseAssets/);
	assert.match(buildSource, /await buildEssentialReleaseAssets\(gameRoot\)/);
	assert.ok(buildSource.indexOf('await buildEssentialReleaseAssets(gameRoot)') < buildSource.indexOf('compileMain(entryFile)'));
});

test('every essential packaged asset exactly matches pinned source identity', () => {
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	assert.equal(manifest.version, 2);
	for (const [name, definition] of Object.entries(ASSETS)) {
		const record = manifest.assets[name];
		const bytes = fs.readFileSync(path.join(assetRoot, definition.fileName));
		const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
		assert.equal(record.bytes, definition.bytes);
		assert.equal(record.bytes, bytes.byteLength);
		assert.equal(record.sha256, definition.sha256);
		assert.equal(record.sha256, sha256);
		assert.equal(record.publicUrl, definition.publicUrl);
		assert.equal(record.sourceUrl, definition.sourceUrl);
	}
});

test('canonical Chossid remains exact authored model and hash-addressed locally', () => {
	const chossid = ASSETS.canonicalChossid;
	assert.equal(chossid.bytes, 2027368);
	assert.equal(chossid.sha256, 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48');
	assert.equal(chossid.publicUrl, `/games/mitzvahWorld/build/generated/assets/${chossid.sha256}/chossid.glb`);
	assert.equal(chossid.fileName, `${chossid.sha256}/chossid.glb`);
	assert.match(chossid.sourceUrl, new RegExp(`/${chossid.sha256}/chossid\\.glb$`));
});

test('release asset paths remain inside the Mitzvah World generated vessel', () => {
	assert.ok(manifestPath.startsWith(path.join(gameRoot, 'build/generated')));
	assert.ok(assetRoot.startsWith(path.join(gameRoot, 'build/generated')));
});
