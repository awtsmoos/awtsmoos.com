//B"H
/**
 * @module SocialPacked
 * @description
 * Chapter 20: The server learned which earth held the ark.
 *
 * The Awtsmoos recreates every shard from nothing every instant, yet a running
 * localhost process must know which data-root contains those shards. This module
 * now honors `AWTSMOOS_DB_PATH` before `$i.db.directory`, so the API can be
 * pointed at `dayuhChadash` and read migrated `social.allPosts.awtsdb` records
 * even after old series post maps are renamed away.
 */

const path = require('path');
const { shardFile, shardFilesForRead, logicalKey } = require('./shardPaths.js');
const { appendRecord, getLatest, readRecords } = require('./jsonlShard.js');
const { RECORD_TYPES, makeEnvelope } = require('./recordEnvelope.js');
const { makeEntityManifest, entityManifestKey } = require('./entityManifest.js');

function resolveDbRoot($i) {
  return process.awtsmoosDbPath || process.env.AWTSMOOS_DB_PATH || $i?.db?.directory || path.resolve(process.cwd(), '../../dayuhChadash');
}

function writePacked({ $i, shard = 'core', key, value, op = 'put', meta = {}, type }) {
  return appendRecord(shardFile(resolveDbRoot($i), shard), makeEnvelope({ op, key, value, meta, type }));
}

function readPacked({ $i, shard = 'core', key }) {
  const dbRoot = resolveDbRoot($i);
  for (const file of shardFilesForRead(dbRoot, shard).reverse()) {
    const record = getLatest(file, key);
    if (record) return record;
  }
  return null;
}

function listPackedRecords({ $i, shard = 'core' }) {
  const dbRoot = resolveDbRoot($i);
  return shardFilesForRead(dbRoot, shard).flatMap(file => {
    try { return readRecords(file); }
    catch { return []; }
  });
}

function writeManifest({ $i, manifest }) {
  return writePacked({ $i, shard: 'meta', key: entityManifestKey(manifest), value: manifest, meta: { kind: 'entityManifest', entityKind: manifest.kind } });
}

function writeIndex({ $i, key, value, meta }) {
  return writePacked({ $i, shard: 'search', key, value, meta: { kind: 'materializedIndex', ...meta } });
}

function appendEvent({ $i, type, actor = '', entity = {}, data = {} }) {
  const event = { id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`, type, actor, entity, data, createdAt: Date.now() };
  return writePacked({ $i, shard: 'audit', key: logicalKey(['events', type, event.id]), value: event, meta: { kind: 'socialEvent', type } });
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
  const packedCore = logicalKey(['posts', post.heichelId, postId]);
  const write = writePacked({ $i, shard: 'core', key: packedCore, value: post, meta: { kind: 'post', type: contentType } });
  mirrorAllPost({ $i, post });
  writeManifest({ $i, manifest: makeEntityManifest({ kind: 'post', id: postId, paths: { packedCore, allPosts: logicalKey(['allPosts', post.heichelId, postId]), legacy: post.parentSeriesId || post.seriesId ? `/social/heichelos/${post.heichelId}/series/${post.parentSeriesId || post.seriesId}/posts/${postId}` : '' }, indexes: { byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]), byAlias: post.aliasId || post.author ? logicalKey(['indexes', 'postsByAlias', post.aliasId || post.author, postId]) : '', byType: logicalKey(['indexes', 'postsByType', contentType, postId]) }, binaryRefs: { futureShard: 'social.core.awtsdb' }, stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 } }) });
  const indexValue = { postId, heichelId: post.heichelId || '', aliasId: post.aliasId || post.author || '', type: contentType, title: post.title || '', updatedAt: Date.now() };
  writeIndex({ $i, key: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]), value: indexValue, meta: { index: 'postsByHeichel' } });
  if (indexValue.aliasId) writeIndex({ $i, key: logicalKey(['indexes', 'postsByAlias', indexValue.aliasId, postId]), value: indexValue, meta: { index: 'postsByAlias' } });
  writeIndex({ $i, key: logicalKey(['indexes', 'postsByType', contentType, postId]), value: indexValue, meta: { index: 'postsByType' } });
  appendEvent({ $i, type: 'post.mirrored', actor: indexValue.aliasId, entity: { kind: 'post', id: postId }, data: { heichelId: post.heichelId, contentType } });
  return write;
}

function mirrorGraphReference({ $i, reference }) {
  const write = writePacked({ $i, shard: 'graph', key: logicalKey(['graph', reference.kind, reference.id]), value: reference, type: RECORD_TYPES.graphEdge, meta: { kind: 'graph', edgeKind: reference.kind } });
  const value = { id: reference.id, kind: reference.kind, from: reference.from, to: reference.to, updatedAt: Date.now() };
  writeIndex({ $i, key: logicalKey(['indexes', 'graphOut', reference.from?.type, reference.from?.id, reference.id]), value, meta: { index: 'graphOut', edgeKind: reference.kind } });
  writeIndex({ $i, key: logicalKey(['indexes', 'graphIn', reference.to?.type, reference.to?.id, reference.id]), value, meta: { index: 'graphIn', edgeKind: reference.kind } });
  appendEvent({ $i, type: 'graph.edge.mirrored', actor: reference.aliasId || '', entity: { kind: 'graphEdge', id: reference.id }, data: { edgeKind: reference.kind } });
  return write;
}

function mirrorNotification({ $i, notification }) {
  const write = writePacked({ $i, shard: 'notify', key: logicalKey(['notifications', notification.toAliasId, notification.id]), value: notification, type: RECORD_TYPES.notification, meta: { kind: 'notification', type: notification.type } });
  appendEvent({ $i, type: 'notification.mirrored', actor: notification.fromAliasId || '', entity: { kind: 'notification', id: notification.id }, data: { toAliasId: notification.toAliasId, type: notification.type } });
  return write;
}

function shardStats({ $i, shard = 'core' }) {
  const records = listPackedRecords({ $i, shard });
  const keys = new Set(records.map(record => record.key).filter(Boolean));
  const byType = {};
  for (const record of records) byType[record.recordType || record.meta?.kind || 'unknown'] = (byType[record.recordType || record.meta?.kind || 'unknown'] || 0) + 1;
  return { shard, records: records.length, logicalKeys: keys.size, byType };
}

function allShardStats({ $i }) {
  return ['core', 'allPosts', 'meta', 'graph', 'notify', 'audit', 'search', 'feed'].map(shard => { try { return shardStats({ $i, shard }); } catch { return { shard, records: 0, logicalKeys: 0, byType: {} }; } });
}

function writeMigrationManifest({ $i, manifest }) {
  return writePacked({ $i, shard: 'meta', key: logicalKey(['migrations', manifest.id]), value: manifest, type: RECORD_TYPES.migrationManifest, meta: { kind: 'migrationManifest', migrationType: manifest.type } });
}

module.exports = { resolveDbRoot, writePacked, readPacked, listPackedRecords, writeManifest, writeIndex, appendEvent, mirrorPost, mirrorAllPost, mirrorGraphReference, mirrorNotification, writeMigrationManifest, shardStats, allShardStats };
