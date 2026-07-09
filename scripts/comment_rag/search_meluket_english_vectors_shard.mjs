#!/usr/bin/env node
// B"H
/**
 * @file search_meluket_english_vectors_shard.mjs
 * @description Fast f32 semantic search over packed Meluket English comments.
 * Prints full stored chunk text, never a preview.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { performance } from 'perf_hooks';
const require = createRequire(import.meta.url);
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const MANIFEST = path.join(RAG, 'meluket-english-comments-rag.fast-manifest.json');
const F32 = path.join(RAG, 'meluket-english-comments-rag.f32');
const META = path.join(RAG, 'meluket-english-comments-rag.meta.jsonl');
const DIM = 384;
const TOP_K = Number(process.env.TOP_K || 5);
const DEFAULT_QUERIES = ['dreams and sleep','music and singing','jealousy between brothers','friendship','travel','food and eating bread','fear','business honesty','children asking questions','rain','fire','joy','sadness','leadership','kindness','loneliness'];

function readManifest() { if (!fs.existsSync(MANIFEST)) return { matrix: F32, metadata: META }; const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); return { ...manifest, matrix: manifest.matrix || F32, metadata: manifest.metadata || META }; }
function normalize(vector) { let sum = 0; for (const value of vector) sum += value * value; const mag = Math.sqrt(sum) || 1; return vector.map(value => value / mag); }
function cosineAt(matrix, offset, q) { let dot = 0, aa = 0, bb = 0; for (let j = 0; j < DIM; j += 1) { const x = matrix.readFloatLE(offset + j * 4); const y = q[j]; dot += x * y; aa += x * x; bb += y * y; } return dot / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1)); }
function addBest(best, hit, k) { best.push(hit); best.sort((a, b) => b.score - a.score); if (best.length > k) best.pop(); }
function scan(matrix, q, rows, k) { const best = []; for (let i = 0; i < rows; i += 1) { const score = cosineAt(matrix, i * DIM * 4, q); if (best.length < k || score > best.at(-1).score) addBest(best, { score, index: i }, k); } return best; }
function hydrate(best, metaLines) { return best.map(hit => { const row = JSON.parse(metaLines[hit.index]); return { score: Number(hit.score.toFixed(6)), index: hit.index, ...row, text: row.text == null ? '' : String(row.text) }; }); }
async function searchOne(query, matrix, metaLines, rows) { const start = performance.now(); const embedded = await embedTextAuto(query, { modelRoot: RAG, noFallback: true, fresh: true }); const afterEmbed = performance.now(); const ranked = scan(matrix, normalize(embedded.vector), rows, TOP_K); const afterScan = performance.now(); return { query, provider: embedded.provider, timingMs: { embed: Math.round(afterEmbed - start), scan: Math.round(afterScan - afterEmbed), total: Math.round(afterScan - start) }, results: hydrate(ranked, metaLines) }; }
function line(value = '') { return value == null ? '' : String(value); }
function renderSearch(search) { const parts = []; search.results.forEach((result, rankIndex) => { parts.push('==================================================','','QUERY','',search.query,'','--------------------------------------------------','','RANK','',String(rankIndex + 1),'','SCORE','',result.score.toFixed(6),'','ID','',line(result.id),'','SERIES ID','',line(result.seriesId),'','TITLE','',line(result.title),'','COMMENT PATH','',line(result.commentPath),'','POST ID','',line(result.postId),'','VERSE RANGE','',`${line(result.verseStart)} - ${line(result.verseEnd)}`,'','FULL COMMENT','',result.text,'','==================================================',''); }); return parts.join('\n'); }
async function main() { const queries = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_QUERIES; const manifest = readManifest(); const loadStart = performance.now(); const matrix = fs.readFileSync(manifest.matrix); const metaText = fs.readFileSync(manifest.metadata, 'utf8').trim(); const metaLines = metaText ? metaText.split(/\n/) : []; const rows = Math.floor(matrix.length / (DIM * 4)); if (rows !== metaLines.length) throw new Error(`matrix/meta mismatch rows=${rows} meta=${metaLines.length}`); const loadMs = Math.round(performance.now() - loadStart); const searches = []; for (const query of queries) searches.push(await searchOne(query, matrix, metaLines, rows)); const header = ['B"H','MODE','fast-f32-sidecar-meluket-english-comments','ROWS',String(rows),'DIMENSIONS',String(DIM),'TOP K',String(TOP_K),'LOAD MS',String(loadMs),'RUNNER',JSON.stringify(runnerState({ modelRoot: RAG })),'SEARCHED AT',new Date().toISOString(),''].join('\n'); console.log(header + searches.map(renderSearch).join('\n')); }
main().catch(error => { console.error(error.stack || error); process.exit(1); });
