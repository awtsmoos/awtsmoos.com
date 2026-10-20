//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module ConnectedPostMigrationWrite
 * @description Manifest/index writing, mirroring and migration runs for the post migrator (split from postMigration.js, verbatim).
 */

	const { logicalKey } = require('./shardPaths.js');
	const { appendEvent, writeMigrationManifest, writePacked } = require('./socialPacked.js');
	const { allPostKey, writeAllPost } = require('./allPostsIndex.js');
	const { entityManifestKey, makeEntityManifest } = require('./entityManifest.js');
	const { existingAllPostState, packedPostKey, scanConnectedPosts } = require('./postMigrationScan.js');

function writePostManifest({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const manifest = makeEntityManifest({ kind: 'post', id: postId, paths: { allPosts: allPostKey({ heichelId: post.heichelId, postId }), legacy: `/social/heichelos/${post.heichelId}/series/${post.parentSeriesId || post.seriesId}/posts/${postId}` }, indexes: { byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]), byAlias: post.aliasId || post.author ? logicalKey(['indexes', 'postsByAlias', post.aliasId || post.author, postId]) : '', byType: logicalKey(['indexes', 'postsByType', contentType, postId]) }, binaryRefs: { futureShard: 'social.allPosts.awtsdb' }, stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 } });
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
  const postId = post.id || post.postId;
  writePacked({ $i, shard: 'core', key: logicalKey(['posts', post.heichelId, postId]), value: post, meta: { kind: 'post', migrated: true } });
  writeAllPost({ $i, post });
  writePostManifest({ $i, post });
  writePostIndexes({ $i, post });
  appendEvent({ $i, type: 'post.migrated.allPosts', actor: post.aliasId || post.author || '', entity: { kind: 'post', id: postId }, data: { heichelId: post.heichelId, seriesId: post.seriesId || post.parentSeriesId } });
}

function migrationItem(item) { const key = packedPostKey(item); return { postId: item.postId, heichelId: item.heichelId, seriesId: item.seriesId, legacyPath: item.legacyPath, packedKey: key, action: 'mirror' }; }

async function dryRunPostMigration({ $i, heichelId = '', seriesId = '' }) {
  const existing = existingAllPostState($i);
  const items = (await scanConnectedPosts({ $i, heichelId, seriesId })).map(item => ({ ...migrationItem(item), action: existing.get(packedPostKey(item)) === 'full' ? 'skip' : existing.has(packedPostKey(item)) ? 'upgrade' : 'mirror' }));
  return { migrationId: `connectedPosts_${Date.now()}`, type: 'connectedPostsToAllPostsAwtsdb', heichelId: heichelId || 'ALL', seriesId: seriesId || 'ALL', dryRun: true, total: items.length, toMirror: items.filter(item => item.action !== 'skip').length, items };
}

function compactManifest({ preview, mirrored, skipped, failed, sample }) { return { id: preview.migrationId, migrationId: preview.migrationId, type: preview.type, heichelId: preview.heichelId, seriesId: preview.seriesId, dryRun: false, total: preview.total, plannedToMirror: preview.toMirror, mirrored, skipped, failed, sample, finishedAt: Date.now() }; }

async function runPostMigration({ $i, heichelId = '', seriesId = '', limit = 10000, dryRun = false }) {
  const preview = await dryRunPostMigration({ $i, heichelId, seriesId });
  if (dryRun) return preview;
  const existing = existingAllPostState($i);
  let mirrored = 0;
  const skipped = [];
  const failed = [];
  const sample = [];
  for (const item of await scanConnectedPosts({ $i, heichelId, seriesId })) {
    const key = packedPostKey(item);
    if (mirrored >= limit) break;
    if (existing.get(key) === 'full') { skipped.push(item.postId); continue; }
    try { mirrorConnectedPostToAllPosts({ $i, post: { ...item.post, migratedAt: Date.now() } }); existing.set(key, 'full'); mirrored++; if (sample.length < 20) sample.push(migrationItem(item)); }
    catch (error) { failed.push({ postId: item.postId, heichelId: item.heichelId, seriesId: item.seriesId, message: error.message }); }
  }
  const manifest = compactManifest({ preview, mirrored, skipped: skipped.length, failed, sample });
  writeMigrationManifest({ $i, manifest });
  return manifest;
}

module.exports = {
	dryRunPostMigration,
	mirrorConnectedPostToAllPosts,
	runPostMigration
};
