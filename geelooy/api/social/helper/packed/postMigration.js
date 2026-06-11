//B"H
/**
 * @module ConnectedPostMigration
 * @description
 * Chapter 108: Only posts truly tied into a Heichel series are lifted.
 *
 * The migration is additive: it mirrors connected legacy DosDB posts into
 * `social.core.awtsdb` and the global `social.allPosts.awtsdb` census, then
 * records metadata in `social.meta.awtsdb`. It never deletes or rewrites the old
 * system, and it skips orphan post bodies that are not referenced by a series.
 */

const { logicalKey } = require('./shardPaths.js');
const { mirrorPost, readPacked, writeMigrationManifest } = require('./socialPacked.js');

function packedPostKey({ heichelId, postId }) {
  return logicalKey(['posts', heichelId, postId]);
}

function ids(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value && typeof value === 'object') return Object.keys(value).filter(Boolean).map(String);
  return [];
}

async function get($i, path, fallback = null) {
  try { return (await $i.db.get(path)) ?? fallback; }
  catch { return fallback; }
}

async function seriesIdsForHeichel($i, heichelId) {
  const root = await get($i, `/social/heichelos/${heichelId}/series`, {});
  return ids(root).includes('root') ? ids(root) : ['root', ...ids(root)];
}

async function connectedPostIds($i, heichelId, seriesId) {
  return ids(await get($i, `/social/heichelos/${heichelId}/series/${seriesId}/posts`, {}));
}

async function postBody($i, heichelId, postId) {
  return await get($i, `/social/heichelos/${heichelId}/posts/${postId}`, null);
}

function normalizePost({ heichelId, seriesId, postId, body }) {
  return { ...body, id: body.id || postId, postId: body.postId || postId, heichelId, seriesId: body.seriesId || body.parentSeriesId || seriesId, parentSeriesId: body.parentSeriesId || body.seriesId || seriesId };
}

async function scanConnectedPosts({ $i, heichelId = '', seriesId = '' }) {
  const heichelIds = heichelId ? [heichelId] : ids(await get($i, '/social/heichelos', {}));
  const output = [];
  for (const hid of heichelIds) {
    const seriesIds = seriesId ? [seriesId] : await seriesIdsForHeichel($i, hid);
    for (const sid of seriesIds) {
      for (const postId of await connectedPostIds($i, hid, sid)) {
        const body = await postBody($i, hid, postId);
        if (!body || typeof body !== 'object') continue;
        output.push({ heichelId: hid, seriesId: sid, postId, post: normalizePost({ heichelId: hid, seriesId: sid, postId, body }), legacyPath: `/social/heichelos/${hid}/posts/${postId}` });
      }
    }
  }
  return output;
}

async function dryRunPostMigration({ $i, heichelId = '', seriesId = '' }) {
  const found = await scanConnectedPosts({ $i, heichelId, seriesId });
  const items = found.map(item => {
    const key = packedPostKey(item);
    const exists = Boolean(readPacked({ $i, shard: 'core', key }));
    return { postId: item.postId, heichelId: item.heichelId, seriesId: item.seriesId, legacyPath: item.legacyPath, packedKey: key, alreadyPacked: exists, action: exists ? 'skip' : 'mirror' };
  });
  return { migrationId: `connectedPosts_${Date.now()}`, type: 'connectedPostsToAwtsdb', heichelId: heichelId || 'ALL', seriesId: seriesId || 'ALL', dryRun: true, total: items.length, toMirror: items.filter(item => item.action === 'mirror').length, items };
}

async function runPostMigration({ $i, heichelId = '', seriesId = '', limit = 10000, dryRun = false }) {
  const preview = await dryRunPostMigration({ $i, heichelId, seriesId });
  if (dryRun) return preview;
  const found = await scanConnectedPosts({ $i, heichelId, seriesId });
  let mirrored = 0;
  const skipped = [];
  for (const item of found) {
    if (mirrored >= limit) break;
    const key = packedPostKey(item);
    if (readPacked({ $i, shard: 'core', key })) { skipped.push(item.postId); continue; }
    mirrorPost({ $i, post: { ...item.post, migratedAt: Date.now() } });
    mirrored++;
  }
  const manifest = { ...preview, id: preview.migrationId, dryRun: false, mirrored, skipped: skipped.length, finishedAt: Date.now() };
  writeMigrationManifest({ $i, manifest });
  return manifest;
}

module.exports = { packedPostKey, scanConnectedPosts, dryRunPostMigration, runPostMigration };
