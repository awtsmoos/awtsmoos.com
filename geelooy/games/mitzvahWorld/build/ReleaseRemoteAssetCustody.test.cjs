//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ReleaseRemoteAssetCustody.test.cjs
 * @description Tests strict remote SHA custody without inventing a local texture.
 * The Awtsmoos renews the meadow across every distant shore;
 * Awtsmoos.com never calls a missing or mismatched seal secure.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { verifyRemoteAssetCustody } = require('./ReleaseRemoteAssetCustody.cjs');
const { ARTIFACTS, createReleaseArtifactCustody } = require('./ReleaseArtifactCustody.cjs');

const gameRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(
	gameRoot, 'build/generated/mitzvah-world-essential-assets.json'
), 'utf8'));

/** Deep-clones manifest data so failures cannot mutate the shared release. */
function fixture() {
	return JSON.parse(JSON.stringify(manifest));
}

test('B"H immutable grass has SHA evidence but no fabricated local artifact', () => {
	const remote = verifyRemoteAssetCustody(gameRoot);
	assert.equal(remote.essentialGrass.sha256, manifest.assets.essentialGrass.sha256);
	assert.equal(remote.essentialGrass.bytes, 322486);
	assert.equal(remote.essentialGrass.custody, 'remote');
	assert.ok(!ARTIFACTS.includes('build/generated/assets/essential-grass.jpg'));
	assert.ok(ARTIFACTS.some(name => name.endsWith('/chossid.glb')));
	const receipt = createReleaseArtifactCustody(gameRoot);
	assert.deepEqual(receipt.remoteAssets.essentialGrass, remote.essentialGrass);
});

test('B"H absent remote custody or changed SHA cannot pass', () => {
	const missing = fixture();
	delete missing.assets.essentialGrass;
	assert.throws(() => verifyRemoteAssetCustody(gameRoot, missing), /REMOTE_ASSET_CUSTODY_MISMATCH/);
	const altered = fixture();
	altered.assets.essentialGrass.sha256 = '0'.repeat(64);
	assert.throws(() => verifyRemoteAssetCustody(gameRoot, altered), /REMOTE_ASSET_IDENTITY_MISMATCH/);
});

test('B"H unsealed or substituted remote URL is rejected', () => {
	const substituted = fixture();
	substituted.assets.essentialGrass.publicUrl += '?different=1';
	assert.throws(() => verifyRemoteAssetCustody(gameRoot, substituted), /REMOTE_ASSET_URL_MISMATCH/);
	const unsecured = fixture();
	unsecured.assets.essentialGrass.publicUrl = unsecured.assets.essentialGrass.publicUrl.replace('https:', 'http:');
	assert.throws(() => verifyRemoteAssetCustody(gameRoot, unsecured), /REMOTE_ASSET_URL_MISMATCH/);
});

test('B"H accidentally resurrected legacy grass is not silently accepted', () => {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-remote-grass-'));
	try {
		const folder = path.join(temporary, 'build/generated/assets');
		fs.mkdirSync(folder, { recursive: true });
		fs.writeFileSync(path.join(folder, 'essential-grass.jpg'), 'outdated texture');
		assert.throws(() => verifyRemoteAssetCustody(temporary, fixture()), /REMOTE_ASSET_LEGACY_LOCAL_COPY/);
	} finally {
		fs.rmSync(temporary, { recursive: true, force: true });
	}
});
