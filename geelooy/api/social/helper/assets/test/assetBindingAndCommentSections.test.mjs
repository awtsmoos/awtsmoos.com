// B"H
/**
 * Chapter 183: Asset binding and comment section proof. Images can bind to
 * entity covers, Heichel covers, series covers, post root/verse/subsection and
 * comments; comments can contain sections and replies can target those sections.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { writeEntity, getEntity } = require('../../entityUniverse/universeStore.js');
const { writeAssetManifest, readAssetManifest } = require('../assetManifest.js');
const { bindAsset } = require('../assetBindings.js');
const { createComment, getTree } = require('../../comments/richCommentStore.js');

const dbRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-asset-bind-'));
const db = new DosDB(dbRoot);
await db.init();
const $i = { db, $_POST: {}, $_GET: {}, request: { headers: {} } };
await db.write('/users/u1/aliases/rambam', { aliasId: 'rambam' });
await db.write('/users/u2/aliases/raavad', { aliasId: 'raavad' });
await db.write('/social/aliases/rambam/info', { user: 'u1' });
await db.write('/social/aliases/raavad/info', { user: 'u2' });
const post = (await writeEntity({ $i, input: { type: 'post', id: 'p_img', heichelId: 'h_img', seriesId: 's_img', aliasId: 'rambam', title: 'Picture Post', content: 'root', nodes: [{ id: 'v1', type: 'verse', content: 'verse', children: [{ id: 's1', type: 'subsection', content: 'sub' }] }] } })).success;
const manifest = { id: 'asset_img_1', aliasId: 'rambam', ownerAlias: 'rambam', type: 'image', mime: 'image/png', size: 8, originalName: 'cover.png', storagePath: path.join(dbRoot, 'cover.png'), publicPath: '/api/social/assets/rambam/image/asset_img_1.png', attachedTo: { kind: 'post' }, createdAt: Date.now() };
fs.writeFileSync(manifest.storagePath, Buffer.from([1,2,3]));
await writeAssetManifest({ $i, manifest });

for (const target of [
  { kind: 'entity', entityType: 'post', entityId: post.id, heichelId: 'h_img' },
  { kind: 'entityNode', entityType: 'post', entityId: post.id, heichelId: 'h_img', nodeId: 'v1' },
  { kind: 'entityNode', entityType: 'post', entityId: post.id, heichelId: 'h_img', nodeId: 's1' },
  { kind: 'heichel', heichelId: 'h_img' },
  { kind: 'series', heichelId: 'h_img', seriesId: 's_img' }
]) {
  const bound = await bindAsset({ $i, aliasId: 'rambam', assetId: manifest.id, target, role: target.kind === 'entity' ? 'cover' : 'inline' });
  assert.ok(bound.success.bindings.length >= 1);
}
const updated = readAssetManifest({ $i, aliasId: 'rambam', assetId: manifest.id });
assert.ok(updated.ownerOsPath.includes('/os/aliases/rambam/assets/asset_img_1'));
assert.ok(updated.virtualOsPath.includes('/awtsmoos-os/assets/rambam/asset_img_1'));
assert.equal((await getEntity({ $i, type: 'post', id: 'p_img' })).success.options.navigationImage, manifest.publicPath);

$i.$_POST = { aliasId: 'rambam', content: 'comment root', verseSection: 'v1', subsectionId: 's1', assets: JSON.stringify([manifest]), sections: JSON.stringify([{ id: 'cs1', title: 'Inner comment section', content: 'section text', assets: [manifest] }]) };
const comment = await createComment({ $i, userid: 'u1', heichelId: 'h_img', postId: 'p_img', aliasId: 'rambam' });
assert.equal(comment.success.sections[0].id, 'cs1');
$i.$_POST = { aliasId: 'raavad', content: 'reply only to section cs1', parentSectionId: 'cs1' };
const reply = await createComment({ $i, userid: 'u2', heichelId: 'h_img', postId: 'p_img', parentId: comment.success.id, parentSectionId: 'cs1', aliasId: 'raavad' });
assert.equal(reply.success.parentSectionId, 'cs1');
const tree = await getTree({ $i, heichelId: 'h_img', postId: 'p_img' });
assert.equal(tree.success[0].replies[0].parentSectionId, 'cs1');
console.log('B"H assetBindingAndCommentSections.test passed');
