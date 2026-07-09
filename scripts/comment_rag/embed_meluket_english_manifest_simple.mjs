#!/usr/bin/env node
// B"H
/**
 * @file embed_meluket_english_manifest_simple.mjs
 * @description
 * Resumable Meluket English comment embedder.
 *
 * The Awtsmoos of the code breathes through strict ownership:
 * each worker receives only rows where manifest index % workerCount equals
 * workerId. A global completed-ID scan is used so a previous run with a
 * different worker count cannot duplicate vectors when resuming with %2.
 */
import fs from 'fs';
import path from 'path';
import child from 'child_process';

const RAG = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag';
const JOB = path.join(RAG, 'meluket-english-comments-embedding-job');
const MANIFEST = process.env.MELUKET_EMBED_MANIFEST || path.join(JOB, 'manifest.jsonl');
const RESULTS = path.join(JOB, 'simple-results');
const FINAL = path.join(JOB, 'vectors.jsonl');
const TRANSIENT_FAILURES = path.join(JOB, 'embedding-transient-failures.jsonl');
const LEGACY_FAILURES = path.join(JOB, 'embedding-failures.jsonl');
const PROGRESS = path.join(JOB, 'embedding-progress.json');
const BIN = path.join(RAG, 'embedder-lab/llama.cpp/build/bin/llama-embedding');
const MODEL = path.join(RAG, 'models/bge-small-en-v1.5-q8_0.gguf');
const WORKERS = Number(process.env.MELUKET_EMBED_WORKERS || 2);
const THREADS = Number(process.env.MELUKET_EMBED_THREADS || 1);
const RETRIES = Number(process.env.MELUKET_EMBED_RETRIES || 5);
const RESET = process.argv.includes('--reset');
const STRICT = process.argv.includes('--strict');
const WORKER_ID = Number(process.env.MELUKET_WORKER_ID ?? -1);
const LIMIT = Number(process.env.MELUKET_EMBED_LIMIT || 0);
const DIMENSIONS = 384;

