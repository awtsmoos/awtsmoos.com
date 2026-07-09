#!/usr/bin/env node
// B"H
/**
 * @file embed_sefer_hasichos_english_manifest_parallel.mjs
 * @chapter Batched Rivers Of English Light, No Door To The Live DB
 *
 * Reads only an English-only manifest JSONL file. Sends only each record.text
 * to llama.cpp. Hebrew preview/source metadata is ignored. Never opens or
 * writes the live AwtsmoosDB comments store.
 */
import fs from 'fs';
import path from 'path';
import child from 'child_process';

const RAG = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag';
const OUT_DIR = path.join(RAG, 'sefer-hasichos-english-comments-embedding-job');
const DEFAULT_MANIFEST = path.join(OUT_DIR, 'manifest.embedding-english-only.safe1200.jsonl');
const FALLBACK_MANIFEST = path.join(OUT_DIR, 'manifest.embedding-english-only.jsonl');
const MANIFEST = process.env.SHICHOSE_EMBED_MANIFEST || (fs.existsSync(DEFAULT_MANIFEST) ? DEFAULT_MANIFEST : FALLBACK_MANIFEST);
const RESULTS = path.join(OUT_DIR, 'parallel-results');
const FINAL = path.join(OUT_DIR, 'vectors.jsonl');
const FAILURES = path.join(OUT_DIR, 'embedding-failures.jsonl');
const PROGRESS = path.join(OUT_DIR, 'embedding-progress.json');
const MODEL = path.join(RAG, 'models/bge-small-en-v1.5-q8_0.gguf');
const BIN = path.join(RAG, 'embedder-lab/llama.cpp/build/bin/llama-embedding');
const WORKERS = Number(process.env.SHICHOSE_EMBED_WORKERS || 4);
const THREADS = Number(process.env.SHICHOSE_EMBED_THREADS || 1);
const BATCH_SIZE = Number(process.env.SHICHOSE_EMBED_BATCH || 8);
const LIMIT = Number(process.env.SHICHOSE_EMBED_LIMIT || 0);
const RESET = process.argv.includes('--reset');
const WORKER_ID = Number(process.env.SHICHOSE_WORKER_ID ?? -1);
const WORKER_COUNT = Number(process.env.SHICHOSE_WORKER_COUNT || WORKERS);
const SEP = '<#awtsmoos-english-embedding-separator#>';

