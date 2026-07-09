#!/usr/bin/env node
// B"H
/**
 * @file verify_sefer_hasichos_english_vectors_shard.mjs
 * @description Fast bounded proof for the separate Sefer HaSichos vector shard.
 * It avoids the slow generic db.vector.nearest fallback and uses a local top-k
 * cosine scan over numeric list indexes. No model spawn. No live DB open.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const JOB = path.join(RAG, 'sefer-hasichos-english-comments-embedding-job');
const SHARD = path.join(RAG, 'sefer-hasichos-english-comments-rag.awtsdb');
const SUMMARY = path.join(JOB, 'pack-awtsdb-summary.json');
const LIVE_WAL = path.join(ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb.wal');
const LIST = 'seferHaSichosEnglishCommentVectors';
const EXPECTED = 15022;
const START = performance.now();
function walSize() { return fs.existsSync(LIVE_WAL) ? fs.statSync(LIVE_WAL).size : null; }
function hasHebrew(s) { return /[\u0590-\u05ff]/.test(String(s || '')); }
function assertRow(r, label) { if (!r?.id) throw new Error(`${label}: missing id`); if (r.realEmbedding !== true) throw new Error(`${label}: realEmbedding`); if (r.dimensions !== 384) throw new Error(`${label}: dimensions`); if (!r.vec || r.vec.length !== 384) throw new Error(`${label}: vec`); if (hasHebrew(r.text)) throw new Error(`${label}: Hebrew/Yiddish text`); }
function cosine(a, b) { let d = 0, aa = 0, bb = 0; for (let i = 0; i < 384; i++) { const x = +a[i], y = +b[i]; d += x * y; aa += x * x; bb += y * y; } return d / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1)); }
function addTop(out, item, score, k) { out.push({ score, item }); out.sort((a, b) => b.score - a.score); if (out.length > k) out.pop(); }
function fastNearest(list, q, k) { const out = []; for (let i = 0; i < list.length; i++) { const item = list[i]; const v = item?.vec; if (!v || v.length !== 384) continue; addTop(out, item, cosine(q, v), k); } return out; }
function view(h) { return { score: Number(h.score.toFixed(6)), id: h.item.id, year: h.item.year, title: h.item.title, sample: String(h.item.text || '').slice(0, 160) }; }
const preWal = walSize();
const db = new AwtsmoosDB(SHARD, { debug: false, wal: false, compression: false, turboWrites: false });
await db.open();
const list = db.root[LIST];
if (!list || list.length !== EXPECTED) throw new Error(`expected ${EXPECTED}, got ${list?.length}`);
const sampleIndexes = [0, 1, 2, 500, 1500, 7000, 12000, EXPECTED - 1];
for (const i of sampleIndexes) assertRow(list[i], `sample ${i}`);
const searches = [];
for (const idx of [0, 7000, EXPECTED - 1]) { const q = list[idx]; const t0 = performance.now(); const hits = fastNearest(list, q.vec, 5); const ms = Math.round(performance.now() - t0); if (!hits.some(h => h.item.id === q.id)) throw new Error(`self miss ${idx}`); searches.push({ idx, queryId: q.id, ms, hits: hits.map(view) }); }
const postWal = walSize();
if (preWal !== 0 || postWal !== 0) throw new Error(`live WAL changed: ${preWal}->${postWal}`);
const out = { BH: 'B"H', shard: SHARD, listName: LIST, records: EXPECTED, dimensions: 384, realEmbedding: true, sampleIndexes, searches, liveWalBefore: preWal, liveWalAfter: postWal, totalMs: Math.round(performance.now() - START), verifiedAt: new Date().toISOString() };
fs.writeFileSync(SUMMARY, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.exit(0);
