// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AssetCopyIntegrationTest
 * @description
 * The Awtsmoos lets one public binary cross aliases only when its canonical post first testifies to the source;
 * Awtsmoos.com proves ownership, source membership, byte independence, lineage, idempotency, and truthful failure on course.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-asset-copy-'));
process.env.AWTSMOOS_SOCIAL_AWTSDB = path.join(root, 'social.awtsmoosdb');
process.awtsmoosDbPath = root;

const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { writeAssetManifest } = require('../assetManifest.js');
const { copyAsset } = require('../assetCopy.js');
const { contentRecordPath } = require('../../socialContent.js');
const shardStore = require('../../awtsmoosDb/shardStore.js');

const db = new DosDB(path.join(root, 'dosdb'));
await db.init();
const $i = {
	db,
	$_GET: {},
	$_POST: {},
	request: { headers: {} }
};
const coordinates = {
	sourceHeichelId: 'study',
	sourceSeriesId: 'root',
	sourcePostId: 'source-post'
};

await db.write('/users/u1/aliases/destination', { aliasId: 'destination' });
const sourcePath = path.join(root, 'source.png');
const sourceBytes = Buffer.from([137, 80, 78, 71, 1, 2, 3, 4]);
fs.writeFileSync(sourcePath, sourceBytes);
await writeAssetManifest({
	$i,
	manifest: {
		id: 'source_asset',
		aliasId: 'source',
		ownerAlias: 'source',
		type: 'image',
		mime: 'image/png',
		size: sourceBytes.length,
		originalName: 'source.png',
		storagePath: sourcePath,
		publicPath: '/api/social/assets/source/image/source_asset.png',
		bindings: [],
		createdAt: Date.now()
	}
});
await db.write(contentRecordPath({
	heichelId: coordinates.sourceHeichelId,
	postId: coordinates.sourcePostId
}), {
	id: coordinates.sourcePostId,
	aliasId: 'source',
	seriesId: coordinates.sourceSeriesId,
	rootAssets: [{ id: 'source_asset' }, { id: 'missing' }],
	sections: []
});

function copyInput(sourceAssetId = 'source_asset', destinationAliasId = 'destination') {
	return {
		$i,
		userid: 'u1',
		destinationAliasId,
		sourceAliasId: 'source',
		sourceAssetId,
		...coordinates
	};
}

const first = await copyAsset(copyInput());
assert.equal(first.success.aliasId, 'destination');
assert.equal(first.success.copiedFrom.assetId, 'source_asset');
assert.deepEqual(first.success.bindings, []);
assert.notEqual(first.success.storagePath, sourcePath);
assert.deepEqual(fs.readFileSync(first.success.storagePath), sourceBytes);
assert.equal(first.reused, false);

const again = await copyAsset(copyInput());
assert.equal(again.success.id, first.success.id);
assert.equal(again.success.publicPath, first.success.publicPath);
assert.equal(again.reused, true);

fs.unlinkSync(sourcePath);
assert.equal(fs.existsSync(sourcePath), false);
assert.equal(fs.existsSync(first.success.storagePath), true);
assert.deepEqual(fs.readFileSync(first.success.storagePath), sourceBytes);

const denied = await copyAsset(copyInput('source_asset', 'stranger'));
assert.equal(denied.error.code, 'NOT_AUTHORIZED');
const missing = await copyAsset(copyInput('missing'));
assert.equal(missing.error.code, 'ASSET_SOURCE_MISSING');

shardStore.close();
fs.rmSync(root, { recursive: true, force: true });
console.log('B"H assetCopy.test passed');
