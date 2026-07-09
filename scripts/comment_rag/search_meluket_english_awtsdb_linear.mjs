#!/usr/bin/env node
// B"H
/**
 * Fast direct semantic search over the real Meluket AwtsmoosDB shard.
 *
 * This still reads records from meluket-english-comments-rag.awtsdb only. The
 * speed tikkun is to resolve the AwtsmoosDB list once into a plain array before
 * scoring, instead of waking the live proxy thousands of times per query. The
 * output proves the native vector registry and prints full lineage plus full
 * stored text.
 */
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { embedTextAuto } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const SHARD = path.join(RAG, 'meluket-english-comments-rag.awtsdb');
const LIST = 'meluketEnglishCommentVectors';
const TOP_K = Number(process.env.TOP_K || 3);
const QUERIES = process.argv.slice(2).length ? process.argv.slice(2) : ['worry and anxiety', 'fear of the future'];

function dot(a, b) {
  let d = 0;
  let aa = 0;
  let bb = 0;
  const n = Math.min(a.length || 0, b.length || 0);
  for (let i = 0; i < n; i += 1) {
    const x = Number(a[i]) || 0;
    const y = Number(b[i]) || 0;
    d += x * y;
    aa += x * x;
    bb += y * y;
  }
  return d / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1));
}
function vectorProof(db) {
  const sys = db.root.__sys_vector__;
  const meta = sys?.[LIST] || sys?.get?.(LIST);
  return { vectorEnabled: Boolean(meta), vectorMeta: meta || null, regLength: meta ? sys?.[meta.regPath]?.length : null };
}
function resolvedRows(list) {
  const plain = list?.__resolve__?.();
  if (Array.isArray(plain)) return plain;
  return Array.from({ length: Number(list.length || 0) }, (_, index) => list[index]);
}
function line(label, value = '') {
  console.log(label + '\n');
  console.log(String(value ?? '') + '\n');
}
function render(query, hit, rank) {
  const r = hit.record;
  console.log('==================================================');
  line('QUERY', query);
  line('RANK', rank);
  line('SCORE', hit.score.toFixed(6));
  line('ID', r.id);
  line('SERIES ID', r.seriesId);
  line('POST ID', r.postId);
  line('ALIAS ID', r.aliasId);
  line('TITLE', r.title);
  line('COMMENT PATH', r.commentPath);
  line('VERSE START', r.verseStart);
  line('VERSE END', r.verseEnd);
  line('FIRST SUBSECTION', r.firstSubSection);
  line('LAST SUBSECTION', r.lastSubSection);
  line('ROW START', r.rowStart);
  line('ROW END', r.rowEnd);
  line('FIRST COMMENT ID', r.firstCommentId);
  line('LAST COMMENT ID', r.lastCommentId);
  line('COMMENT COUNT', r.commentCount);
  line('COMMENT IDS', JSON.stringify(r.commentIds || []));
  line('FULL COMMENT', r.text || '');
  console.log('==================================================');
}

const db = new AwtsmoosDB(SHARD, { debug: false, wal: false });
await db.open();
const list = db.root[LIST];
const rows = resolvedRows(list);
console.log('B"H');
line('MODE', 'real-awtsdb-linear-vector-search-fast-resolved');
line('SHARD', SHARD);
line('ROWS', rows.length);
line('VECTOR PROOF', JSON.stringify(vectorProof(db)));
for (const query of QUERIES) {
  const q = await embedTextAuto(query, { modelRoot: RAG, noFallback: true, fresh: true });
  const best = [];
  for (const record of rows) {
    if (!record?.vec) continue;
    best.push({ score: dot(q.vector, record.vec), record });
  }
  best.sort((a, b) => b.score - a.score).slice(0, TOP_K).forEach((hit, index) => render(query, hit, index + 1));
}
await db.close?.();
