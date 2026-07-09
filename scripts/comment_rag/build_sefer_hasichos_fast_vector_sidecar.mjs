#!/usr/bin/env node
// B"H
/**
 * Builds the fast flat vector sidecar for Sefer HaSichos English comments.
 * AwtsmoosDB keeps the shard vessel; Float32 sidecar makes search fly.
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline';
const ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const JOB = path.join(RAG, 'sefer-hasichos-english-comments-embedding-job');
const VECTORS = path.join(JOB, 'vectors.jsonl');
const META = path.join(JOB, 'fast-search-meta.jsonl');
const F32 = path.join(JOB, 'fast-search-vectors.f32');
const SUMMARY = path.join(JOB, 'fast-search-sidecar-summary.json');
const EXPECTED = 15022;
const DIM = 384;
function rowMeta(r) {
  return { id: r.id, year: r.year, title: r.title, postId: r.postId,
    verseStart: r.verseStart, verseEnd: r.verseEnd, text: r.text };
}
const t0 = performance.now();
const f32 = fs.openSync(F32, 'w');
const meta = fs.createWriteStream(META);
let count = 0;
for await (const line of readline.createInterface({ input: fs.createReadStream(VECTORS) })) {
  if (!line) continue;
  const r = JSON.parse(line);
  if (!r.realEmbedding || r.dimensions !== DIM || !r.vec || r.vec.length !== DIM) throw new Error('bad vector');
  const arr = Float32Array.from(r.vec);
  fs.writeSync(f32, Buffer.from(arr.buffer));
  meta.write(JSON.stringify(rowMeta(r)) + '\n');
  count++;
}
fs.closeSync(f32);
await new Promise(resolve => meta.end(resolve));
if (count !== EXPECTED) throw new Error(`expected ${EXPECTED}, got ${count}`);
const out = { BH: 'B"H', count, dimensions: DIM, vectors: F32, metadata: META,
  buildMs: Math.round(performance.now() - t0), builtAt: new Date().toISOString() };
fs.writeFileSync(SUMMARY, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
