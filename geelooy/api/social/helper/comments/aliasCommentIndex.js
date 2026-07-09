// B"H
/**
 * @module AliasCommentIndex
 * @description
 * A profile index must be a map, not a second body. Comment bodies remain in
 * the universal comment-tree; this separate packed file stores only compact
 * per-post pointer lists. Directory names are URI-safe inside the packed DB,
 * but API callers receive decoded heichel, series, and post ids.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const FILE = 'social.aliasCommentIndex.fs.awtsdb';
const cache = new Map();
function dbRoot($i) { return $i?.db?.directory || $i?.db?.root || process.cwd(); }
function dbFile($i) { return path.join(dbRoot($i), 'socialPacked', FILE); }
function enc(v) { return encodeURIComponent(String(v ?? 'root')); }
function dec(v) { try { return decodeURIComponent(String(v)); } catch { return String(v); } }
function key(parts) { return '/' + parts.filter(Boolean).map(enc).join('/'); }
function open($i, readOnly = false) {
  const file = dbFile($i);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const seal = `${file}:${readOnly}`;
  if (cache.has(seal)) return cache.get(seal);
  const db = new AwtsmoosDB(file, { debug: false, readOnly, wal: false, processLockMode: readOnly ? 'shared' : 'exclusive', lockMode: readOnly ? 'shared' : 'exclusive' });
  db.open();
  cache.set(seal, db);
  return db;
}
function list(db, p) { try { return (db.fs.ls(p) || []).map(dec); } catch { return []; } }
function readRaw(db, p, fallback = []) {
  const st = db.fs.stat(p);
  if (!st?.exists || st.type !== 'file') return fallback;
  return awts.deserializeBinary(db.fs.readRange(p, 0, st.size));
}
function writeRaw(db, p, value) { db.fs.write(p, Array.isArray(value) ? awts.serializeArray(value) : awts.serializeJSON(value ?? {})); }
function uniqPush(rows, item) { return [item, ...(Array.isArray(rows) ? rows : []).filter(x => x?.commentId !== item.commentId)]; }
function pointer(c) {
  return {
    commentId: c.id,
    aliasId: c.aliasId || c.author,
    heichelId: c.heichelId,
    seriesId: c.seriesId || 'root',
    postId: c.postId || c.entityId,
    parentId: c.parentId || '',
    parentType: c.parentType || 'entity',
    parentSectionId: c.parentSectionId || '',
    verseSection: c.verseSection || '',
    subsectionId: c.subsectionId || '',
    createdAt: c.createdAt || Date.now(),
    updatedAt: c.updatedAt || Date.now(),
    deleted: Boolean(c.deleted)
  };
}
function postPath(aliasId, heichelId, seriesId, postId) { return key(['aliases', aliasId, 'comments', 'heichel', heichelId, 'series', seriesId || 'root', 'post', postId, 'all']); }
async function indexAliasComment({ $i, comment }) {
  if (!comment?.id || !(comment.aliasId || comment.author)) return null;
  const p = pointer(comment);
  const db = open($i, false);
  const target = postPath(p.aliasId, p.heichelId, p.seriesId, p.postId);
  writeRaw(db, target, uniqPush(readRaw(db, target, []), p));
  db.fs.flush?.();
  return { success: p };
}
function heichelosFor($i, aliasId) { return list(open($i, true), key(['aliases', aliasId, 'comments', 'heichel'])); }
function seriesFor($i, aliasId, heichelId) { return list(open($i, true), key(['aliases', aliasId, 'comments', 'heichel', heichelId, 'series'])); }
function postsFor($i, aliasId, heichelId, seriesId) { return list(open($i, true), key(['aliases', aliasId, 'comments', 'heichel', heichelId, 'series', seriesId, 'post'])); }
function forPost($i, aliasId, heichelId, seriesId, postId) { return readRaw(open($i, true), postPath(aliasId, heichelId, seriesId, postId), []); }
function forSeries($i, aliasId, heichelId, seriesId) { return postsFor($i, aliasId, heichelId, seriesId).flatMap(postId => forPost($i, aliasId, heichelId, seriesId, postId)); }
function forHeichel($i, aliasId, heichelId) { return seriesFor($i, aliasId, heichelId).flatMap(seriesId => forSeries($i, aliasId, heichelId, seriesId)); }
function allFor($i, aliasId) { return heichelosFor($i, aliasId).flatMap(heichelId => forHeichel($i, aliasId, heichelId)); }
module.exports = { FILE, dbFile, indexAliasComment, heichelosFor, seriesFor, postsFor, allFor, forHeichel, forSeries, forPost, postPath };
