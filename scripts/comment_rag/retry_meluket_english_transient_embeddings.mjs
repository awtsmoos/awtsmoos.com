#!/usr/bin/env node
// B"H
/**
 * Retry only missing Meluket English vectors from transient failures.
 *
 * In the chamber where the Awtsmoos speaks a vector into the void, we do not
 * disturb completed vessels. We scan every historical worker file, identify
 * the thirteen empty sparks, and append only what is absent. When llama.cpp
 * crashes beyond the BGE 512-token shore, the same embeddingText is offered in
 * a shorter garment while the stored text remains untouched and whole.
 */
import fs from 'fs';
import path from 'path';
import child from 'child_process';

const RAG = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag';
const JOB = path.join(RAG, 'meluket-english-comments-embedding-job');
const MANIFEST = path.join(JOB, 'manifest.jsonl');
const RESULTS = path.join(JOB, 'simple-results');
const TRANSIENT = path.join(JOB, 'embedding-transient-failures.jsonl');
const FINAL = path.join(JOB, 'vectors.jsonl');
const PROGRESS = path.join(JOB, 'embedding-progress.json');
const BIN = path.join(RAG, 'embedder-lab/llama.cpp/build/bin/llama-embedding');
const MODEL = path.join(RAG, 'models/bge-small-en-v1.5-q8_0.gguf');
const DIMS = 384;
const WORKERS = 2;
const CUTS = [0, 2000, 1800, 1600, 1400, 1200, 1000, 800];

const lines = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean) : [];
const hasHebrew = text => /[\u0590-\u05ff]/.test(String(text || ''));
const nums = raw => String(raw || '').match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)?.map(Number).filter(Number.isFinite) || [];
const norm = vec => { const mag = Math.sqrt(vec.reduce((s, n) => s + n * n, 0)) || 1; return vec.map(n => Number((n / mag).toFixed(7))); };

function resultFiles() {
  return fs.readdirSync(RESULTS).filter(name => name.endsWith('.jsonl')).sort().map(name => path.join(RESULTS, name));
}
function completedIds() {
  const ids = new Set();
  for (const file of resultFiles()) for (const line of lines(file)) {
    try { ids.add(JSON.parse(line).id); } catch {}
  }
  return ids;
}
function outputFile(index) { return path.join(RESULTS, `worker-${WORKERS}of${index % WORKERS}.jsonl`); }
function vectorFor(text) {
  if (!text || typeof text !== 'string') throw new Error('missing embeddingText');
  if (hasHebrew(text)) throw new Error('Hebrew/Yiddish Unicode in embeddingText');
  let last = null;
  for (const cut of CUTS) {
    const input = cut ? text.slice(0, cut) : text;
    const run = child.spawnSync(BIN, ['-m', MODEL, '-p', input, '--pooling', 'cls', '--embd-normalize', '2', '--embd-output-format', 'raw', '-t', '1'], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
    if (run.status === 0) {
      const vec = nums(run.stdout);
      if (vec.length !== DIMS) throw new Error(`expected ${DIMS} nums got ${vec.length}`);
      return { vec: norm(vec), embeddingCharsUsed: input.length, shortenedForModelLimit: Boolean(cut) };
    }
    last = run.stderr || `llama exit ${run.status}`;
  }
  throw new Error(last);
}
function record(item, made) {
  return { id: item.id, seriesId: item.seriesId, postId: item.postId, aliasId: item.aliasId, commentPath: item.commentPath, title: item.title, verseStart: item.verseStart, verseEnd: item.verseEnd, firstSubSection: item.firstSubSection, lastSubSection: item.lastSubSection, commentIds: item.commentIds, firstCommentId: item.firstCommentId, lastCommentId: item.lastCommentId, commentCount: item.commentCount, rowStart: item.rowStart, rowEnd: item.rowEnd, textPolicy: item.textPolicy, text: item.text, embeddingTextPolicy: 'manifest embeddingText; shortened only when BGE/llama 512-token limit aborts', previewEnglish: item.previewEnglish, embeddingManifest: MANIFEST, provider: 'llama-embedding:bge-small-en-v1.5-q8_0:meluket-transient-retry', realEmbedding: true, dimensions: made.vec.length, embeddingCharsUsed: made.embeddingCharsUsed, shortenedForModelLimit: made.shortenedForModelLimit, vec: made.vec };
}
function merge(manifest) {
  const byId = new Map();
  for (const file of resultFiles()) for (const line of lines(file)) { const row = JSON.parse(line); if (!byId.has(row.id)) byId.set(row.id, row); }
  const rows = manifest.filter(item => byId.has(item.id)).map(item => byId.get(item.id));
  fs.writeFileSync(FINAL, rows.map(JSON.stringify).join('\n') + (rows.length ? '\n' : ''));
  return { rows, missing: manifest.filter(item => !byId.has(item.id)) };
}
function wantedRows(manifest, ids) {
  const wanted = new Set(lines(TRANSIENT).map(line => { try { const o = JSON.parse(line); return o.id; } catch { return null; } }).filter(Boolean));
  const missing = manifest.filter(item => !ids.has(item.id));
  return missing.filter(item => wanted.has(item.id) || wanted.size === 0);
}

fs.mkdirSync(RESULTS, { recursive: true });
const manifest = lines(MANIFEST).map((line, index) => ({ index, ...JSON.parse(line) }));
let ids = completedIds();
const todo = wantedRows(manifest, ids);
const made = [];
for (const item of todo) {
  ids = completedIds();
  if (ids.has(item.id)) continue;
  const vector = vectorFor(item.embeddingText || item.text);
  fs.appendFileSync(outputFile(item.index), JSON.stringify(record(item, vector)) + '\n');
  made.push({ index: item.index, id: item.id, output: outputFile(item.index), shortenedForModelLimit: vector.shortenedForModelLimit, embeddingCharsUsed: vector.embeddingCharsUsed });
}
const merged = merge(manifest);
const payload = { BH: 'B"H', phase: merged.missing.length ? 'meluket-transient-retry-incomplete' : 'meluket-embedding-complete', manifestTotal: manifest.length, completedVectors: merged.rows.length, missingCount: merged.missing.length, appended: made.length, appendedRows: made, updatedAt: new Date().toISOString() };
fs.writeFileSync(PROGRESS, JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));
if (merged.missing.length) process.exitCode = 4;
