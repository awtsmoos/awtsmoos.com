#!/usr/bin/env node
// B"H
/**
 * @file search_sefer_hasichos_english_fast_index.mjs
 * @description Searches the Sefer HaSichos fast Float32 sidecar. The query may
 * be --idx N, using an existing vector as proof. This avoids model startup and
 * proves real nearest-neighbor scoring over all 15,022 vectors in seconds.
 */
import fs from 'fs';
import path from 'path';
const ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const META = path.join(RAG, 'sefer-hasichos-english-comments-rag.meta.jsonl');
const F32 = path.join(RAG, 'sefer-hasichos-english-comments-rag.f32');
const LIVE_WAL = path.join(ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb.wal');
const DIMS = 384, K = Number(process.env.K || 5);
const idxArg = process.argv.includes('--idx') ? Number(process.argv[process.argv.indexOf('--idx') + 1]) : 0;
function wal() { return fs.existsSync(LIVE_WAL) ? fs.statSync(LIVE_WAL).size : null; }
function cosine(data, aOff, bOff) { let d = 0, aa = 0, bb = 0; for (let i = 0; i < DIMS; i++) { const x = data[aOff + i], y = data[bOff + i]; d += x * y; aa += x * x; bb += y * y; } return d / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1)); }
function topPush(top, index, score) { top.push({ index, score }); top.sort((a, b) => b.score - a.score); if (top.length > K) top.pop(); }
const start = performance.now(), preWal = wal();
const raw = fs.readFileSync(F32);
const data = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
const rows = data.length / DIMS;
if (!Number.isInteger(rows) || idxArg < 0 || idxArg >= rows) throw new Error(`bad index ${idxArg}`);
const top = [], qOff = idxArg * DIMS, t0 = performance.now();
for (let row = 0; row < rows; row++) topPush(top, row, cosine(data, qOff, row * DIMS));
const searchMs = Math.round(performance.now() - t0);
const wanted = new Set([idxArg, ...top.map(x => x.index)]), meta = new Map();
let n = 0;
for (const line of fs.readFileSync(META, 'utf8').split(/\n/)) { if (!line) continue; if (wanted.has(n)) meta.set(n, JSON.parse(line)); n++; }
const hits = top.map(h => ({ score: Number(h.score.toFixed(6)), index: h.index, id: meta.get(h.index)?.id, year: meta.get(h.index)?.year, title: meta.get(h.index)?.title, sample: String(meta.get(h.index)?.text || '').slice(0, 180) }));
const postWal = wal();
if (preWal !== 0 || postWal !== 0) throw new Error(`live WAL changed ${preWal}->${postWal}`);
console.log(JSON.stringify({ BH: 'B"H', queryIndex: idxArg, queryId: meta.get(idxArg)?.id, rows, dimensions: DIMS, searchMs, totalMs: Math.round(performance.now() - start), liveWalBefore: preWal, liveWalAfter: postWal, hits }, null, 2));
