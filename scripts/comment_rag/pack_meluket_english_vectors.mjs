#!/usr/bin/env node
// B"H
/**
 * Pack Meluket English comment vectors into the real AwtsmoosDB shard.
 *
 * The Awtsmoos does not hide the lineage of a teaching behind a snippet. Every
 * record carries the exact series, post, alias, verse range, subsection range,
 * row range, full comment-id chain, full stored text, and vector. The vector
 * index is enabled before records are inserted so the first AwtsmoosDB type is
 * the production search vessel; JSONL sidecars are storage/proof only.
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

const wal = () => fs.existsSync(LIVE_WAL) ? fs.statSync(LIVE_WAL).size : null;

function check(row, index) {
  if (!row.id || row.realEmbedding !== true) throw new Error(`bad vector ${index}`);
  if (row.dimensions !== DIMS) throw new Error(`bad dimensions ${index}`);
  if (!Array.isArray(row.vec) || row.vec.length !== DIMS) throw new Error(`bad vec ${index}`);
  for (const key of ['seriesId', 'postId', 'aliasId', 'commentPath', 'verseStart', 'verseEnd']) {
    if (row[key] == null) throw new Error(`missing ${key} on ${row.id}`);
  }
}
function readRecords() {
  return fs.readFileSync(VECTORS, 'utf8').split(/\n/).filter(Boolean).map((line, index) => {
    const row = JSON.parse(line);
    check(row, index);
    return row;
  });
}
function packed(row) {
  return {
    id: row.id,
    seriesId: row.seriesId,
    postId: row.postId,
    aliasId: row.aliasId,
    commentPath: row.commentPath,
    title: row.title,
    verseStart: row.verseStart,
    verseEnd: row.verseEnd,
    firstSubSection: row.firstSubSection,
    lastSubSection: row.lastSubSection,
    commentIds: row.commentIds,
    firstCommentId: row.firstCommentId,
    lastCommentId: row.lastCommentId,
    commentCount: row.commentCount,
    rowStart: row.rowStart,
    rowEnd: row.rowEnd,
    textPolicy: row.textPolicy,
    text: row.text,
    previewEnglish: row.previewEnglish,
    embeddingTextPolicy: row.embeddingTextPolicy,
    embeddingManifest: row.embeddingManifest,
    provider: row.provider,
    realEmbedding: true,
    dimensions: DIMS,
    embeddingCharsUsed: row.embeddingCharsUsed,
    shortenedForModelLimit: row.shortenedForModelLimit,
    vec: row.vec
  };
}
function removeShard() {
  for (const ext of ['', '.wal', '.lock']) fs.rmSync(SHARD + ext, { force: true, recursive: true });
}
async function writeSidecars(records) {
  const metaOut = fs.createWriteStream(META);
  const fd = fs.openSync(F32, 'w');
  for (let row = 0; row < records.length; row += 1) {
    const record = records[row];
    const arr = new Float32Array(DIMS);
    for (let i = 0; i < DIMS; i += 1) arr[i] = record.vec[i];
    fs.writeSync(fd, Buffer.from(arr.buffer), 0, DIMS * 4, row * DIMS * 4);
    metaOut.write(JSON.stringify(packed(record)) + '\n');
  }
  fs.closeSync(fd);
  await new Promise(resolve => metaOut.end(resolve));
}
function vectorMeta(db) {
  const sys = db.root.__sys_vector__;
  if (!sys) return null;
  return sys[LIST] || sys[`root.${LIST}`] || sys.get?.(LIST) || sys.get?.(`root.${LIST}`) || null;
}
async function main() {
  const preWal = wal();
  const records = readRecords();
  removeShard();
  const db = new AwtsmoosDB(SHARD, { debug: false, wal: false, compression: false, turboWrites: false });
  await db.open();
  await db.createList(db.root, LIST);
  await db.vector.enable(db.root[LIST], { dimensions: DIMS, metric: 'cosine' });
  await db.waitForIdle();
  const chunkSize = Number(process.env.MELUKET_PACK_CHUNK || 250);
  for (let i = 0; i < records.length; i += chunkSize) {
    await db.root[LIST].splice(i, 0, ...records.slice(i, i + chunkSize).map(packed));
    await db.waitForIdle();
    console.log(`B"H loaded ${Math.min(i + chunkSize, records.length)}/${records.length}`);
  }
  await db.waitForIdle();
  const meta = vectorMeta(db);
  const reg = meta ? db.root.__sys_vector__?.[meta.regPath] : null;
  const map = meta ? db.root.__sys_vector__?.[meta.mapPath] : null;
  const listLength = db.root[LIST]?.length;
  const vectorSummary = { meta, regLength: reg?.length ?? null, mapKeys: map ? Object.keys(map).length : null };
  await db.close?.();
  await writeSidecars(records);
  const postWal = wal();
  if (preWal !== 0 || postWal !== 0) throw new Error(`live WAL changed ${preWal}->${postWal}`);
  const out = { BH: 'B"H', shard: SHARD, listName: LIST, records: records.length, listLength, dimensions: DIMS, vectorEnabled: Boolean(meta), vectorSummary, awtsdbBytes: fs.statSync(SHARD).size, matrix: F32, matrixBytes: fs.statSync(F32).size, metadata: META, metadataRows: records.length, sidecarsAreStorageOnly: true, liveWalBefore: preWal, liveWalAfter: postWal, packedAt: new Date().toISOString() };
  fs.writeFileSync(MANIFEST, JSON.stringify(out, null, 2));
  fs.writeFileSync(SUMMARY, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