function readManifest() {
  const rows = fs.readFileSync(MANIFEST, 'utf8').split(/\n/).filter(Boolean).map((line, index) => ({ index, ...JSON.parse(line) }));
  return LIMIT ? rows.slice(0, LIMIT) : rows;
}
function hasHebrew(text) { return /[\u0590-\u05ff]/.test(String(text || '')); }
function lineCount(file) { return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean).length : 0; }
function normalizeVector(vec) {
  const mag = Math.sqrt(vec.reduce((sum, n) => sum + n * n, 0)) || 1;
  return vec.map(n => Number((n / mag).toFixed(7)));
}
function parseRawBatch(raw, expected, dim = 384) {
  const nums = String(raw || '').match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)?.map(Number).filter(Number.isFinite) || [];
  if (nums.length !== expected * dim) throw new Error(`expected ${expected * dim} numbers for ${expected} embeddings, got ${nums.length}; stdout=${String(raw || '').slice(0, 240)}`);
  const vectors = [];
  for (let row = 0; row < expected; row += 1) vectors.push(normalizeVector(nums.slice(row * dim, (row + 1) * dim)));
  return vectors;
}
function safeText(item) {
  const text = String(item.text || '').replaceAll(SEP, ' ').replace(/\s+/g, ' ').trim();
  if (!text) throw new Error(`missing English text for ${item.id}`);
  if (hasHebrew(text)) throw new Error(`refusing Hebrew/Yiddish Unicode for ${item.id}`);
  return text;
}
function embedEnglishBatch(items) {
  const texts = items.map(safeText);
  const prompt = texts.join(SEP);
  const result = child.spawnSync(BIN, ['-m', MODEL, '-p', prompt, '--pooling', 'cls', '--embd-normalize', '2', '--embd-output-format', 'raw', '--embd-separator', SEP, '-t', String(THREADS)], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr || `llama exited ${result.status}`);
  return parseRawBatch(result.stdout, items.length, 384);
}
function vectorRecord(item, vec) {
  return {
    id: item.id,
    seriesId: item.seriesId,
    postId: item.postId,
    aliasId: item.aliasId,
    commentPath: item.commentPath,
    year: item.year,
    title: item.title,
    verseStart: item.verseStart,
    verseEnd: item.verseEnd,
    firstSubSection: item.firstSubSection,
    lastSubSection: item.lastSubSection,
    commentIds: item.commentIds,
    firstCommentId: item.firstCommentId,
    lastCommentId: item.lastCommentId,
    commentCount: item.commentCount,
    parentChunkId: item.parentChunkId,
    subChunkIndex: item.subChunkIndex,
    subChunkCount: item.subChunkCount,
    textPolicy: item.textPolicy || 'english-comments-only-from-manifest-item-text',
    text: safeText(item),
    previewEnglish: safeText(item).slice(0, 240),
    embeddingManifest: MANIFEST,
    provider: 'llama-embedding:bge-small-en-v1.5-q8_0:batched',
    realEmbedding: true,
    dimensions: vec.length,
    vec
  };
}
function progress(extra = {}) {
  const workerFiles = fs.existsSync(RESULTS) ? fs.readdirSync(RESULTS).filter(n => /^worker-\d+\.jsonl$/.test(n)) : [];
  const vectors = workerFiles.reduce((n, file) => n + lineCount(path.join(RESULTS, file)), 0);
  const failures = lineCount(FAILURES);
  fs.writeFileSync(PROGRESS, JSON.stringify({ BH: 'B"H', phase: 'parallel-batched-embedding', workers: WORKERS, batchSize: BATCH_SIZE, manifest: MANIFEST, vectors, failures, ...extra, updatedAt: new Date().toISOString() }, null, 2));
}
async function runWorker() {
  fs.mkdirSync(RESULTS, { recursive: true });
  const manifest = readManifest().filter(item => item.index % WORKER_COUNT === WORKER_ID);
  const outFile = path.join(RESULTS, `worker-${WORKER_ID}.jsonl`);
  const out = fs.createWriteStream(outFile, { flags: 'a' });
  const doneIds = new Set();
  if (fs.existsSync(outFile)) for (const line of fs.readFileSync(outFile, 'utf8').split(/\n/).filter(Boolean)) { try { doneIds.add(JSON.parse(line).id); } catch {} }
  let done = doneIds.size;
  try {
    for (let start = 0; start < manifest.length; start += BATCH_SIZE) {
      const batch = manifest.slice(start, start + BATCH_SIZE).filter(item => !doneIds.has(item.id));
      if (!batch.length) continue;
      try {
        const vectors = embedEnglishBatch(batch);
        for (let i = 0; i < batch.length; i += 1) {
          out.write(JSON.stringify(vectorRecord(batch[i], vectors[i])) + '\n');
          doneIds.add(batch[i].id);
          done += 1;
        }
        progress({ workerId: WORKER_ID, workerDone: done, workerTotal: manifest.length, currentId: batch.at(-1).id });
      } catch (error) {
        fs.appendFileSync(FAILURES, JSON.stringify({ workerId: WORKER_ID, start, batchIds: batch.map(x => x.id), textLengths: batch.map(x => String(x.text || '').length), error: error.stack || String(error), at: new Date().toISOString() }) + '\n');
        progress({ workerId: WORKER_ID, workerDone: done, workerTotal: manifest.length, failedBatchStart: start });
        throw error;
      }
    }
    progress({ workerId: WORKER_ID, workerDone: done, workerTotal: manifest.length, workerComplete: true });
  } finally { await new Promise(resolve => out.end(resolve)); }
}
function mergeResults(expected) {
  const byId = new Map();
  for (const file of fs.readdirSync(RESULTS).filter(n => /^worker-\d+\.jsonl$/.test(n)).sort()) {
    for (const line of fs.readFileSync(path.join(RESULTS, file), 'utf8').split(/\n/).filter(Boolean)) {
      const rec = JSON.parse(line);
      byId.set(rec.id, rec);
    }
  }
  const manifest = readManifest();
  const rows = manifest.filter(item => byId.has(item.id)).map(item => byId.get(item.id));
  fs.writeFileSync(FINAL, rows.map(row => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''));
  return { expected, rows: rows.length };
}
async function runParent() {
  if (RESET) {
    if (fs.existsSync(RESULTS)) fs.rmSync(RESULTS, { recursive: true, force: true });
    for (const file of [FINAL, FAILURES, PROGRESS]) if (fs.existsSync(file)) fs.rmSync(file);
  }
  fs.mkdirSync(RESULTS, { recursive: true });
  const manifest = readManifest();
  const hebrewRecords = manifest.filter(item => hasHebrew(item.text)).length;
  if (hebrewRecords) throw new Error(`Refusing to embed: manifest text has ${hebrewRecords} Hebrew/Yiddish Unicode records`);
  progress({ phase: 'parallel-batched-starting', total: manifest.length, hebrewRecords });
  const children = [];
  for (let i = 0; i < WORKERS; i += 1) {
    children.push(child.spawn(process.execPath, [new URL(import.meta.url).pathname], { cwd: process.cwd(), stdio: ['ignore', 'inherit', 'inherit'], env: { ...process.env, SHICHOSE_WORKER_ID: String(i), SHICHOSE_WORKER_COUNT: String(WORKERS), SHICHOSE_EMBED_MANIFEST: MANIFEST, SHICHOSE_EMBED_LIMIT: String(LIMIT || '') } }));
  }
  await new Promise((resolve, reject) => {
    let left = children.length;
    const timer = setInterval(() => progress({ total: manifest.length, activeWorkers: children.filter(c => c.exitCode === null).map(c => c.pid) }), 5000);
    for (const c of children) c.on('exit', code => {
      if (code) { clearInterval(timer); reject(new Error(`worker ${c.pid} exited ${code}`)); return; }
      left -= 1;
      if (!left) { clearInterval(timer); resolve(); }
    });
  });
  const merged = mergeResults(manifest.length);
  progress({ phase: 'parallel-batched-completed', total: manifest.length, ...merged, activeWorkers: [] });
  console.log(JSON.stringify({ BH: 'B"H', manifest: MANIFEST, ...merged, workers: WORKERS, threads: THREADS, batchSize: BATCH_SIZE, final: FINAL, failures: FAILURES, progress: PROGRESS }, null, 2));
}
if (WORKER_ID >= 0) runWorker().catch(error => { console.error(error.stack || error); process.exit(1); });
else runParent().catch(error => { console.error(error.stack || error); process.exit(1); });
