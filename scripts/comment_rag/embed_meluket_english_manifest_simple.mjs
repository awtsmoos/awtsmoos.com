#!/usr/bin/env node
// B"H
/**
 * @file embed_meluket_english_manifest_simple.mjs
 * @description
 * Resumable Meluket English comment embedder. It mirrors the proven Sefer
 * HaSichos simple2 worker pattern: no live DB writes, no regeneration of source
 * comments, only manifest rows flowing through llama-embedding into vectors.
 */
import fs from 'fs';
import path from 'path';
import child from 'child_process';

const RAG = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag';
const JOB = path.join(RAG, 'meluket-english-comments-embedding-job');
const MANIFEST = process.env.MELUKET_EMBED_MANIFEST || path.join(JOB, 'manifest.jsonl');
const RESULTS = path.join(JOB, 'simple-results');
const FINAL = path.join(JOB, 'vectors.jsonl');
const FAIL = path.join(JOB, 'embedding-failures.jsonl');
const PROGRESS = path.join(JOB, 'embedding-progress.json');
const BIN = path.join(RAG, 'embedder-lab/llama.cpp/build/bin/llama-embedding');
const MODEL = path.join(RAG, 'models/bge-small-en-v1.5-q8_0.gguf');
const WORKERS = Number(process.env.MELUKET_EMBED_WORKERS || 2);
const THREADS = Number(process.env.MELUKET_EMBED_THREADS || 1);
const RETRIES = Number(process.env.MELUKET_EMBED_RETRIES || 5);
const RESET = process.argv.includes('--reset');
const WORKER_ID = Number(process.env.MELUKET_WORKER_ID ?? -1);
const LIMIT = Number(process.env.MELUKET_EMBED_LIMIT || 0);

