#!/usr/bin/env node
/**
 * B"H
 *
 * Live-only Likkutei Sichos semantic search.
 * The Float32 index ranks references only. Result text is materialized from the
 * official live packed comments DB after ranking. There is no baked text and no
 * archive fallback in this search path.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { performance } from 'perf_hooks';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacyBinary = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const INDEX_DIR = path.join(RAG, 'likkutei-v01-v39-fast-index');
const VECTORS = path.join(INDEX_DIR, 'vectors.f32');
const META = path.join(INDEX_DIR, 'meta.jsonl');
const COMMENTS_DB = path.join(DB_ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const DIMENSIONS = 384;
const TOP_K = 8;
const DEFAULT_QUERIES = [
  'Mashiach and redemption of the Jewish people',
  'teshuvah repentance changes the person and removes decree',
  'charity giving repeatedly even one hundred times',
  'the soul and body belong to Hashem not to a person'
];

function normalize(vector) {
  let sum = 0;
  for (const value of vector) sum += value * value;
  const magnitude = Math.sqrt(sum) || 1;
  return vector.map(value => value / magnitude);
}

function loadIndex() {
  const start = performance.now();
  const vectorBuffer = fs.readFileSync(VECTORS);
  const matrix = new Float32Array(vectorBuffer.buffer, vectorBuffer.byteOffset, vectorBuffer.byteLength / 4);
  const rawMeta = fs.readFileSync(META, 'utf8');
  const meta = rawMeta.trim().split(/\n/).map(line => JSON.parse(line));
  if (matrix.length !== meta.length * DIMENSIONS) throw new Error(`Index mismatch vectors=${matrix.length} meta=${meta.length}`);
  if (/"text"\s*:|"sample"\s*:|"sampleContent"\s*:|EN:/.test(rawMeta)) throw new Error('Index metadata contains baked text/snippets. Rebuild live-only reference index first.');
  return { matrix, meta, loadMs: Math.round(performance.now() - start) };
}

function openCommentsDb() {
  const db = new AwtsmoosDB(COMMENTS_DB, { debug: false, readOnly: true, processLockMode: 'shared', lockMode: 'shared' });
  db.open();
  return db;
}

function closeCommentsDb(db) {
  try { db.pager?.close?.(); db.processLock?.release?.(); } catch {}
}

function rows(obj) {
  return Object.keys(obj || {})
    .filter(key => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b))
    .flatMap(key => Array.isArray(obj[key]) ? obj[key] : []);
}

function readLiveBranch(db, commentPath) {
  const stat = db.fs.stat(commentPath);
  if (!stat?.exists) return null;
  const buffer = db.fs.cat(commentPath);
  if (!Buffer.isBuffer(buffer)) return null;
  try { return legacyBinary.deserializeBinary(buffer); }
  catch { return null; }
}

function inVerseRange(row, item) {
  const section = Number(row?.verseSection ?? row?.dayuh?.verseSection);
  return Number.isFinite(section) && section >= Number(item.verseStart) && section <= Number(item.verseEnd);
}

function englishSnippet(hitRows) {
  return hitRows
    .map(row => String(row?.content || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ')
    .slice(0, 500);
}

function topK(queryVector, matrix, meta, k) {
  const best = [];
  for (let row = 0; row < meta.length; row += 1) {
    let score = 0;
    const offset = row * DIMENSIONS;
    for (let dim = 0; dim < DIMENSIONS; dim += 1) score += queryVector[dim] * matrix[offset + dim];
    if (best.length < k || score > best[best.length - 1].score) {
      const hit = { score, item: meta[row] };
      let inserted = false;
      for (let i = 0; i < best.length; i += 1) {
        if (score > best[i].score) { best.splice(i, 0, hit); inserted = true; break; }
      }
      if (!inserted) best.push(hit);
      if (best.length > k) best.pop();
    }
  }
  return best;
}

function materializeHit(db, hit) {
  const item = hit.item;
  const branch = readLiveBranch(db, item.commentPath);
  const hitRows = rows(branch).filter(row => inVerseRange(row, item) && String(row?.content || '').trim());
  return {
    score: Number(hit.score.toFixed(6)),
    volume: item.volume,
    id: item.id,
    verses: [item.verseStart, item.verseEnd],
    commentPath: item.commentPath,
    snippetSource: hitRows.length ? 'live-db' : 'missing-live-db',
    commentsReturned: hitRows.length,
    text: englishSnippet(hitRows)
  };
}

async function searchOne(db, index, query) {
  const start = performance.now();
  const embedded = await embedTextAuto(query, { modelRoot: RAG, noFallback: true, fresh: true });
  const afterEmbed = performance.now();
  const queryVector = normalize(embedded.vector);
  const ranked = topK(queryVector, index.matrix, index.meta, TOP_K);
  const afterSearch = performance.now();
  const results = ranked.map(hit => materializeHit(db, hit));
  const afterMaterialize = performance.now();
  return {
    query,
    provider: embedded.provider,
    timingMs: {
      embed: Math.round(afterEmbed - start),
      search: Math.round(afterSearch - afterEmbed),
      materialize: Math.round(afterMaterialize - afterSearch),
      total: Math.round(afterMaterialize - start)
    },
    results
  };
}

async function main() {
  const queries = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_QUERIES;
  const index = loadIndex();
  const db = openCommentsDb();
  try {
    const searches = [];
    for (const query of queries) searches.push(await searchOne(db, index, query));
    console.log(JSON.stringify({
      BH: 'B"H',
      indexDir: INDEX_DIR,
      records: index.meta.length,
      dimensions: DIMENSIONS,
      loadMs: index.loadMs,
      metadataPolicy: 'reference-only; live-db-only materialization; no archive fallback',
      runner: runnerState({ modelRoot: RAG }),
      searchedAt: new Date().toISOString(),
      searches
    }, null, 2));
  } finally {
    closeCommentsDb(db);
  }
}

main().catch(error => { console.error(error.stack || error); process.exit(1); });
