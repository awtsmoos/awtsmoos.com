// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file essentialReleaseAssetBuild.test.cjs
 * @description Proves exact identity and proper custody of first-play Chossid and meadow grass.
 * The Awtsmoos renews every texture and traveler in one truthful light;
 * Awtsmoos.com keeps local and remote guardians each faithful and right.
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

test('canonical JS build verifies release assets before publishing bundles', () => {
	assert.match(buildSource, /buildEssentialReleaseAssets/);
	assert.match(buildSource, /await buildEssentialReleaseAssets\(gameRoot\)/);
	assert.ok(buildSource.indexOf('await buildEssentialReleaseAssets(gameRoot)') < buildSource.indexOf('compileMain(entryFile)'));
});

test('every essential asset has exact pinned identity and correct custody', () => {
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	assert.equal(manifest.version, 3);
	for (const [name, definition] of Object.entries(ASSETS)) {
		const record = manifest.assets[name];
		assert.ok(record, `${name} needs a release manifest entry`);
		assert.equal(record.bytes, definition.bytes, `${name}: pinned byte size`);
		assert.equal(record.sha256, definition.sha256, `${name}: pinned SHA-256`);
		assert.equal(record.publicUrl, definition.publicUrl, `${name}: public URL`);
		assert.equal(record.sourceUrl, definition.sourceUrl, `${name}: source URL`);
		assert.equal(record.materialized, definition.materialize, `${name}: custody mode`);
		if (definition.materialize) {
			assert.equal(record.custody, 'local', `${name}: local custody`);
			const bytes = fs.readFileSync(path.join(assetRoot, definition.fileName));
			assert.equal(bytes.length, definition.bytes, `${name}: local body size`);
			assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), definition.sha256);
		} else {
			assert.equal(record.custody, 'remote', `${name}: immutable remote custody`);
			assert.match(record.publicUrl, /^https:\/\//, `${name}: secure remote URL`);
			assert.ok(record.publicUrl.includes(definition.sha256), `${name}: content-addressed URL`);
			if (definition.legacyFileName) {
				assert.equal(fs.existsSync(path.join(assetRoot, definition.legacyFileName)), false);
			}
		}
	}
});

test('canonical Chossid remains authored and locally hash-addressed', () => {
	const chossid = ASSETS.canonicalChossid;
	assert.equal(chossid.bytes, 2027368);
	assert.equal(chossid.sha256, 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48');
	assert.equal(chossid.publicUrl, `/games/mitzvahWorld/build/generated/assets/${chossid.sha256}/chossid.glb`);
	assert.equal(chossid.fileName, `${chossid.sha256}/chossid.glb`);
});

test('release asset paths stay inside the game-generated directory', () => {
	assert.ok(manifestPath.startsWith(path.join(gameRoot, 'build/generated')));
	assert.ok(assetRoot.startsWith(path.join(gameRoot, 'build/generated')));
});