function hasHebrew(text) { return /[\u0590-\u05ff]/.test(String(text || '')); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function nums(raw) { return String(raw || '').match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)?.map(Number).filter(Number.isFinite) || []; }
function normalize(vec) { const mag = Math.sqrt(vec.reduce((sum, n) => sum + n * n, 0)) || 1; return vec.map(n => Number((n / mag).toFixed(7))); }
function lineCount(file) { return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean).length : 0; }
function resultFiles() { return fs.existsSync(RESULTS) ? fs.readdirSync(RESULTS).filter(name => name.endsWith('.jsonl')).sort().map(name => path.join(RESULTS, name)) : []; }
function readManifest() {
  const rows = fs.readFileSync(MANIFEST, 'utf8').split(/\n/).filter(Boolean).map((line, index) => ({ index, ...JSON.parse(line) }));
  return LIMIT ? rows.slice(0, LIMIT) : rows;
}
function readCompletedIds() {
  const ids = new Set();
  for (const file of resultFiles()) {
    for (const line of fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean)) {
      try { ids.add(JSON.parse(line).id); } catch {}
    }
  }
  return ids;
}
function outputFile(workerId = WORKER_ID) { return path.join(RESULTS, `worker-${WORKERS}of${workerId}.jsonl`); }
function progress(extra = {}) {
  const completedIds = readCompletedIds();
  const manifestTotal = fs.existsSync(MANIFEST) ? readManifest().length : undefined;
  const payload = {
    BH: 'B"H',
    phase: extra.phase || 'meluket-embedding-active',
    manifest: MANIFEST,
    workerCount: WORKERS,
    ownershipRule: `manifestIndex % ${WORKERS}`,
    completedVectors: completedIds.size,
    manifestTotal,
    percent: manifestTotal ? Number((completedIds.size * 100 / manifestTotal).toFixed(2)) : undefined,
    transientFailures: lineCount(TRANSIENT_FAILURES),
    legacyFailures: lineCount(LEGACY_FAILURES),
    retries: RETRIES,
    strict: STRICT,
    ...extra,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(PROGRESS, JSON.stringify(payload, null, 2));
}
function embedOnce(text) {
  const run = child.spawnSync(BIN, ['-m', MODEL, '-p', text, '--pooling', 'cls', '--embd-normalize', '2', '--embd-output-format', 'raw', '-t', String(THREADS)], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  if (run.status !== 0) throw new Error(run.stderr || `llama exit ${run.status}`);
  const vector = nums(run.stdout);
  if (vector.length !== DIMENSIONS) throw new Error(`expected ${DIMENSIONS} nums got ${vector.length}`);
  return normalize(vector);
}
async function embed(text) {
  if (!text || typeof text !== 'string') throw new Error('missing text');
  if (hasHebrew(text)) throw new Error('Hebrew/Yiddish Unicode in embedding text');
  let last;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try { return embedOnce(text); }
    catch (error) { last = error; await sleep(250 * attempt); }
  }
  throw last;
}
function record(item, vec) {
  return {
    id: item.id,
    seriesId: item.seriesId,
    postId: item.postId,
    aliasId: item.aliasId,
    commentPath: item.commentPath,
    title: item.title,
    verseStart: item.verseStart,
    verseEnd: item.verseEnd,
    firstSubSection: item.firstSubSection,
    lastSubSection: item.lastSubSection,
    commentIds: item.commentIds,
    firstCommentId: item.firstCommentId,
    lastCommentId: item.lastCommentId,
    commentCount: item.commentCount,
    rowStart: item.rowStart,
    rowEnd: item.rowEnd,
    textPolicy: item.textPolicy,
    text: item.text,
    embeddingTextPolicy: 'Hebrew Unicode stripped only for embedding input when present',
    previewEnglish: item.previewEnglish,
    embeddingManifest: MANIFEST,
    provider: 'llama-embedding:bge-small-en-v1.5-q8_0:meluket-simple',
    realEmbedding: true,
    dimensions: vec.length,
    vec
  };
}
function appendJsonl(file, object) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, JSON.stringify(object) + '\n'); }
async function worker() {
  fs.mkdirSync(RESULTS, { recursive: true });
  const all = readManifest().filter(row => row.index % WORKERS === WORKER_ID);
  const out = outputFile();
  let completedIds = readCompletedIds();
  let ownedCompleted = all.filter(item => completedIds.has(item.id)).length;
  progress({ workerId: WORKER_ID, workerState: 'started', ownedTotal: all.length, ownedCompleted, outputFile: out });
  for (const item of all) {
    completedIds = readCompletedIds();
    if (completedIds.has(item.id)) continue;
    try {
      const vec = await embed(item.embeddingText || item.text);
      appendJsonl(out, record(item, vec));
      ownedCompleted += 1;
      if (ownedCompleted % 10 === 0) progress({ workerId: WORKER_ID, workerState: 'running', ownedTotal: all.length, ownedCompleted, currentId: item.id });
    } catch (error) {
      appendJsonl(TRANSIENT_FAILURES, { workerId: WORKER_ID, workerCount: WORKERS, ownership: item.index % WORKERS, index: item.index, id: item.id, error: error.stack || String(error), at: new Date().toISOString() });
      progress({ workerId: WORKER_ID, workerState: 'item-failed-continuing', ownedTotal: all.length, ownedCompleted, failedId: item.id });
      if (STRICT) throw error;
    }
  }
  progress({ workerId: WORKER_ID, workerState: 'complete', ownedTotal: all.length, ownedCompleted });
}
function merge() {
  const manifest = readManifest();
  const byId = new Map();
  for (const file of resultFiles()) {
    for (const line of fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean)) {
      const row = JSON.parse(line);
      if (!byId.has(row.id)) byId.set(row.id, row);
    }
  }
  const rows = manifest.filter(item => byId.has(item.id)).map(item => byId.get(item.id));
  fs.writeFileSync(FINAL, rows.map(JSON.stringify).join('\n') + (rows.length ? '\n' : ''));
  return { rows: rows.length, total: manifest.length, missing: manifest.filter(item => !byId.has(item.id)).map(item => item.id) };
}
async function parent() {
  if (RESET) {
    if (fs.existsSync(RESULTS)) fs.rmSync(RESULTS, { recursive: true, force: true });
    for (const file of [FINAL, TRANSIENT_FAILURES, LEGACY_FAILURES, PROGRESS]) fs.rmSync(file, { force: true });
  }
  fs.mkdirSync(RESULTS, { recursive: true });
  const manifest = readManifest();
  const badEmbeddingText = manifest.filter(row => hasHebrew(row.embeddingText || row.text)).length;
  if (badEmbeddingText) throw new Error(`refusing ${badEmbeddingText} Hebrew embedding text records`);
  progress({ phase: 'meluket-embedding-starting', total: manifest.length });
  const children = [];
  for (let i = 0; i < WORKERS; i += 1) {
    children.push(child.spawn(process.execPath, [new URL(import.meta.url).pathname], {
      cwd: process.cwd(),
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env, MELUKET_WORKER_ID: String(i), MELUKET_EMBED_WORKERS: String(WORKERS), MELUKET_EMBED_MANIFEST: MANIFEST, MELUKET_EMBED_RETRIES: String(RETRIES) }
    }));
  }
  await new Promise((resolve, reject) => {
    let left = children.length;
    for (const kid of children) {
      kid.on('exit', code => {
        if (code && STRICT) reject(new Error(`worker ${kid.pid} exited ${code}`));
        else if (--left === 0) resolve();
      });
    }
  });
  const merged = merge();
  progress({ phase: merged.rows === merged.total ? 'meluket-embedding-complete' : 'meluket-embedding-incomplete', vectors: merged.rows, total: merged.total, missingCount: merged.missing.length, missingSample: merged.missing.slice(0, 20) });
  console.log(JSON.stringify({ BH: 'B"H', manifest: MANIFEST, ownershipRule: `manifestIndex % ${WORKERS}`, total: merged.total, vectors: merged.rows, missing: merged.missing.length, transientFailures: lineCount(TRANSIENT_FAILURES), legacyFailures: lineCount(LEGACY_FAILURES), final: FINAL }, null, 2));
  if (merged.missing.length) process.exitCode = 4;
}
if (WORKER_ID >= 0) worker().catch(error => { console.error(error.stack || error); process.exit(1); });
else parent().catch(error => { console.error(error.stack || error); process.exit(1); });
