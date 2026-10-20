//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module ConnectedPostMigrationScan
 * @description Connected-post scanning and existing all-post state (state owner) for the post migrator (split from postMigration.js, verbatim).
 */

	const { listPackedRecords } = require('./socialPacked.js');
	const { allPostKey } = require('./allPostsIndex.js');

const existingAllPostsByRoot = new Map();

function dbRoot($i) { return process.awtsmoosDbPath || $i?.db?.directory || process.cwd(); }
function packedPostKey({ heichelId, postId }) { return allPostKey({ heichelId, postId }); }
function ids(value) { return Array.isArray(value) ? value.filter(Boolean).map(String) : value && typeof value === 'object' ? Object.keys(value).filter(Boolean).map(String) : []; }
async function get($i, path, fallback = null) { try { return (await $i.db.get(path, { max: true })) ?? fallback; } catch { return fallback; } }

async function objectKeys($i, path) {
  try {
    if (typeof $i.db.getObjectKeys === 'function') {
      const keys = await $i.db.getObjectKeys(path);
      if (Array.isArray(keys) && keys.length) return keys.filter(Boolean).map(String);
    }
  } catch {}
  return ids(await get($i, path, {}));
}

function isFullAllPostRecord(record) { return Boolean(record?.value?._awtsmoosStorage === 'social.allPosts.awtsdb' && record.value?.connected); }

function existingAllPostState($i) {
  const root = dbRoot($i);
  if (existingAllPostsByRoot.has(root)) return existingAllPostsByRoot.get(root);
  const state = new Map();
  for (const record of listPackedRecords({ $i, shard: 'allPosts' })) {
    if (record?.key) state.set(record.key, isFullAllPostRecord(record) ? 'full' : 'compact');
  }
  existingAllPostsByRoot.set(root, state);
  return state;
}

async function seriesIdsForHeichel($i, heichelId) {
  return Array.from(new Set(['root', ...(await objectKeys($i, `/social/heichelos/${heichelId}/series`))]));
}

async function connectedPostEntries($i, heichelId, seriesId) {
  const basePath = `/social/heichelos/${heichelId}/series/${seriesId}/posts`;
  const posts = await get($i, basePath, {});
  if (!posts || typeof posts !== 'object' || Array.isArray(posts)) return [];
  const entries = [];
  for (const [postId, body] of Object.entries(posts)) {
    if (body && typeof body === 'object') {
      entries.push([postId, body]);
      continue;
    }
    const child = await get($i, `${basePath}/${postId}`, null);
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      entries.push([postId, child]);
      continue;
    }
    const canonical = await get($i, `/social/heichelos/${heichelId}/posts/${postId}`, null);
    if (canonical && typeof canonical === 'object' && !Array.isArray(canonical)) entries.push([postId, canonical]);
  }
  return entries;
}

function normalizePost({ heichelId, seriesId, postId, body }) {
  return { ...body, id: body.id || postId, postId: body.postId || body.id || postId, heichelId, seriesId: body.seriesId || body.parentSeriesId || seriesId, parentSeriesId: body.parentSeriesId || body.seriesId || seriesId };
}

async function scanConnectedPosts({ $i, heichelId = '', seriesId = '' }) {
  const heichelIds = heichelId ? [heichelId] : await objectKeys($i, '/social/heichelos');
  const output = [];
  for (const hid of heichelIds) {
    const seriesIds = seriesId ? [seriesId] : await seriesIdsForHeichel($i, hid);
    for (const sid of seriesIds) for (const [postId, body] of await connectedPostEntries($i, hid, sid)) output.push({ heichelId: hid, seriesId: sid, postId, post: normalizePost({ heichelId: hid, seriesId: sid, postId, body }), legacyPath: `/social/heichelos/${hid}/series/${sid}/posts/${postId}` });
  }
  return output;
}

module.exports = {
	dbRoot,
	existingAllPostState,
	packedPostKey,
	scanConnectedPosts
};
