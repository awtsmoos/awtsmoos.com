//B"H
/**
 * Chapter 7: The shard census stopped pretending the new vessels were ghosts.
 *
 * The Awtsmoos recreates social.core, social.allPosts, social.meta, search,
 * graph, notify, and audit as separate rivers. This test blesses the current
 * architecture: post bodies in core, global post census in allPosts, manifests
 * and migrations in meta, indexes in search, events in audit.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const packed = require('../packed/socialPacked.js');
const { SHARDS, shardFile } = require('../packed/shardPaths.js');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-social-packed-'));
const $i = { db: { directory: tmp } };

packed.mirrorPost({ $i, post: { id: 'p1', heichelId: 'h1', aliasId: 'alice', contentType: 'question', title: 'Q' } });
packed.mirrorPost({ $i, post: { id: 'p2', heichelId: 'h1', aliasId: 'bob', contentType: 'answer', title: 'A' } });
packed.mirrorGraphReference({ $i, reference: { id: 'edge1', kind: 'answers', aliasId: 'bob', from: { type: 'answer', id: 'p2' }, to: { type: 'question', id: 'p1' } } });
packed.mirrorNotification({ $i, notification: { id: 'n1', toAliasId: 'bob', fromAliasId: 'alice', type: 'reply', title: 'Reply' } });
packed.writeMigrationManifest({ $i, manifest: { id: 'm1', type: 'postsV2', migrated: 2 } });

const files = fs.readdirSync(path.join(tmp, 'socialPacked')).sort();
assert.deepEqual(files, [SHARDS.allPosts, SHARDS.audit, SHARDS.core, SHARDS.graph, SHARDS.meta, SHARDS.notify, SHARDS.search].sort());

const core = packed.listPackedRecords({ $i, shard: 'core' });
assert.ok(core.length >= 2);
assert.equal(packed.readPacked({ $i, shard: 'core', key: '/posts/h1/p1' }).value.title, 'Q');

const allPosts = packed.listPackedRecords({ $i, shard: 'allPosts' });
assert.ok(allPosts.some(record => record.key === '/allPosts/h1/p1'));
assert.ok(allPosts.some(record => record.value.aliasId === 'bob'));

const meta = packed.listPackedRecords({ $i, shard: 'meta' });
assert.ok(meta.some(record => record.meta?.kind === 'entityManifest'));
const migration = meta.find(record => record.meta?.kind === 'migrationManifest');
assert.equal(migration.value.type, 'postsV2');

const graph = packed.listPackedRecords({ $i, shard: 'graph' });
assert.equal(graph[0].meta.edgeKind, 'answers');

const search = packed.listPackedRecords({ $i, shard: 'search' });
assert.ok(search.some(record => record.meta?.index === 'postsByHeichel'));
assert.ok(search.some(record => record.meta?.index === 'postsByAlias'));
assert.ok(search.some(record => record.meta?.index === 'postsByType'));
assert.ok(search.some(record => record.meta?.index === 'graphOut'));
assert.ok(search.some(record => record.meta?.index === 'graphIn'));

const notify = packed.listPackedRecords({ $i, shard: 'notify' });
assert.equal(notify[0].value.toAliasId, 'bob');

const audit = packed.listPackedRecords({ $i, shard: 'audit' });
const events = audit.filter(record => record.meta?.kind === 'socialEvent');
assert.ok(events.length >= 3);

for (const shard of ['core', 'allPosts', 'meta', 'graph', 'notify', 'audit', 'search']) {
  assert.ok(fs.statSync(shardFile(tmp, shard)).size > 20);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log('B"H socialPacked.test passed');
