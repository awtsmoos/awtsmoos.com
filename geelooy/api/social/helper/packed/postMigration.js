//B"H
/**
 * @module ConnectedPostMigration
 * @description
 * Chapter 15: The post map opened as one scroll.
 *
 * Old live series posts are stored in `posts.awtsmoosJSON` as a binary object
 * map. The map opens at `/series/:series/posts`, but individual child paths may
 * return null. Therefore this migration reads the live connected map once per
 * series, migrates only entries present in that map, and never touches orphan
 * `/posts/:postId` storage.
 */

const { logicalKey } = require('./shardPaths.js');
const { readPacked, writeMigrationManifest, writePacked, appendEvent } = require('./socialPacked.js');
const { writeAllPost, allPostKey } = require('./allPostsIndex.js');
const { makeEntityManifest, entityManifestKey } = require('./entityManifest.js');

function packedPostKey({ heichelId, postId }) {
  return allPostKey({ heichelId, postId });
}

function ids(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value && typeof value === 'object') return Object.keys(value).filter(Boolean).map(String);
  return [];
}

async function get($i, path, fallback = null) {
  try { return (await $i.db.get(path, { max: true })) ?? fallback; }
  catch { return fallback; }
}

async function objectKeys($i, path) {
  try {
    if (typeof $i.db.getObjectKeys === 'function') {
      const keys = await $i.db.getObjectKeys(path);
      if (Array.isArray(keys) && keys.length) return keys.filter(Boolean).map(String);
    }
  } catch {}
  return ids(await get($i, path, {}));
}

async function seriesIdsForHeichel($i, heichelId) {
  const found = await objectKeys($i, `/social/heichelos/${heichelId}/series`);
  return Array.from(new Set(['root', ...found]));
}

async function connectedPostEntries($i, heichelId, seriesId) {
  const posts = await get($i, `/social/heichelos/${heichelId}/series/${seriesId}/posts`, {});
  if (!posts || typeof posts !== 'object' || Array.isArray(posts)) return [];
  return Object.entries(posts).filter(([, body]) => body && typeof body === 'object');
}

function normalizePost({ heichelId, seriesId, postId, body }) {
  return {
    ...body,
    id: body.id || postId,
    postId: body.postId || body.id || postId,
    heichelId,
    seriesId: body.seriesId || body.parentSeriesId || seriesId,
    parentSeriesId: body.parentSeriesId || body.seriesId || seriesId
  };
}

async function scanConnectedPosts({ $i, heichelId = '', seriesId = '' }) {
  const heichelIds = heichelId ? [heichelId] : await objectKeys($i, '/social/heichelos');
  const output = [];
  for (const hid of heichelIds) {
    const seriesIds = seriesId ? [seriesId] : await seriesIdsForHeichel($i, hid);
    for (const sid of seriesIds) {
      for (const [postId, body] of await connectedPostEntries($i, hid, sid)) {
        output.push({ heichelId: hid, seriesId: sid, postId, post: normalizePost({ heichelId: hid, seriesId: sid, postId, body }), legacyPath: `/social/heichelos/${hid}/series/${sid}/posts/${postId}` });
      }
    }
  }
  return output;
}

function writePostManifest({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const manifest = makeEntityManifest({
    kind: 'post',
    id: postId,
    paths: {
      allPosts: allPostKey({ heichelId: post.heichelId, postId }),
      legacy: `/social/heichelos/${post.heichelId}/series/${post.parentSeriesId || post.seriesId}/posts/${postId}`
    },
    indexes: {
      byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]),
      byAlias: post.aliasId || post.author ? logicalKey(['indexes', 'postsByAlias', post.aliasId || post.author, postId]) : '',
      byType: logicalKey(['indexes', 'postsByType', contentType, postId])
    },
    binaryRefs: { futureShard: 'social.allPosts.awtsdb' },
    stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 }
  });
  return writePacked({ $i, shard: 'meta', key: entityManifestKey(manifest), value: manifest, meta: { kind: 'entityManifest', entityKind: 'post' } });
}

