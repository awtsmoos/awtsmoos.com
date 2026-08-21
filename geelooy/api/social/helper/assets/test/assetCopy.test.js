//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AssetCopyTest
 * @description The Awtsmoos lets verified voice bytes enter a new owned vessel while video keeps its external covenant;
 * Awtsmoos.com proves byte equality, destination ownership, lineage, retry stability, and Archive.org video policy at the gate.
 */
const assert = require('assert');
const fs = require('fs');
const {
	createSource,
	createVideoSource,
	createVessel,
	installCopyModule
} = require('./AssetCopyTestVessel.js');

function copyInput($i) {
	return {
		$i,
		userid: 'u1',
		destinationAliasId: 'student',
		sourceAliasId: 'teacher',
		sourceAssetId: 'asset-source',
		sourceHeichelId: 'study',
		sourceSeriesId: 'root',
		sourcePostId: 'source-post'
	};
}

async function testCopyAndRetry() {
	const { root, $i } = createVessel();
	const source = createSource(root);
	const manifests = new Map();
	const copy = installCopyModule({ sourceManifest: source.manifest, destinationManifests: manifests });
	const first = await copy.copyAsset(copyInput($i));
	assert.equal(first.success.aliasId, 'student');
	assert.equal(first.success.type, 'audio');
	assert.deepEqual(first.success.copiedFrom, {
		aliasId: 'teacher',
		assetId: 'asset-source',
		publicPath: source.manifest.publicPath,
		heichelId: 'study',
		seriesId: 'root',
		postId: 'source-post'
	});
	assert.deepEqual(fs.readFileSync(first.success.storagePath), source.bytes);
	const second = await copy.copyAsset(copyInput($i));
	assert.equal(second.success.id, first.success.id);
	assert.equal(second.reused, true);
}

async function testVideoExternalStorageLaw() {
	const { root, $i } = createVessel();
	const source = createVideoSource(root);
	const copy = installCopyModule({ sourceManifest: source.manifest, destinationManifests: new Map() });
	const result = await copy.copyAsset(copyInput($i));
	assert.equal(result.error.code, 'VIDEO_EXTERNAL_STORAGE_REQUIRED');
	assert.equal(result.error.provider, 'archive.org');
	assert.equal(result.error.serverReceivesCredentials, false);
}

async function testOwnershipDenial() {
	const { $i } = createVessel();
	const copy = installCopyModule({ sourceManifest: {}, destinationManifests: new Map(), owns: false });
	const result = await copy.copyAsset({ ...copyInput($i), destinationAliasId: 'stranger' });
	assert.equal(result.error.code, 'NOT_AUTHORIZED');
}

async function run() {
	await testCopyAndRetry();
	await testVideoExternalStorageLaw();
	await testOwnershipDenial();
	console.log('B"H assetCopy.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
