// B"H
/**
 * Chapter 190: Node OS proof. Legacy posts, universe entities, content nodes,
 * and alias assets become filesystem nodes while legacy fallback reads still
 * return a node even before migration.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { writeEntity } = require('../../entityUniverse/universeStore.js');
const { writeAssetManifest } = require('../../assets/assetManifest.js');
const { getByPath, childrenOf } = require('../nodeOsStore.js');
const { dryRunNodeOsMigration, runNodeOsMigration } = require('../migration.js');

const dbRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-node-os-'));
const db = new DosDB(dbRoot);
await db.init();
const $i = { db };
await db.write('/social/heichelos', { hLegacy: true });
await db.write('/social/heichelos/hLegacy/postIds', { pOld: true });
await db.write('/social/heichelos/hLegacy/posts/pOld', { postId: 'pOld', title: 'Old API Post', content: 'legacy body' });
const fallback = await getByPath({ $i, path: '/Heichelos/hLegacy/Series/root/Posts/pOld' });
assert.equal(fallback.success.kind, 'legacyPost');

const entity = (await writeEntity({ $i, input: { type: 'post', id: 'pNew', heichelId: 'hNew', seriesId: 'sNew', aliasId: 'rambam', title: 'New Entity', content: 'root', nodes: [{ id: 'v1', type: 'verse', content: 'verse', children: [{ id: 's1', type: 'subsection', content: 'sub' }] }] } })).success;
await writeAssetManifest({ $i, manifest: { id: 'asset1', aliasId: 'rambam', ownerAlias: 'rambam', type: 'image', mime: 'image/png', size: 3, originalName: 'a.png', storagePath: path.join(dbRoot, 'a.png'), publicPath: '/api/social/assets/rambam/image/asset1.png', createdAt: Date.now() } });
const dry = await dryRunNodeOsMigration({ $i });
assert.equal(dry.success.legacyPosts, 1);
assert.ok(dry.success.universeEntities >= 1);
const run = await runNodeOsMigration({ $i, aliasIds: ['rambam'] });
assert.ok(run.success.mounted >= 3, JSON.stringify(run));
const mountedEntity = await getByPath({ $i, path: '/Heichelos/hNew/Series/sNew/Entities/post/pNew' });
assert.equal(mountedEntity.success.title, 'New Entity');
const children = await childrenOf({ $i, nodeId: mountedEntity.success.id });
assert.ok(children.success.some(child => child.path.includes('/Nodes/v1')));
const mountedAsset = await getByPath({ $i, path: '/Aliases/rambam/Assets/image/asset1' });
assert.equal(mountedAsset.success.mime, 'image/png');
console.log('B"H nodeOsMigration.test passed');
