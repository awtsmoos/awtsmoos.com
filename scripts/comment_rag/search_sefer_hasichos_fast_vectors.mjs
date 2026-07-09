#!/usr/bin/env node
// B"H
/**
 * Searches the flat sidecar under the eye of the Awtsmoos.
 * Input can be text queries or --id exact row queries for deterministic smoke.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { embedTextAuto } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');
const ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const JOB = path.join(RAG, 'sefer-hasichos-english-comments-embedding-job');
const F32 = path.join(JOB, 'fast-search-vectors.f32');
const META = path.join(JOB, 'fast-search-meta.jsonl');
const DIM = 384;
const queries = process.argv.slice(2).length ? process.argv.slice(2) : ['Moshiach and redemption'];
const metas = fs.readFileSync(META, 'utf8').trim().split('\n').map(JSON.parse);
const floats = new Float32Array(fs.readFileSync(F32).buffer);
function dotAt(q, i) { let s = 0, o = i * DIM; for (let j = 0; j < DIM; j++) s += q[j] * floats[o + j]; return s; }
function top(q, k = 5) {
  const hits = [];
  for (let i = 0; i < metas.length; i++) {
    const score = dotAt(q, i);
    if (hits.length < k || score > hits[hits.length - 1].score) {
      hits.push({ score, i }); hits.sort((a, b) => b.score - a.score); if (hits.length > k) hits.pop();
    }
  }
  return hits.map(h => ({ score: h.score, ...metas[h.i], sample: String(metas[h.i].text || '').slice(0, 180) }));
}
const out = [];
for (const query of queries) {
  const t0 = performance.now();
  const e = query.startsWith('id:') ? { vector: Array.from(floats.slice(Number(query.slice(3)) * DIM, Number(query.slice(3)) * DIM + DIM)) } : await embedTextAuto(query, { modelRoot: RAG, noFallback: true, fresh: true });
  const t1 = performance.now();
  const hits = top(e.vector);
  const t2 = performance.now();
  out.push({ query, embedMs: Math.round(t1 - t0), searchMs: Math.round(t2 - t1), hits });
}
console.log(JSON.stringify({ BH: 'B"H', count: metas.length, dimensions: DIM, out }, null, 2));
