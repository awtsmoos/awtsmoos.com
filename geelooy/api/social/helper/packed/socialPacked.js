//B"H
/**
 * @module SocialShardCompat
 * @description Chapter 620: Legacy packed function names remain as public
 * compatibility vessels, but every record now lives in AwtsmoosDB native shards.
 */
const { logicalKey } = require('./shardPaths.js');
const { RECORD_TYPES, makeEnvelope } = require('./recordEnvelope.js');
const { makeEntityManifest, entityManifestKey } = require('./entityManifest.js');
const store = require('../awtsmoosDb/shardStore.js');
function resolveDbRoot() { return store.info().path; }
function envelope({ op = 'put', key, value, meta = {}, type }) {
  return makeEnvelope({ op, key, value, meta, type });
}
function writePacked({ shard = 'core', key, value, op = 'put', meta = {}, type }) {
  const record = envelope({ op, key, value, meta, type });
  store.put({ shard, parts: ['records', key], value: record, meta: { ...meta, compat: 'awtsmoosdb-shard' } });
  return record;
}
function readPacked({ shard = 'core', key }) {
  const record = store.get({ shard, parts: ['records', key] });
  return record?.value || null;
}
function listPackedRecords({ shard = 'core' }) {
  const latest = new Map();
  for (const record of store.list({ shard, predicate: r => r.parts?.[0] === 'records' })) {
    const value = record.value;
    if (value?.key) latest.set(value.key, value);
  }
  return [...latest.values()];
}
function writeManifest({ $i, manifest }) {
  return writePacked({ $i, shard: 'meta', key: entityManifestKey(manifest), value: manifest, meta: { kind: 'entityManifest', entityKind: manifest.kind } });
}
function writeIndex({ $i, key, value, meta }) {
  return writePacked({ $i, shard: 'search', key, value, meta: { kind: 'materializedIndex', ...meta } });
}
function appendEvent({ $i, type, actor = '', entity = {}, data = {} }) {
  const event = { id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`, type, actor, entity, data, createdAt: Date.now() };
  return writePacked({ $i, shard: 'events', key: logicalKey(['events', type, event.id]), value: event, meta: { kind: 'socialEvent', type } });
}
function allPostValue(post) {
  const postId = post.id || post.postId;
  return { postId, heichelId: post.heichelId || '', seriesId: post.seriesId || post.parentSeriesId || 'root', aliasId: post.aliasId || post.author || '', type: post.contentType || post.postType || 'post', title: post.title || post.name || '', excerpt: String(post.content || post.description || '').slice(0, 280), connected: true, updatedAt: post.updatedAt || post.createdAt || post.timestamp || Date.now() };
}
function mirrorAllPost({ $i, post }) {
  const value = allPostValue(post);
  return writePacked({ $i, shard: 'allPosts', key: logicalKey(['allPosts', value.heichelId, value.postId]), value, meta: { kind: 'allPost', aliasId: value.aliasId, heichelId: value.heichelId, seriesId: value.seriesId } });
}
function mirrorPost({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const coreKey = logicalKey(['posts', post.heichelId, postId]);
  const write = writePacked({ $i, shard: 'core', key: coreKey, value: post, meta: { kind: 'post', type: contentType } });
  mirrorAllPost({ $i, post });
  writeManifest({ $i, manifest: makeEntityManifest({ kind: 'post', id: postId, paths: { core: coreKey, allPosts: logicalKey(['allPosts', post.heichelId, postId]) }, indexes: { byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]) }, binaryRefs: { engine: 'AwtsmoosDB' }, stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 } }) });
  const indexValue = { postId, heichelId: post.heichelId || '', aliasId: post.aliasId || post.author || '', type: contentType, title: post.title || '', updatedAt: Date.now() };
  writeIndex({ $i, key: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]), value: indexValue, meta: { index: 'postsByHeichel' } });
  if (indexValue.aliasId) writeIndex({ $i, key: logicalKey(['indexes', 'postsByAlias', indexValue.aliasId, postId]), value: indexValue, meta: { index: 'postsByAlias' } });
  appendEvent({ $i, type: 'post.mirrored', actor: indexValue.aliasId, entity: { kind: 'post', id: postId }, data: { heichelId: post.heichelId, contentType } });
  return write;
}
function mirrorGraphReference({ $i, reference }) {
  const write = writePacked({ $i, shard: 'graph', key: logicalKey(['graph', reference.kind, reference.id]), value: reference, type: RECORD_TYPES.graphEdge, meta: { kind: 'graph', edgeKind: reference.kind } });
  appendEvent({ $i, type: 'graph.edge.mirrored', actor: reference.aliasId || '', entity: { kind: 'graphEdge', id: reference.id }, data: { edgeKind: reference.kind } });
  return write;
}
function mirrorNotification({ $i, notification }) {
  const write = writePacked({ $i, shard: 'notify', key: logicalKey(['notifications', notification.toAliasId, notification.id]), value: notification, type: RECORD_TYPES.notification, meta: { kind: 'notification', type: notification.type } });
  appendEvent({ $i, type: 'notification.mirrored', actor: notification.fromAliasId || '', entity: { kind: 'notification', id: notification.id }, data: { toAliasId: notification.toAliasId, type: notification.type } });
  return write;
}
function shardFileStats({ shard }) { return { files: [{ file: resolveDbRoot(), exists: true, bytes: 0, mtimeMs: 0, engine: 'AwtsmoosDB', shard }], bytes: 0 }; }
function shardStats({ shard = 'core' }) {
  const records = listPackedRecords({ shard });
  const keys = new Set(records.map(r => r.key).filter(Boolean));
  const byType = {};
  for (const r of records) byType[r.recordType || r.meta?.kind || 'unknown'] = (byType[r.recordType || r.meta?.kind || 'unknown'] || 0) + 1;
  return { shard, records: records.length, logicalKeys: keys.size, byType, approximate: false, engine: 'AwtsmoosDB', bytes: 0, files: shardFileStats({ shard }).files };
}
function allShardStats() { return ['core', 'allPosts', 'meta', 'graph', 'notify', 'events', 'search', 'feed', 'objects', 'civilization'].map(shard => shardStats({ shard })); }
function writeMigrationManifest({ $i, manifest }) { return writePacked({ $i, shard: 'meta', key: logicalKey(['migrations', manifest.id]), value: manifest, type: RECORD_TYPES.migrationManifest, meta: { kind: 'migrationManifest', migrationType: manifest.type } }); }
module.exports = { resolveDbRoot, writePacked, readPacked, listPackedRecords, writeManifest, writeIndex, appendEvent, mirrorPost, mirrorAllPost, mirrorGraphReference, mirrorNotification, writeMigrationManifest, shardStats, allShardStats, shardFileStats };
