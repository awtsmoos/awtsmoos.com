#!/usr/bin/env node
// B"H
/**
 * Search Meluket RAG, then dereference the hit back to original comment rows.
 *
 * The RAG shard is only the lantern. The original comments AwtsmoosDB is the
 * scroll. For every hit, this opens the live packed comments DB, reads the
 * referenced alias object, finds each exact commentId, and prints the original
 * row.content verbatim with verse/subsection metadata.
 */
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { embedTextAuto } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const RAG_DB = path.join(RAG, 'meluket-english-comments-rag.awtsdb');
const COMMENTS_DB = path.join(ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const LIST = 'meluketEnglishCommentVectors';
const TOP_K = Number(process.env.TOP_K || 1);
const QUERIES = process.argv.slice(2).length ? process.argv.slice(2) : ['worry and anxiety', 'fear of the future'];

function dot(a, b) {
  let d = 0, aa = 0, bb = 0;
  const n = Math.min(a?.length || 0, b?.length || 0);
  for (let i = 0; i < n; i += 1) {
    const x = Number(a[i]) || 0;
    const y = Number(b[i]) || 0;
    d += x * y; aa += x * x; bb += y * y;
  }
  return d / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1));
}
function rowsOf(list) {
  const plain = list?.__resolve__?.();
  return Array.isArray(plain) ? plain : Array.from({ length: Number(list.length || 0) }, (_, i) => list[i]);
}
function vectorProof(db) {
  const sys = db.root.__sys_vector__;
  const meta = sys?.[LIST] || sys?.get?.(LIST);
  return { vectorEnabled: Boolean(meta), vectorMeta: meta || null, regLength: meta ? sys?.[meta.regPath]?.length : null };
}
function readObject(db, virtualPath) {
  const candidates = [virtualPath, `${virtualPath}.awtsmoosJSON`];
  for (const path of candidates) {
    const stat = db.fs.stat(path);
    if (stat?.exists && stat.type === 'file' && stat.size) {
      return { path, object: awts.deserializeBinary(db.fs.readRange(path, 0, stat.size)) };
    }
  }
  throw new Error(`Missing original comment object: ${virtualPath}`);
}
function flattenOriginal(obj) {
  const out = [];
  for (const [verseSection, rows] of Object.entries(obj || {})) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) out.push({ ...row, verseSection: String(row.verseSection ?? row.dayuh?.verseSection ?? verseSection) });
  }
  return out;
}
function originalRowsForHit(commentsDb, hit) {
  const original = readObject(commentsDb, hit.commentPath);
  const byId = new Map(flattenOriginal(original.object).map(row => [row.id, row]));
  return (hit.commentIds || []).map((id, offset) => ({ offset, id, sourcePath: original.path, row: byId.get(id) || null }));
}
function line(label, value = '') {
  console.log(label);
  console.log(String(value ?? ''));
  console.log('');
}
function renderHit(query, hit, rank, exactRows) {
  console.log('################################################################################');
  line('RAG QUERY', query);
  line('RAG RANK', rank);
  line('RAG SCORE', hit.score.toFixed(6));
  line('RAG ID', hit.id);
  line('SERIES ID', hit.seriesId);
  line('POST ID', hit.postId);
  line('ALIAS ID', hit.aliasId);
  line('TITLE', hit.title);
  line('COMMENT PATH', hit.commentPath);
  line('VERSE START', hit.verseStart);
  line('VERSE END', hit.verseEnd);
  line('FIRST SUBSECTION', hit.firstSubSection);
  line('LAST SUBSECTION', hit.lastSubSection);
  line('ROW START', hit.rowStart);
  line('ROW END', hit.rowEnd);
  line('COMMENT COUNT', hit.commentCount);
  line('ORIGINAL SOURCE FILE', exactRows[0]?.sourcePath || '');
  console.log('EXACT ORIGINAL COMMENT ROWS FROM LIVE COMMENTS DB');
  console.log('--------------------------------------------------------------------------------');
  for (const item of exactRows) {
    console.log(`ORIGINAL OFFSET ${item.offset + 1}/${exactRows.length}`);
    line('COMMENT ID', item.id);
    if (!item.row) {
      line('ERROR', 'commentId not found in original alias object');
      continue;
    }
    line('ORIGINAL VERSE SECTION', item.row.verseSection ?? item.row.dayuh?.verseSection ?? '');
    line('ORIGINAL SUBSECTION', item.row.dayuh?.subSection ?? '');
    line('ORIGINAL KIND', item.row.dayuh?.kind ?? '');
    line('EXACT ORIGINAL CONTENT', item.row.content ?? '');
    console.log('--------------------------------------------------------------------------------');
  }
  console.log('################################################################################');
}

const ragDb = new AwtsmoosDB(RAG_DB, { debug: false, wal: false, readOnly: true, processLockMode: 'shared', lockMode: 'shared' });
const commentsDb = new AwtsmoosDB(COMMENTS_DB, { debug: false, wal: false, readOnly: true, processLockMode: 'shared', lockMode: 'shared' });
await ragDb.open();
await commentsDb.open();
try {
  const rows = rowsOf(ragDb.root[LIST]);
  console.log('B"H');
  line('RAG DB', RAG_DB);
  line('ORIGINAL COMMENTS DB', COMMENTS_DB);
  line('RAG ROWS', rows.length);
  line('VECTOR PROOF', JSON.stringify(vectorProof(ragDb)));
  for (const query of QUERIES) {
    const q = await embedTextAuto(query, { modelRoot: RAG, noFallback: true, fresh: true });
    const hits = rows.filter(row => row?.vec).map(row => ({ ...row, score: dot(q.vector, row.vec) })).sort((a, b) => b.score - a.score).slice(0, TOP_K);
    hits.forEach((hit, index) => renderHit(query, hit, index + 1, originalRowsForHit(commentsDb, hit)));
  }
} finally {
  try { await ragDb.close?.(); } catch {}
  try { await commentsDb.close?.(); } catch {}
}
