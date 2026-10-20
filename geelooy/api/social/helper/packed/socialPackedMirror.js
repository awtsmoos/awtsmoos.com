//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked single-post mirrors, manifests, indexes, events and excerpts (split from socialPacked.js).
 */
const { logicalKey } = require('./shardPaths.js');
const { makeEntityManifest, entityManifestKey } = require('./entityManifest.js');
const { engineFor } = require('./socialPackedEngine.js');
const { writePacked } = require('./socialPackedCore.js');
function writeManifest({ $i, manifest }) { return writePacked({ $i, shard: 'meta', key: entityManifestKey(manifest), value: manifest, meta: { kind: 'entityManifest', entityKind: manifest.kind } }); }
function writeIndex({ $i, key, value, meta }) { return writePacked({ $i, shard: 'search', key, value, meta: { kind: 'materializedIndex', ...meta } }); }
function appendEvent({ $i, type, actor = '', entity = {}, data = {} }) {
  const event = { id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`, type, actor, entity, data, createdAt: Date.now() };
  return writePacked({ $i, shard: 'audit', key: logicalKey(['events', type, event.id]), value: event, meta: { kind: 'socialEvent', type } });
}
/**
 * B"H 2026-10-13 (social-feed-audit): smart excerpt extraction.
 * Imported posts (maamarim, encyclopedia, translations) store their text in
 * `units[]` (bilingual hebrew/english), not in a flat `content` field — so the
 * old `post.content || post.description` logic produced empty excerpts for
 * every imported post. This scans direct fields first, then units (English
 * preferred, Hebrew fallback), then sections. Markdown artifacts stripped.
 */
function excerptOf(post) {
  if (!post || typeof post !== 'object') return '';
  const clean = (t) => String(t || '')
    .replace(/[#*`_>\[\](){}|~\\]/g, ' ')
    .replace(/https?:\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const direct = post.content || post.description || post.summary || post.body || post.text || '';
  if (direct && clean(direct).length > 20) return clean(direct).slice(0, 280);
  const units = Array.isArray(post.units) ? post.units : [];
  for (const u of units) {
    if (!u || typeof u !== 'object') continue;
    const t = clean(u.english || u.text || u.content || '');
    if (t.length > 40) return t.slice(0, 280);
  }
  for (const u of units) {
    if (!u || typeof u !== 'object') continue;
    const t = clean(u.hebrew || '');
    if (t.length > 40) return t.slice(0, 280);
  }
  const secs = Array.isArray(post.sections) ? post.sections : [];
  for (const s of secs) {
    const t = clean((s && (s.text || s.content || s.body)) || '');
    if (t.length > 40) return t.slice(0, 280);
  }
  return '';
}
function allPostValue(post) {
  const postId = post.id || post.postId;
  return { postId, heichelId: post.heichelId || '', seriesId: post.seriesId || post.parentSeriesId || 'root', aliasId: post.aliasId || post.author || '', authorName: post.authorName || '', authorHandle: post.authorHandle || '', type: post.contentType || post.postType || 'post', title: post.title || post.name || '', excerpt: excerptOf(post), connected: true, basePostId: post.basePostId || post.base_post_id || '', parentPostId: post.parentPostId || post.parent_post_id || '', kind: post.kind || '', updatedAt: post.updatedAt || post.createdAt || post.timestamp || Date.now() };
}
function mirrorAllPost({ $i, post }) {
  const value = allPostValue(post);
  return writePacked({ $i, shard: 'allPosts', key: logicalKey(['allPosts', value.heichelId, value.postId]), value, meta: { kind: 'allPost', aliasId: value.aliasId, heichelId: value.heichelId, seriesId: value.seriesId } });
}
function indexPost({ $i, value }) {
  writeIndex({ $i, key: logicalKey(['indexes', 'postsByHeichel', value.heichelId, value.postId]), value, meta: { index: 'postsByHeichel' } });
  if (value.aliasId) writeIndex({ $i, key: logicalKey(['indexes', 'postsByAlias', value.aliasId, value.postId]), value, meta: { index: 'postsByAlias' } });
  writeIndex({ $i, key: logicalKey(['indexes', 'postsByType', value.type, value.postId]), value, meta: { index: 'postsByType' } });
  if (value.parentPostId) writeIndex({ $i, key: logicalKey(['indexes', 'postsByParent', value.parentPostId, value.postId]), value, meta: { index: 'postsByParent' } });
}
function mirrorPost({ $i, post }) {
  const postId = post.id || post.postId;
  const contentType = post.contentType || post.postType || 'post';
  const coreKey = logicalKey(['posts', post.heichelId, postId]);
  const write = writePacked({ $i, shard: 'core', key: coreKey, value: post, meta: { kind: 'post', type: contentType } });
  const allPost = mirrorAllPost({ $i, post }).value;
  writeManifest({ $i, manifest: makeEntityManifest({ kind: 'post', id: postId, paths: { core: coreKey, allPosts: logicalKey(['allPosts', post.heichelId, postId]) }, indexes: { byHeichel: logicalKey(['indexes', 'postsByHeichel', post.heichelId, postId]) }, binaryRefs: { engine: engineFor($i, 'core') }, stats: { sections: Array.isArray(post.sections) ? post.sections.length : 0 } }) });
  indexPost({ $i, value: allPost });
  appendEvent({ $i, type: 'post.mirrored', actor: allPost.aliasId, entity: { kind: 'post', id: postId }, data: { heichelId: post.heichelId, contentType } });
  return write;
}
module.exports = { writeManifest, writeIndex, appendEvent, excerptOf, allPostValue, mirrorAllPost, indexPost, mirrorPost };
