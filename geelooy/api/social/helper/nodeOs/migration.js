// B"H
/**
 * @module NodeOsMigration
 * @description
 * Chapter 187: Legacy social objects are not erased; they are mounted. This
 * migration builds filesystem nodes from existing Heichel posts, entity universe
 * records, comment trees, and alias assets with dry-run support.
 */

const { writeNode, mountUniverseEntity, mountAliasAssets } = require('./nodeOsStore.js');
const { nodeIdFrom } = require('./nodeOsSchema.js');
const paths = require('./nodeOsPaths.js');

function ids(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value && typeof value === 'object') return Object.keys(value).filter(Boolean).map(String);
  return [];
}

async function read($i, path, fallback = null) {
  try { return (await $i.db.get(path)) ?? fallback; } catch { return fallback; }
}

async function scanLegacyPosts($i) {
  const heichelIds = ids(await read($i, '/social/heichelos', {}));
  const out = [];
  for (const heichelId of heichelIds) {
    const postIds = ids(await read($i, `/social/heichelos/${heichelId}/postIds`, {}));
    for (const postId of postIds) {
      const post = await read($i, `/social/heichelos/${heichelId}/posts/${postId}`, null);
      if (post) out.push({ heichelId, postId, post });
    }
  }
  return out;
}

async function scanUniverse($i) {
  const root = await read($i, '/social/entityUniverse/global', {});
  const out = [];
  for (const type of ids(root)) {
    for (const id of ids(await read($i, `/social/entityUniverse/global/${type}`, []))) out.push({ type, id });
  }
  return out;
}

async function dryRunNodeOsMigration({ $i }) {
  const legacyPosts = await scanLegacyPosts($i);
  const universe = await scanUniverse($i);
  return { success: { dryRun: true, legacyPosts: legacyPosts.length, universeEntities: universe.length, plan: [...legacyPosts.map(item => ({ action: 'mountLegacyPost', heichelId: item.heichelId, postId: item.postId })), ...universe.map(item => ({ action: 'mountUniverseEntity', ...item }))] } };
}

async function runNodeOsMigration({ $i, dryRun = false, aliasIds = [] }) {
  const preview = await dryRunNodeOsMigration({ $i });
  if (dryRun) return preview;
  const mounted = [];
  for (const item of await scanLegacyPosts($i)) {
    mounted.push((await writeNode({ $i, input: { id: nodeIdFrom('legacyPost', `${item.heichelId}/${item.postId}`), kind: 'legacyPost', title: item.post.title || item.postId, path: `${paths.heichelRoot(item.heichelId)}/LegacyPosts/${item.postId}`, source: { legacy: true, heichelId: item.heichelId, postId: item.postId }, content: item.post.content || item.post.rootContent || '', meta: { post: item.post } } })).success);
  }
  for (const item of await scanUniverse($i)) {
    const result = await mountUniverseEntity({ $i, type: item.type, id: item.id });
    if (result.success) mounted.push(result.success);
  }
  for (const aliasId of aliasIds) mounted.push(...((await mountAliasAssets({ $i, aliasId })).success || []));
  const manifest = { id: `nodeOs_${Date.now()}`, mounted: mounted.length, preview: preview.success, aliasIds, finishedAt: Date.now() };
  await $i.db.write(`/social/nodeOs/migrations/${manifest.id}`, manifest);
  return { success: manifest };
}

module.exports = { scanLegacyPosts, scanUniverse, dryRunNodeOsMigration, runNodeOsMigration };
