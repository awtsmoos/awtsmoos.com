//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AssetCopyTest
 * @description The Awtsmoos lets one public binary enter a new alias vessel without touching the original flame;
 * Awtsmoos.com proves ownership, byte independence, lineage, idempotency, and refusal when permission is not the same.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-asset-copy-'));
process.env.AWTSMOOS_SOCIAL_AWTSDB = path.join(root, 'social.awtsmoosdb');
process.awtsmoosDbPath = root;
const require = createRequire(import.meta.url);
const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { writeAssetManifest } = require('../assetManifest.js');
const { copyAsset } = require('../assetCopy.js');
const shardStore = require('../../awtsmoosDb/shardStore.js');

const db = new DosDB(path.join(root, 'dosdb'));
await db.init();
const $i = { db, $_GET: {}, $_POST: {}, request: { headers: {} } };
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

const first = await copyAsset({
	$i,
	userid: 'u1',
	destinationAliasId: 'destination',
	sourceAliasId: 'source',
	sourceAssetId: 'source_asset'
});
assert.equal(first.success.aliasId, 'destination');
assert.equal(first.success.copiedFrom.assetId, 'source_asset');
assert.deepEqual(first.success.bindings, []);
assert.notEqual(first.success.storagePath, sourcePath);
assert.deepEqual(fs.readFileSync(first.success.storagePath), sourceBytes);
assert.equal(first.reused, false);

const again = await copyAsset({
	$i,
	userid: 'u1',
	destinationAliasId: 'destination',
	sourceAliasId: 'source',
	sourceAssetId: 'source_asset'
});
assert.equal(again.success.id, first.success.id);
assert.equal(again.success.publicPath, first.success.publicPath);
assert.equal(again.reused, true);

fs.unlinkSync(sourcePath);
assert.equal(fs.existsSync(sourcePath), false);
assert.equal(fs.existsSync(first.success.storagePath), true);
assert.deepEqual(fs.readFileSync(first.success.storagePath), sourceBytes);

const denied = await copyAsset({
	$i,
	userid: 'u1',
	destinationAliasId: 'stranger',
	sourceAliasId: 'source',
	sourceAssetId: 'source_asset'
});
assert.equal(denied.error.code, 'NOT_AUTHORIZED');

const missing = await copyAsset({
	$i,
	userid: 'u1',
	destinationAliasId: 'destination',
	sourceAliasId: 'source',
	sourceAssetId: 'missing'
});
assert.equal(missing.error.code, 'ASSET_SOURCE_MISSING');
shardStore.close();
fs.rmSync(root, { recursive: true, force: true });
console.log('B"H assetCopy.test passed');