function hasHebrew(text) { return /[\u0590-\u05ff]/.test(String(text || '')); }
function readManifest() {
  const rows = fs.readFileSync(MANIFEST, 'utf8').split(/\n/).filter(Boolean).map((line, index) => ({ index, ...JSON.parse(line) }));
  return LIMIT ? rows.slice(0, LIMIT) : rows;
}
function nums(raw) { return String(raw || '').match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)?.map(Number).filter(Number.isFinite) || []; }
function normalize(vec) { const mag = Math.sqrt(vec.reduce((sum, n) => sum + n * n, 0)) || 1; return vec.map(n => Number((n / mag).toFixed(7))); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function embedOnce(text) {
  const run = child.spawnSync(BIN, ['-m', MODEL, '-p', text, '--pooling', 'cls', '--embd-normalize', '2', '--embd-output-format', 'raw', '-t', String(THREADS)], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  if (run.status !== 0) throw new Error(run.stderr || `llama exit ${run.status}`);
  const vector = nums(run.stdout);
  if (vector.length !== 384) throw new Error(`expected 384 nums got ${vector.length}`);
  return normalize(vector);
}
async function embed(text) {
  if (!text || typeof text !== 'string') throw new Error('missing text');
  if (hasHebrew(text)) throw new Error('Hebrew/Yiddish Unicode in embedding text');
  let last;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try { return embedOnce(text); } catch (error) { last = error; await sleep(250 * attempt); }
  }
  throw last;
}
function lineCount(file) { return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean).length : 0; }
function progress(extra = {}) {
  let vectors = 0;
  if (fs.existsSync(RESULTS)) for (const file of fs.readdirSync(RESULTS).filter(name => /^worker-\d+\.jsonl$/.test(name))) vectors += lineCount(path.join(RESULTS, file));
  fs.writeFileSync(PROGRESS, JSON.stringify({ BH: 'B"H', phase: 'meluket-embedding', manifest: MANIFEST, workers: WORKERS, vectors, failures: lineCount(FAIL), retries: RETRIES, ...extra, updatedAt: new Date().toISOString() }, null, 2));
}
function record(item, vec) {
  return { id: item.id, seriesId: item.seriesId, postId: item.postId, aliasId: item.aliasId, commentPath: item.commentPath, title: item.title, verseStart: item.verseStart, verseEnd: item.verseEnd, firstSubSection: item.firstSubSection, lastSubSection: item.lastSubSection, commentIds: item.commentIds, firstCommentId: item.firstCommentId, lastCommentId: item.lastCommentId, commentCount: item.commentCount, rowStart: item.rowStart, rowEnd: item.rowEnd, textPolicy: item.textPolicy, text: item.text, embeddingTextPolicy: 'Hebrew Unicode stripped only for embedding input when present', previewEnglish: item.previewEnglish, embeddingManifest: MANIFEST, provider: 'llama-embedding:bge-small-en-v1.5-q8_0:meluket-simple', realEmbedding: true, dimensions: vec.length, vec };
}
async function worker() {
  fs.mkdirSync(RESULTS, { recursive: true });
  const all = readManifest().filter(row => row.index % WORKERS === WORKER_ID);
  const out = path.join(RESULTS, `worker-${WORKER_ID}.jsonl`);
  const done = new Set();
  if (fs.existsSync(out)) for (const line of fs.readFileSync(out, 'utf8').split(/\n/).filter(Boolean)) { try { done.add(JSON.parse(line).id); } catch {} }
  let completed = done.size;
  for (const item of all) {
    if (done.has(item.id)) continue;
    try {
      const vec = await embed(item.embeddingText || item.text);
      fs.appendFileSync(out, JSON.stringify(record(item, vec)) + '\n');
      done.add(item.id);
      completed += 1;
      if (completed % 10 === 0) progress({ workerId: WORKER_ID, workerDone: completed, workerTotal: all.length, currentId: item.id });
    } catch (error) {
      fs.appendFileSync(FAIL, JSON.stringify({ workerId: WORKER_ID, index: item.index, id: item.id, error: error.stack || String(error), at: new Date().toISOString() }) + '\n');
      progress({ workerId: WORKER_ID, failedId: item.id });
      throw error;
    }
  }
  progress({ workerId: WORKER_ID, workerDone: completed, workerTotal: all.length, workerComplete: true });
}
function merge() {
  const manifest = readManifest();
  const byId = new Map();
  if (fs.existsSync(RESULTS)) {
    for (const file of fs.readdirSync(RESULTS).filter(name => /^worker-\d+\.jsonl$/.test(name)).sort()) {
      for (const line of fs.readFileSync(path.join(RESULTS, file), 'utf8').split(/\n/).filter(Boolean)) {
        const row = JSON.parse(line);
        byId.set(row.id, row);
      }
    }
  }
  const rows = manifest.filter(item => byId.has(item.id)).map(item => byId.get(item.id));
  fs.writeFileSync(FINAL, rows.map(JSON.stringify).join('\n') + (rows.length ? '\n' : ''));
  return rows.length;
}
async function parent() {
  if (RESET) {
    if (fs.existsSync(RESULTS)) fs.rmSync(RESULTS, { recursive: true, force: true });
    for (const file of [FINAL, FAIL, PROGRESS]) fs.rmSync(file, { force: true });
  }
  fs.mkdirSync(RESULTS, { recursive: true });
  const manifest = readManifest();
  const hebrew = manifest.filter(row => hasHebrew(row.embeddingText || row.text)).length;
  if (hebrew) throw new Error(`refusing ${hebrew} Hebrew embedding text records`);
  progress({ total: manifest.length, phase: 'meluket-start' });
  const children = [];
  for (let i = 0; i < WORKERS; i += 1) children.push(child.spawn(process.execPath, [new URL(import.meta.url).pathname], { cwd: process.cwd(), stdio: ['ignore', 'inherit', 'inherit'], env: { ...process.env, MELUKET_WORKER_ID: String(i), MELUKET_EMBED_WORKERS: String(WORKERS), MELUKET_EMBED_MANIFEST: MANIFEST, MELUKET_EMBED_RETRIES: String(RETRIES) } }));
  await new Promise((resolve, reject) => { let left = children.length; for (const kid of children) kid.on('exit', code => { if (code) reject(new Error(`worker ${kid.pid} exited ${code}`)); else if (--left === 0) resolve(); }); });
  const vectors = merge();
  progress({ phase: 'meluket-completed', total: manifest.length, vectors });
  console.log(JSON.stringify({ BH: 'B"H', manifest: MANIFEST, total: manifest.length, vectors, failures: lineCount(FAIL), final: FINAL }, null, 2));
}
if (WORKER_ID >= 0) worker().catch(error => { console.error(error.stack || error); process.exit(1); });
else parent().catch(error => { console.error(error.stack || error); process.exit(1); });
