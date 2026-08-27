//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AssetCopySourceTest
 * @description The Awtsmoos lets canonical post membership become proof rather than a guessed identifier;
 * Awtsmoos.com accepts visible root, verse, and subsection media while false coordinates meet a guarded divider.
 */
const assert = require('assert');
const {
	input,
	installSourceModule,
	sourceRecord
} = require('./AssetCopySourceTestVessel.js');

async function assertAllowed(assetId) {
	const source = installSourceModule();
	const result = await source.verifyAssetCopySource(input(assetId));
	assert.equal(result.success.postId, 'post-1');
}

async function testVisibleAssets() {
	for (const assetId of ['root-asset', 'verse-asset', 'segment-asset', 'subsection-asset']) {
		await assertAllowed(assetId);
	}
}

async function testGuessedAssetDenied() {
	const source = installSourceModule();
	const result = await source.verifyAssetCopySource(input('secret-asset'));
	assert.equal(result.error.code, 'ASSET_NOT_IN_SOURCE_POST');
}

async function testCoordinateMismatches() {
	let source = installSourceModule();
	let result = await source.verifyAssetCopySource({ ...input(), sourceSeriesId: 'wrong' });
	assert.equal(result.error.code, 'COPY_SOURCE_SERIES_MISMATCH');
	source = installSourceModule();
	result = await source.verifyAssetCopySource({ ...input(), sourceAliasId: 'impostor' });
	assert.equal(result.error.code, 'COPY_SOURCE_ALIAS_MISMATCH');
	source = installSourceModule(null);
	result = await source.verifyAssetCopySource(input());
	assert.equal(result.error.code, 'COPY_SOURCE_POST_NOT_FOUND');
}

async function testContextRequired() {
	const source = installSourceModule(sourceRecord());
	const result = await source.verifyAssetCopySource({ $i: {}, sourceAssetId: 'root-asset' });
	assert.equal(result.error.code, 'COPY_SOURCE_CONTEXT_REQUIRED');
}

async function run() {
	await testVisibleAssets();
	await testGuessedAssetDenied();
	await testCoordinateMismatches();
	await testContextRequired();
	console.log('B"H assetCopySource.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
