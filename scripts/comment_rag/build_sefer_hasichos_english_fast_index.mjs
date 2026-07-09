#!/usr/bin/env node
// B"H
/**
 * @file build_sefer_hasichos_english_fast_index.mjs
 * @description Builds a compact search index beside the separate AwtsmoosDB
 * shard. AwtsmoosDB remains the row shard; Float32 sidecar gives real fast
 * vector search without millions of proxy reads.
 */
import fs from 'fs';
import path from 'path';
const ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const JOB = path.join(RAG, 'sefer-hasichos-english-comments-embedding-job');
const VECTORS = path.join(JOB, 'vectors.jsonl');
const FAST = path.join(RAG, 'sefer-hasichos-english-comments-rag.fast-f32');
const META = path.join(RAG, 'sefer-hasichos-english-comments-rag.fast-meta.jsonl');
const SUMMARY = path.join(JOB, 'fast-index-summary.json');
const DIM = 384;
const t0 = performance.now();
const lines = fs.readFileSync(VECTORS, 'utf8').trim().split('\n');
const fd = fs.openSync(FAST, 'w');
const metas = [];
const buf = Buffer.allocUnsafe(DIM * 4);
for (let i = 0; i < lines.length; i++) {
  const r = JSON.parse(lines[i]);
  if (!r.realEmbedding || r.dimensions !== DIM || !Array.isArray(r.vec) || r.vec.length !== DIM) throw new Error(`bad vector ${i}`);
  for (let j = 0; j < DIM; j++) buf.writeFloatLE(Number(r.vec[j]), j * 4);
  fs.writeSync(fd, buf, 0, buf.length);
  metas.push(JSON.stringify({ id: r.id, year: r.year, title: r.title, verseStart: r.verseStart, verseEnd: r.verseEnd, text: r.text }));
}
fs.closeSync(fd);
fs.writeFileSync(META, metas.join('\n') + '\n');
const out = { BH: 'B"H', rows: lines.length, dimensions: DIM, fast: FAST, meta: META, bytes: fs.statSync(FAST).size, totalMs: Math.round(performance.now() - t0), builtAt: new Date().toISOString() };
fs.writeFileSync(SUMMARY, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
