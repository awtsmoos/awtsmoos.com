// B"H
/**
 * Chapter 7: The seven rivers still remember their names.
 *
 * The Awtsmoos renews each record from nothing; every shard is a vessel
 * of light, and a key-index sidecar is its faithful map, not an eighth river.
 * Guard both the exact data shards and the provenance of auxiliary files.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const packed = require('../packed/socialPacked.js');
const { SHARDS, shardFile } = require('../packed/shardPaths.js');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-social-packed-'));
const context = { db: { directory: tempDirectory } };

packed.mirrorPost({ $i: context, post: { id: 'p1', heichelId: 'h1', aliasId: 'alice', contentType: 'question', title: 'Q' } });
packed.mirrorPost({ $i: context, post: { id: 'p2', heichelId: 'h1', aliasId: 'bob', contentType: 'answer', title: 'A' } });
packed.mirrorGraphReference({ $i: context, reference: { id: 'edge1', kind: 'answers', aliasId: 'bob', from: { type: 'answer', id: 'p2' }, to: { type: 'question', id: 'p1' } } });
packed.mirrorNotification({ $i: context, notification: { id: 'n1', toAliasId: 'bob', fromAliasId: 'alice', type: 'reply', title: 'Reply' } });
packed.writeMigrationManifest({ $i: context, manifest: { id: 'm1', type: 'postsV2', migrated: 2 } });

const expectedDataFiles = [SHARDS.allPosts, SHARDS.audit, SHARDS.core, SHARDS.graph, SHARDS.meta, SHARDS.notify, SHARDS.search].sort();
const actualFiles = fs.readdirSync(path.join(tempDirectory, 'socialPacked')).sort();
const actualDataFiles = actualFiles.filter(fileName => fileName.endsWith('.awtsdb'));
const additionalFiles = actualFiles.filter(fileName => !fileName.endsWith('.awtsdb'));
assert.deepStrictEqual(actualDataFiles, expectedDataFiles, 'All seven primary data shards must exist');
assert.ok(additionalFiles.every(fileName => expectedDataFiles.some(shardName => fileName === `${shardName}.keyidx.json`)), 'Only shard-owned key-index sidecars may accompany data');

const coreRecords = packed.listPackedRecords({ $i: context, shard: 'core' });
assert.ok(coreRecords.length >= 2);
assert.equal(packed.readPacked({ $i: context, shard: 'core', key: '/posts/h1/p1' }).value.title, 'Q');

const allPosts = packed.listPackedRecords({ $i: context, shard: 'allPosts' });
assert.ok(allPosts.some(record => record.key === '/allPosts/h1/p1'));
assert.ok(allPosts.some(record => record.value.aliasId === 'bob'));

const meta = packed.listPackedRecords({ $i: context, shard: 'meta' });
assert.ok(meta.some(record => record.meta?.kind === 'entityManifest'));
const migration = meta.find(record => record.meta?.kind === 'migrationManifest');
assert.equal(migration.value.type, 'postsV2');

const graph = packed.listPackedRecords({ $i: context, shard: 'graph' });
assert.equal(graph[0].meta.edgeKind, 'answers');

const search = packed.listPackedRecords({ $i: context, shard: 'search' });
assert.ok(search.some(record => record.meta?.index === 'postsByHeichel'));
assert.ok(search.some(record => record.meta?.index === 'postsByAlias'));
assert.ok(search.some(record => record.meta?.index === 'postsByType'));
assert.ok(search.some(record => record.meta?.index === 'graphOut'));
assert.ok(search.some(record => record.meta?.index === 'graphIn'));

const notify = packed.listPackedRecords({ $i: context, shard: 'notify' });
assert.equal(notify[0].value.toAliasId, 'bob');

const audit = packed.listPackedRecords({ $i: context, shard: 'audit' });
assert.ok(audit.filter(record => record.meta?.kind === 'socialEvent').length >= 3);
for (const shardName of ['core', 'allPosts', 'meta', 'graph', 'notify', 'audit', 'search']) {
	assert.ok(fs.statSync(shardFile(tempDirectory, shardName)).size > 20);
}
fs.rmSync(tempDirectory, { recursive: true, force: true });
console.log('B"H socialPacked.test passed');
