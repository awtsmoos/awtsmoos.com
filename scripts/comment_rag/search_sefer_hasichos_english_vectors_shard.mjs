#!/usr/bin/env node
// B"H
/**
 * @file search_sefer_hasichos_english_vectors_shard.mjs
 * @description Fast f32 semantic search over Sefer HaSichos English comment
 * vectors, followed by source resolution through the live Awtsmoos comments DB.
 * The vector row's text is the exact embedded subchunk; the reference metadata
 * says where that subchunk came from. This script therefore prints the hit,
 * its reference garment, and the smallest live comment row(s) found under
 * commentPath/commentIds that contain the embedded subchunk.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { performance } from 'perf_hooks';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const MANIFEST = path.join(RAG, 'sefer-hasichos-english-comments-rag.fast-manifest.json');
const FALLBACK_F32 = path.join(RAG, 'sefer-hasichos-english-comments-rag.f32');
const FALLBACK_META = path.join(RAG, 'sefer-hasichos-english-comments-rag.meta.jsonl');
const LIVE_COMMENTS_DB = path.join(ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const LIVE_WAL = `${LIVE_COMMENTS_DB}.wal`;
const DIM = 384;
const TOP_K = Number(process.env.TOP_K || 5);
const RESOLVE_LIVE = process.env.RESOLVE_LIVE !== '0';
const DEFAULT_QUERIES = [
  'dreams and sleep',
  'music and singing',
  'jealousy between brothers',
  'friendship',
  'travel',
  'food and eating bread',
  'fear',
  'business honesty',
  'children asking questions',
  'rain',
  'fire',
  'joy',
  'sadness',
  'leadership',
  'kindness',
  'loneliness'
];

function wal() {
  return fs.existsSync(LIVE_WAL) ? fs.statSync(LIVE_WAL).size : null;
}

function readManifest() {
  if (!fs.existsSync(MANIFEST)) return { matrix: FALLBACK_F32, metadata: FALLBACK_META };
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  return { ...manifest, matrix: manifest.matrix || FALLBACK_F32, metadata: manifest.metadata || FALLBACK_META };
}

function normalizeVector(vector) {
  let sum = 0;
  for (const value of vector) sum += value * value;
  const magnitude = Math.sqrt(sum) || 1;
  return vector.map(value => value / magnitude);
}

function normText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function comparable(text) {
  return normText(text).toLowerCase();
}

function cosineAt(matrix, offset, q) {
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let j = 0; j < DIM; j += 1) {
    const x = matrix.readFloatLE(offset + j * 4);
    const y = q[j];
    dot += x * y;
    aa += x * x;
    bb += y * y;
  }
  return dot / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1));
}

function addBest(best, hit, k) {
  best.push(hit);
  best.sort((a, b) => b.score - a.score);
  if (best.length > k) best.pop();
}

function scan(matrix, q, rows, k) {
  const best = [];
  for (let i = 0; i < rows; i += 1) {
    const score = cosineAt(matrix, i * DIM * 4, q);
    if (best.length < k || score > best[best.length - 1].score) addBest(best, { score, index: i }, k);
  }
  return best;
}

function hydrate(best, metaLines) {
  return best.map(hit => {
    const row = JSON.parse(metaLines[hit.index]);
    return {
      ...row,
      score: Number(hit.score.toFixed(6)),
      index: hit.index,
      text: row.text == null ? '' : String(row.text)
    };
  });
}

function numericKeys(obj) {
  return Object.keys(obj || {}).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
}

function rowSection(row) {
  return row?.verseSection ?? row?.dayuh?.verseSection ?? '';
}

function rowSubSection(row) {
  return row?.subSection ?? row?.dayuh?.subSection ?? '';
}

function readRows(db, cache, commentPath) {
  if (cache.has(commentPath)) return cache.get(commentPath);
  const obj = legacy.deserializeBinary(db.fs.cat(commentPath));
  const rows = [];
  for (const key of numericKeys(obj)) {
    const arr = Array.isArray(obj[key]) ? obj[key] : [];
    for (const row of arr) rows.push({ ...row, __sectionKey: key });
  }
  cache.set(commentPath, rows);
  return rows;
}

function minimalWindow(candidates, target) {
  const wanted = comparable(target);
  if (!wanted) return [];
  for (let i = 0; i < candidates.length; i += 1) {
    const content = comparable(candidates[i]?.content);
    if (content.includes(wanted) || wanted.includes(content)) return [candidates[i]];
  }
  for (let start = 0; start < candidates.length; start += 1) {
    let joined = '';
    for (let end = start; end < candidates.length; end += 1) {
      joined = joined ? `${joined} ${comparable(candidates[end]?.content)}` : comparable(candidates[end]?.content);
      if (joined.includes(wanted) || wanted.includes(joined)) return candidates.slice(start, end + 1);
      if (joined.length > wanted.length + 1200) break;
    }
  }
  return [];
}

function resolveLiveHit(db, cache, hit) {
  if (!RESOLVE_LIVE || !hit.commentPath) return null;
  try {
    const allRows = readRows(db, cache, hit.commentPath);
    const ids = Array.isArray(hit.commentIds) ? new Set(hit.commentIds) : null;
    const candidates = ids ? allRows.filter(row => ids.has(row?.id)) : allRows;
    const selected = minimalWindow(candidates, hit.text);
    const rows = selected.length ? selected : [];
    return {
      status: rows.length ? 'resolved-live-comment-rows' : 'no-live-row-contained-embedded-text',
      rowCount: rows.length,
      rows
    };
  } catch (error) {
    return { status: 'live-resolution-error', error: error.message || String(error), rowCount: 0, rows: [] };
  }
}

async function searchOne(query, matrix, metaLines, rows, live) {
  const start = performance.now();
  const embedded = await embedTextAuto(query, { modelRoot: RAG, noFallback: true, fresh: true });
  const afterEmbed = performance.now();
  const q = normalizeVector(embedded.vector);
  const ranked = scan(matrix, q, rows, TOP_K);
  const afterScan = performance.now();
  const hits = hydrate(ranked, metaLines);
  const cache = live?.cache || new Map();
  for (const hit of hits) hit.live = live?.db ? resolveLiveHit(live.db, cache, hit) : null;
  return {
    query,
    provider: embedded.provider,
    timingMs: {
      embed: Math.round(afterEmbed - start),
      scan: Math.round(afterScan - afterEmbed),
      total: Math.round(afterScan - start)
    },
    results: hits
  };
}

function line(value = '') {
  return value == null ? '' : String(value);
}

function renderRows(rows) {
  if (!rows?.length) return '';
  return rows.map((row, index) => [
    `SOURCE ROW ${index + 1}`,
    `COMMENT ID ${line(row.id)}`,
    `VERSE SECTION ${line(rowSection(row))}`,
    `SUBSECTION ${line(rowSubSection(row))}`,
    'COMMENT TEXT',
    line(row.content)
  ].join('\n')).join('\n\n');
}

function renderSearch(search) {
  const parts = [];
  search.results.forEach((result, rankIndex) => {
    parts.push('==================================================');
    parts.push('QUERY');
    parts.push(search.query);
    parts.push('RANK');
    parts.push(String(rankIndex + 1));
    parts.push('SCORE');
    parts.push(result.score.toFixed(6));
    parts.push('ID');
    parts.push(line(result.id));
    parts.push('YEAR');
    parts.push(line(result.year));
    parts.push('TITLE');
    parts.push(line(result.title));
    parts.push('COMMENT PATH');
    parts.push(line(result.commentPath));
    parts.push('POST ID');
    parts.push(line(result.postId));
    parts.push('REFERENCE');
    parts.push(`verse ${line(result.verseStart)}-${line(result.verseEnd)}; subsection ${line(result.firstSubSection)}-${line(result.lastSubSection)}; comments ${line(result.commentStart)}-${line(result.commentEnd)}; q ${line(result.qIndex ?? result.subChunkIndex)}/${line(result.subChunkCount)}`);
    parts.push('FIRST COMMENT ID');
    parts.push(line(result.firstCommentId));
    parts.push('LAST COMMENT ID');
    parts.push(line(result.lastCommentId));
    parts.push('EMBEDDED HIT TEXT');
    parts.push(result.text);
    parts.push('LIVE SOURCE STATUS');
    parts.push(line(result.live?.status || 'not-resolved'));
    if (result.live?.rows?.length) {
      parts.push('LIVE SOURCE COMMENTS');
      parts.push(renderRows(result.live.rows));
    }
    parts.push('==================================================');
    parts.push('');
  });
  return parts.join('\n');
}

async function main() {
  const queries = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_QUERIES;
  const preWal = wal();
  const manifest = readManifest();
  const loadStart = performance.now();
  const matrix = fs.readFileSync(manifest.matrix);
  const metaText = fs.readFileSync(manifest.metadata, 'utf8').trim();
  const metaLines = metaText ? metaText.split(/\n/) : [];
  const rows = Math.floor(matrix.length / (DIM * 4));
  if (rows !== metaLines.length) throw new Error(`matrix/meta mismatch rows=${rows} meta=${metaLines.length}`);
  const loadMs = Math.round(performance.now() - loadStart);
  const live = RESOLVE_LIVE ? { db: new AwtsmoosDB(LIVE_COMMENTS_DB, { debug: false, readOnly: true, processLockMode: 'shared', lockMode: 'shared' }), cache: new Map() } : null;
  if (live) await live.db.open();
  const searches = [];
  try {
    for (const query of queries) searches.push(await searchOne(query, matrix, metaLines, rows, live));
  } finally {
    try { live?.db?.pager?.close?.(); live?.db?.processLock?.release?.(); } catch {}
  }
  const postWal = wal();
  const header = [
    'B"H',
    'MODE',
    'fast-f32-search-plus-live-comment-resolution',
    'ROWS',
    String(rows),
    'DIMENSIONS',
    String(DIM),
    'TOP K',
    String(TOP_K),
    'LOAD MS',
    String(loadMs),
    'RUNNER',
    JSON.stringify(runnerState({ modelRoot: RAG })),
    'LIVE WAL BEFORE',
    line(preWal),
    'LIVE WAL AFTER',
    line(postWal),
    'SEARCHED AT',
    new Date().toISOString(),
    ''
  ].join('\n');
  console.log(header + searches.map(renderSearch).join('\n'));
}

main().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
