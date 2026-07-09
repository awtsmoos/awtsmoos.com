#!/usr/bin/env node
// B"H
/**
 * @file pack_meluket_english_vectors.mjs
 * @description Packs completed Meluket English comment vectors into a separate
 * AwtsmoosDB shard and writes f32/meta sidecars for fast semantic search.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const JOB = path.join(RAG, 'meluket-english-comments-embedding-job');
const VECTORS = path.join(JOB, 'vectors.jsonl');
const SHARD = path.join(RAG, 'meluket-english-comments-rag.awtsdb');
const META = path.join(RAG, 'meluket-english-comments-rag.meta.jsonl');
const F32 = path.join(RAG, 'meluket-english-comments-rag.f32');
const MANIFEST = path.join(RAG, 'meluket-english-comments-rag.fast-manifest.json');
const SUMMARY = path.join(JOB, 'pack-awtsdb-summary.json');
const LIVE_WAL = path.join(ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb.wal');
const LIST = 'meluketEnglishCommentVectors';
const DIMS = 384;

function wal() { return fs.existsSync(LIVE_WAL) ? fs.statSync(LIVE_WAL).size : null; }
function hasHebrew(text) { return /[\u0590-\u05ff]/.test(String(text || '')); }
function packed(row) { return { id: row.id, seriesId: row.seriesId, postId: row.postId, aliasId: row.aliasId, commentPath: row.commentPath, title: row.title, verseStart: row.verseStart, verseEnd: row.verseEnd, firstSubSection: row.firstSubSection, lastSubSection: row.lastSubSection, commentIds: row.commentIds, firstCommentId: row.firstCommentId, lastCommentId: row.lastCommentId, commentCount: row.commentCount, rowStart: row.rowStart, rowEnd: row.rowEnd, text: row.text, previewEnglish: row.previewEnglish, realEmbedding: true, dimensions: DIMS, vec: row.vec }; }
function check(row, index) { if (!row.id || row.realEmbedding !== true) throw new Error(`bad vector ${index}`); if (row.dimensions !== DIMS) throw new Error(`bad dimensions ${index}`); if (!Array.isArray(row.vec) || row.vec.length !== DIMS) throw new Error(`bad vec ${index}`); if (hasHebrew(row.text)) throw new Error(`Hebrew/Yiddish text ${row.id}`); }
function readRecords() { return fs.readFileSync(VECTORS, 'utf8').split(/\n/).filter(Boolean).map((line, index) => { const row = JSON.parse(line); check(row, index); return row; }); }
function removeShard() { for (const ext of ['', '.wal', '.lock']) fs.rmSync(SHARD + ext, { force: true, recursive: true }); }
async function writeSidecars(records) {
  const metaOut = fs.createWriteStream(META);
  const fd = fs.openSync(F32, 'w');
  for (let row = 0; row < records.length; row += 1) {
    const record = records[row];
    const arr = new Float32Array(DIMS);
    for (let i = 0; i < DIMS; i += 1) arr[i] = record.vec[i];
    fs.writeSync(fd, Buffer.from(arr.buffer), 0, DIMS * 4, row * DIMS * 4);
    metaOut.write(JSON.stringify({ id: record.id, title: record.title, postId: record.postId, seriesId: record.seriesId, commentPath: record.commentPath, verseStart: record.verseStart, verseEnd: record.verseEnd, firstSubSection: record.firstSubSection, lastSubSection: record.lastSubSection, commentCount: record.commentCount, text: record.text }) + '\n');
  }
  fs.closeSync(fd);
  await new Promise(resolve => metaOut.end(resolve));
}
async function main() {
  const preWal = wal();
  const records = readRecords();
  removeShard();
  const db = new AwtsmoosDB(SHARD, { debug: false, wal: false, compression: false, turboWrites: false });
  await db.open();
  await db.createList(db.root, LIST);
  const chunkSize = Number(process.env.MELUKET_PACK_CHUNK || 250);
  for (let i = 0; i < records.length; i += chunkSize) {
    await db.root[LIST].splice(i, 0, ...records.slice(i, i + chunkSize).map(packed));
    await db.waitForIdle();
    console.log(`B"H loaded ${Math.min(i + chunkSize, records.length)}/${records.length}`);
  }
  await db.vector.enable(db.root[LIST], { dimensions: DIMS, metric: 'cosine' });
  await db.waitForIdle();
  const vectorMeta = db.root.__sys_vector__?.get?.(`root.${LIST}`) || null;
  const listLength = db.root[LIST]?.length;
  await db.close?.();
  await writeSidecars(records);
  const postWal = wal();
  if (preWal !== 0 || postWal !== 0) throw new Error(`live WAL changed ${preWal}->${postWal}`);
  const out = { BH: 'B"H', shard: SHARD, listName: LIST, records: records.length, listLength, dimensions: DIMS, vectorEnabled: Boolean(vectorMeta), vectorMeta, awtsdbBytes: fs.statSync(SHARD).size, matrix: F32, matrixBytes: fs.statSync(F32).size, metadata: META, liveWalBefore: preWal, liveWalAfter: postWal, packedAt: new Date().toISOString() };
  fs.writeFileSync(MANIFEST, JSON.stringify(out, null, 2));
  fs.writeFileSync(SUMMARY, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
