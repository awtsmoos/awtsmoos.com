// B"H
/**
 * @module SocialRagComments
 * @description
 * The vector hit is a lantern, not the body. First it seeks the new corpus
 * shards written by the normal AwtsmoosDB runtime; if the shard is absent it
 * falls back to the old main packed DB through $i.db. CommentTree still wins
 * for Meluket because that is the newer living form.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const richPaths = require('../../comments/richCommentPaths.js');
const { dbRoot } = require('./paths.js');
const shardCache = new Map();
async function get($i, p) { try { return await $i.db.get(p); } catch { return null; } }
function manifestPath($i) { return path.join(dbRoot($i), 'socialPacked', 'comment-corpus-shards.v2.manifest.json'); }
function readManifest($i) { try { return JSON.parse(fs.readFileSync(manifestPath($i), 'utf8')); } catch { return null; } }
function parseLegacyPath(p) {
  const m = String(p || '').replace(/\.(awtsmoosJSON|json)$/i, '').match(/\/social\/heichelos\/([^/]+)\/comments\/atSeries\/([^/]+)\/atPost\/([^/]+)\/([^/.]+)/);
  return m ? { heichelId: m[1], seriesId: m[2], postId: m[3], aliasId: m[4] } : null;
}
function shardFor($i, legacyPath) {
  const info = parseLegacyPath(legacyPath);
  if (!info) return null;
  const manifest = readManifest($i);
  return (manifest?.shards || []).find(s => s.alias === info.aliasId && s.series && s.series[info.seriesId] && fs.existsSync(s.file)) || null;
}
function safeClose(db) { try { db.pager?.close?.(); } catch {} try { db.processLock?.release?.(); } catch {} }
function readShardObject($i, legacyPath) {
  const shard = shardFor($i, legacyPath);
  if (!shard) return null;
  let db = shardCache.get(shard.file);
  if (!db) {
    db = new AwtsmoosDB(shard.file, { debug: false, readOnly: true, wal: false, processLockMode: 'shared', lockMode: 'shared' });
    db.open();
    shardCache.set(shard.file, db);
  }
  const p = String(legacyPath || '').replace(/\.(awtsmoosJSON|json)$/i, '');
  const st = db.fs.stat(p);
  if (!st?.exists || st.type !== 'file') return null;
  return { object: awts.deserializeBinary(db.fs.readRange(p, 0, st.size)), shard };
}
function verseOf(row, fallback) { return String(row?.verseSection ?? row?.dayuh?.verseSection ?? fallback ?? ''); }
function subsectionRaw(row) { return row?.dayuh?.subSection ?? row?.subSection ?? row?.subsection ?? ''; }
function subsectionId(row) {
  if (row?.subsectionId) return row.subsectionId;
  const verse = verseOf(row), sub = subsectionRaw(row);
  if (sub === '' || sub == null) return verse || '';
  return `${verse}:${sub}`;
}
function flatten(obj) {
  const out = [];
  for (const [verseSection, rows] of Object.entries(obj || {})) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) out.push({ ...row, verseSection: verseOf(row, verseSection) });
  }
  return out;
}
function context(hit, id) { return { heichelId: hit.heichelId || 'ikar', postId: hit.postId, commentId: id }; }
function slim(row, extra = {}) {
  if (!row) return null;
  const aliasId = row.aliasId || row.author || row.authorAliasId || row.dayuh?.aliasId || extra.aliasId || '';
  const verseSection = verseOf(row, extra.verseSection);
  const subRaw = subsectionRaw(row);
  return {
    id: row.id,
    aliasId,
    author: row.author || aliasId,
    heichelId: row.heichelId || extra.heichelId || 'ikar',
    seriesId: row.seriesId || extra.seriesId || '',
    postId: row.postId || row.entityId || extra.postId || '',
    verseSection,
    verseNumber: verseSection,
    subsection: subRaw,
    subsectionId: subsectionId(row),
    parentId: row.parentId || '',
    parentType: row.parentType || extra.parentType || 'entity',
    parentSectionId: row.parentSectionId || '',
    isReply: Boolean(row.parentId),
    content: row.content,
    dayuh: row.dayuh || null
  };
}
function fallbackMeta(hit, id) {
  return { id, aliasId: hit.aliasId || hit.author || hit.commentAlias || '', heichelId: hit.heichelId || 'ikar', seriesId: hit.seriesId || '', postId: hit.postId || '', verseSection: hit.verseStart || hit.verseSection || '', parentType: hit.parentType || 'entity' };
}
async function legacyObject($i, hit) {
  if (!hit.commentPath) return { object: null, source: 'missing', shard: null };
  const shardHit = readShardObject($i, hit.commentPath);
  if (shardHit?.object) return { object: shardHit.object, source: 'corpusShard', shard: shardHit.shard };
  return { object: await get($i, hit.commentPath), source: 'legacyAliasObject', shard: null };
}
async function originalRowsForHit({ $i, hit, maxRows = 25 }) {
  const ids = (hit.commentIds || [hit.firstCommentId, hit.lastCommentId]).filter(Boolean).slice(0, maxRows);
  const legacy = await legacyObject($i, hit);
  const byId = new Map(flatten(legacy.object).map(row => [row.id, row]));
  const out = [];
  for (const id of ids) {
    const richPath = richPaths.commentPath(context(hit, id));
    const rich = await get($i, richPath);
    const legacyRow = byId.get(id) || null;
    const row = rich || legacyRow || null;
    const meta = fallbackMeta(hit, id);
    const source = rich ? 'commentTree' : legacyRow ? legacy.source : 'missing';
    out.push({ id, found: Boolean(row), source, sourcePath: rich ? richPath : hit.commentPath || '', shardFile: !rich && legacyRow ? legacy.shard?.file || '' : '', row: slim(row, meta), provenance: row ? slim(row, meta) : meta });
  }
  return out;
}
async function joinComments({ $i, hits, maxRows }) {
  const out = [];
  for (const hit of hits) out.push({ ...hit, comments: await originalRowsForHit({ $i, hit: hit.row, maxRows }) });
  return out;
}
process.once('exit', () => { for (const db of shardCache.values()) safeClose(db); });
module.exports = { originalRowsForHit, joinComments, subsectionId, readShardObject };
