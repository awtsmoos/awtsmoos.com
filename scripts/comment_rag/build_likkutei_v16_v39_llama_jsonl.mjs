// B"H
/**
 * @file build_likkutei_v16_v39_llama_jsonl.mjs
 * @chapter The Archived Sparks March Into JSONL
 * @description Builds the Likkutei Sichos 16-39 llama vector JSONL system from
 * real archived translation sidecars, checkpointing workers before any DB pack.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');
const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const ARCH = process.env.LIKKUTEI_ARCHIVE || path.join(RAG, 'all_remaining_likkutei_comment_sidecars_archived_20260707_100732');
const WORK = process.env.RAG_WORK_DIR || path.join(RAG, 'likkutei-v16-v39-llama-work');
const RESULTS = path.join(WORK, 'results');
const MANIFEST = path.join(WORK, 'manifest.json');
const VECTORS = path.join(WORK, 'vectors.jsonl');
const PROGRESS = path.join(WORK, 'progress.json');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const VOLUMES = Array.from({ length: 24 }, (_, i) => i + 16);
const VERSES = Number(process.env.VERSES_PER_CHUNK || 3);
const WORKERS = Number(process.env.WORKERS || Math.max(1, Math.min(4, os.cpus().length || 1)));
function writeProgress(extra) { fs.writeFileSync(PROGRESS, JSON.stringify({ BH: 'B"H', workDir: WORK, vectors: VECTORS, workers: WORKERS, ...extra, at: new Date().toISOString() }, null, 2)); }
function rowsToText(rows) { return rows.map(r => `[${r.verseSection ?? r.dayuh?.verseSection ?? ''}:${r.subSection ?? r.dayuh?.subSection ?? ''}] ${r.sourceHebrew || r.dayuh?.sourceHebrew || ''}\nEN: ${r.content || ''}`).join('\n'); }
function chunksOf(meta, obj) { const keys = Object.keys(obj).filter(k => /^\d+$/.test(k) && Array.isArray(obj[k]) && obj[k].length).sort((a, b) => +a - +b), out = []; for (let i = 0; i < keys.length; i += VERSES) { const slice = keys.slice(i, i + VERSES), rows = slice.flatMap(k => obj[k]); out.push({ id: `${meta.seriesId}:${meta.postId}:v${slice[0]}-v${slice.at(-1)}`, source: 'likkutei_sichos', sourceType: 'comment_translation_archive', volume: meta.volume, seriesId: meta.seriesId, postId: meta.postId, aliasId: 'likkutei_translation_en', archiveFile: meta.file, verseStart: +slice[0], verseEnd: +slice.at(-1), commentCount: rows.length, firstCommentId: rows[0]?.id || '', lastCommentId: rows.at(-1)?.id || '', sampleContent: rows[0]?.content || '', text: rowsToText(rows) }); } return out; }
function sidecars() { const out = []; for (const v of VOLUMES) { const base = path.join(ARCH, 'social/heichelos/ikar/comments/atSeries', `likkuteiSichosVolume${v}`, 'atPost'); if (!fs.existsSync(base)) continue; for (const postId of fs.readdirSync(base).sort()) { const file = path.join(base, postId, 'likkutei_translation_en.awtsmoosJSON'); if (fs.existsSync(file) && fs.statSync(file).size > 10) out.push({ volume: v, seriesId: `likkuteiSichosVolume${v}`, postId, file }); } } return out; }
function buildManifest() { const skipped = [], chunks = []; for (const meta of sidecars()) try { chunks.push(...chunksOf(meta, legacy.deserializeBinary(fs.readFileSync(meta.file)) || {})); } catch (e) { skipped.push({ ...meta, reason: String(e.message || e) }); } const manifest = { BH: 'B"H', archive: ARCH, volumes: VOLUMES, versesPerChunk: VERSES, sidecars: sidecars().length, skipped, chunks }; fs.mkdirSync(RESULTS, { recursive: true }); fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2)); return manifest; }
function existingIds() { const ids = new Set(); if (!fs.existsSync(RESULTS)) return ids; for (const name of fs.readdirSync(RESULTS)) if (/^worker-\d+\.jsonl$/.test(name)) for (const line of fs.readFileSync(path.join(RESULTS, name), 'utf8').split(/\n/).filter(Boolean)) try { ids.add(JSON.parse(line).id); } catch {} return ids; }
function spawnWorker(id) { const args = [path.join(HERE, 'comment_rag_worker.mjs'), `--manifest=${MANIFEST}`, `--results=${RESULTS}`, `--worker=${id}`, `--workers=${WORKERS}`, `--modelRoot=${RAG}`]; const child = spawn(process.execPath, args, { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] }); child.stdout.on('data', d => fs.appendFileSync(path.join(WORK, `worker-${id}.log`), d)); child.stderr.on('data', d => fs.appendFileSync(path.join(WORK, `worker-${id}.log`), d)); return child; }
async function wait(children, total) { return new Promise((resolve, reject) => { const timer = setInterval(() => writeProgress({ phase: 'embedding', total, completed: existingIds().size, active: children.filter(c => c.exitCode === null).map(c => c.pid) }), 5000); let left = children.length; for (const c of children) c.on('exit', code => { if (code) { clearInterval(timer); reject(new Error(`worker ${c.pid} exited ${code}`)); } else if (!--left) { clearInterval(timer); resolve(); } }); }); }
function mergeVectors(total) { const byId = new Map(); for (const name of fs.readdirSync(RESULTS).filter(n => /^worker-\d+\.jsonl$/.test(n)).sort()) for (const line of fs.readFileSync(path.join(RESULTS, name), 'utf8').split(/\n/).filter(Boolean)) { const r = JSON.parse(line); byId.set(r.id, { ...r, embedding: r.vec }); } const records = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)); fs.writeFileSync(VECTORS, records.map(r => JSON.stringify(r)).join('\n') + '\n'); return { records: records.length, expected: total, vectors: VECTORS, bytes: fs.statSync(VECTORS).size }; }
async function main() { fs.mkdirSync(WORK, { recursive: true }); const manifest = buildManifest(); writeProgress({ phase: 'manifest', total: manifest.chunks.length, sidecars: manifest.sidecars, skipped: manifest.skipped.length, model: runnerState({ modelRoot: RAG }) }); const children = Array.from({ length: WORKERS }, (_, i) => spawnWorker(i)); await wait(children, manifest.chunks.length); const merged = mergeVectors(manifest.chunks.length); writeProgress({ phase: 'done', ...merged, model: runnerState({ modelRoot: RAG }) }); console.log(JSON.stringify({ BH: 'B"H', ...merged, workDir: WORK }, null, 2)); }
main().catch(e => { writeProgress({ phase: 'error', error: String(e.stack || e) }); console.error(e.stack || e); process.exit(1); });
