//B"H
/**
 * @module postMigration
 * @description
 * Dry-run and repair helpers for lifting legacy series posts into packed
 * social sidecars without destructively changing old DosDB paths.
 */

const { logicalKey } = require('./shardPaths.js');
const { mirrorPost, readPacked, writeMigrationManifest } = require('./socialPacked.js');

function legacyPostPath({ heichelId, seriesId, postId }) {
  return `/social/heichelos/${heichelId}/series/${seriesId}/posts/${postId}`;
}

function packedPostKey({ heichelId, postId }) {
  return logicalKey(['posts', heichelId, postId]);
}

async function scanLegacyPosts({ $i, heichelId, seriesId }) {
  const base = `/social/heichelos/${heichelId}/series/${seriesId}/posts`;
  const posts = await $i.db.get(base).catch(() => null);
  if (!posts || typeof posts !== 'object') return [];
  if (Array.isArray(posts)) {
    const out = [];
    for (const postId of posts) {
      const record = await $i.db.get(`${base}/${postId}`).catch(() => null);
      if (record) out.push({ postId, record, legacyPath: `${base}/${postId}` });
    }
    return out;
  }
  return Object.entries(posts).map(([postId, record]) => ({ postId, record, legacyPath: `${base}/${postId}` }));
}

async function dryRunPostMigration({ $i, heichelId, seriesId }) {
  const found = await scanLegacyPosts({ $i, heichelId, seriesId });
  const items = found.map(item => {
    const key = packedPostKey({ heichelId, postId: item.postId });
    const exists = Boolean(readPacked({ $i, shard: 'core', key }));
    return {
      postId: item.postId,
      legacyPath: item.legacyPath,
      packedKey: key,
      alreadyPacked: exists,
      action: exists ? 'skip' : 'mirror'
    };
  });
  return {
    migrationId: `postsV2_${heichelId}_${seriesId}_${Date.now()}`,
    type: 'postsV2',
    heichelId,
    seriesId,
    dryRun: true,
    total: items.length,
    toMirror: items.filter(item => item.action === 'mirror').length,
    items
  };
}

async function runPostMigration({ $i, heichelId, seriesId, limit = 100 }) {
  const dry = await dryRunPostMigration({ $i, heichelId, seriesId });
  const found = await scanLegacyPosts({ $i, heichelId, seriesId });
  let mirrored = 0;
  for (const item of found) {
    if (mirrored >= limit) break;
    const key = packedPostKey({ heichelId, postId: item.postId });
    if (readPacked({ $i, shard: 'core', key })) continue;
    mirrorPost({
      $i,
      post: {
        id: item.postId,
        postId: item.postId,
        heichelId,
        seriesId,
        parentSeriesId: seriesId,
        ...item.record
      }
    });
    mirrored++;
  }
  const manifest = {
    ...dry,
    id: dry.migrationId,
    dryRun: false,
    mirrored,
    finishedAt: Date.now()
  };
  writeMigrationManifest({ $i, manifest });
  return manifest;
}

module.exports = {
  legacyPostPath,
  packedPostKey,
  scanLegacyPosts,
  dryRunPostMigration,
  runPostMigration
};