function writePostIndexes({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const aliasId = post.aliasId || post.author || '';
  const value = { postId, heichelId: post.heichelId || '', aliasId, seriesId: post.seriesId || post.parentSeriesId || '', type: contentType, title: post.title || '', updatedAt: Date.now() };
  writePacked({ $i, shard: 'search', key: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]), value, meta: { kind: 'materializedIndex', index: 'postsByHeichel' } });
  if (aliasId) writePacked({ $i, shard: 'search', key: logicalKey(['indexes', 'postsByAlias', aliasId, postId]), value, meta: { kind: 'materializedIndex', index: 'postsByAlias' } });
  writePacked({ $i, shard: 'search', key: logicalKey(['indexes', 'postsByType', contentType, postId]), value, meta: { kind: 'materializedIndex', index: 'postsByType' } });
}

function mirrorConnectedPostToAllPosts({ $i, post }) {
  writeAllPost({ $i, post });
  writePostManifest({ $i, post });
  writePostIndexes({ $i, post });
  appendEvent({ $i, type: 'post.migrated.allPosts', actor: post.aliasId || post.author || '', entity: { kind: 'post', id: post.id || post.postId }, data: { heichelId: post.heichelId, seriesId: post.seriesId || post.parentSeriesId } });
}

function isFullAllPostRecord(record) {
  return Boolean(record?.value?._awtsmoosStorage === 'social.allPosts.awtsdb' && record.value?.connected);
}

function migrationItem(item) {
  const key = packedPostKey(item);
  return { postId: item.postId, heichelId: item.heichelId, seriesId: item.seriesId, legacyPath: item.legacyPath, packedKey: key, alreadyPacked: false, action: 'mirror' };
}

async function dryRunPostMigration({ $i, heichelId = '', seriesId = '' }) {
  const found = await scanConnectedPosts({ $i, heichelId, seriesId });
  const items = found.map(item => {
    const out = migrationItem(item);
    const existing = readPacked({ $i, shard: 'allPosts', key: out.packedKey });
    out.alreadyPacked = isFullAllPostRecord(existing);
    out.action = out.alreadyPacked ? 'skip' : existing ? 'upgrade' : 'mirror';
    return out;
  });
  return { migrationId: `connectedPosts_${Date.now()}`, type: 'connectedPostsToAllPostsAwtsdb', heichelId: heichelId || 'ALL', seriesId: seriesId || 'ALL', dryRun: true, total: items.length, toMirror: items.filter(item => item.action !== 'skip').length, items };
}

function compactManifest({ preview, mirrored, skipped, failed, sample }) {
  return {
    id: preview.migrationId,
    migrationId: preview.migrationId,
    type: preview.type,
    heichelId: preview.heichelId,
    seriesId: preview.seriesId,
    dryRun: false,
    total: preview.total,
    plannedToMirror: preview.toMirror,
    mirrored,
    skipped,
    failed,
    sample,
    finishedAt: Date.now()
  };
}

async function runPostMigration({ $i, heichelId = '', seriesId = '', limit = 10000, dryRun = false }) {
  const preview = await dryRunPostMigration({ $i, heichelId, seriesId });
  if (dryRun) return preview;
  const found = await scanConnectedPosts({ $i, heichelId, seriesId });
  let mirrored = 0;
  const skipped = [];
  const failed = [];
  const sample = [];
  for (const item of found) {
    if (mirrored >= limit) break;
    const key = packedPostKey(item);
    if (isFullAllPostRecord(readPacked({ $i, shard: 'allPosts', key }))) { skipped.push(item.postId); continue; }
    try {
      mirrorConnectedPostToAllPosts({ $i, post: { ...item.post, migratedAt: Date.now() } });
      mirrored++;
      if (sample.length < 20) sample.push(migrationItem(item));
    } catch (error) {
      failed.push({ postId: item.postId, heichelId: item.heichelId, seriesId: item.seriesId, message: error.message });
    }
  }
  const manifest = compactManifest({ preview, mirrored, skipped: skipped.length, failed, sample });
  writeMigrationManifest({ $i, manifest });
  return manifest;
}

module.exports = { packedPostKey, scanConnectedPosts, dryRunPostMigration, runPostMigration, mirrorConnectedPostToAllPosts };
