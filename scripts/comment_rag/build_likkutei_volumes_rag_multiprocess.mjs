// B"H
/**
 * @file build_likkutei_volumes_rag_multiprocess.mjs
 * @description
 * Resumable multi-process Likkutei Sichos comment RAG builder. The old builder
 * asked one flame to light every lamp. This one gives each worker its own flame,
 * checkpoints every spark, and only then pours the gathered light into AwtsDB.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import {
  DEFAULT_ALIAS,
  DEFAULT_ROOT,
  buildManifest,
  readResultRecords,
  sidecarCount,
  uniqueRecords,
  volumesFromSpec
} from './comment_rag_shared.mjs';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.AWTS_DB_ROOT || DEFAULT_ROOT;
const RAG = path.join(ROOT, 'ai/comment-rag');
const ALIAS = process.env.ALIAS_ID || DEFAULT_ALIAS;
const VOLUMES = volumesFromSpec(process.env.VOLUMES || '1-15');
const VERSES = Number(process.env.VERSES_PER_CHUNK || 3);
const WORKERS = Number(process.env.WORKERS || Math.max(1, Math.min(os.cpus().length / 2 || 1, 2)));
const SHARD = process.env.LIKKUTEI_RAG_SHARD || path.join(RAG, 'likkutei-v01-v15-rag.awtsdb');
const WORK = process.env.RAG_WORK_DIR || path.join(RAG, 'likkutei-v01-v15-multiprocess-work');
const RESULTS = path.join(WORK, 'results');
const MANIFEST = path.join(WORK, 'manifest.json');
const PROGRESS = process.env.PROGRESS_FILE || path.join(RAG, 'likkutei-v01-v15-rag-multiprocess-progress.json');
const FINALIZE_ONLY = process.env.FINALIZE_ONLY === '1';
const NO_FINALIZE = process.env.NO_FINALIZE === '1';

function writeProgress(payload) {
  const records = uniqueRecords(readResultRecords(RESULTS));
  fs.writeFileSync(PROGRESS, JSON.stringify({
    BH: 'B"H',
    pid: process.pid,
    shard: SHARD,
    workDir: WORK,
    workers: WORKERS,
    completed: records.length,
    sidecars: sidecarCount(ROOT),
    ...payload,
    at: new Date().toISOString()
  }, null, 2));
}

async function ensureManifest() {
  fs.mkdirSync(WORK, { recursive: true });
  fs.mkdirSync(RESULTS, { recursive: true });
  const manifest = await buildManifest({ root: ROOT, ragDir: RAG, volumes: VOLUMES, aliasId: ALIAS, versesPerChunk: VERSES });
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  return manifest;
}

function spawnWorker(workerId) {
  const args = [path.join(here, 'comment_rag_worker.mjs'), `--manifest=${MANIFEST}`, `--results=${RESULTS}`, `--worker=${workerId}`, `--workers=${WORKERS}`, `--modelRoot=${RAG}`];
  const child = spawn(process.execPath, args, { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });
  const log = path.join(WORK, `worker-${workerId}.log`);
  child.stdout.on('data', data => fs.appendFileSync(log, data));
  child.stderr.on('data', data => fs.appendFileSync(log, data));
  return child;
}

function waitForWorkers(children, total) {
  return new Promise((resolve, reject) => {
    let left = children.length;
    const timer = setInterval(() => writeProgress({ phase: 'embedding', total, activeWorkers: children.filter(c => c.exitCode === null).map(c => c.pid) }), 5000);
    for (const child of children) child.on('exit', code => {
      left--;
      if (code) {
        clearInterval(timer);
        reject(new Error(`worker ${child.pid} exited ${code}`));
      } else if (!left) {
        clearInterval(timer);
        resolve();
      }
    });
  });
}

async function finalizeShard(total) {
  const records = uniqueRecords(readResultRecords(RESULTS));
  if (records.length !== total) throw new Error(`cannot finalize: have ${records.length} records, expected ${total}`);
  for (const ext of ['', '.wal']) if (fs.existsSync(SHARD + ext)) fs.rmSync(SHARD + ext, { force: true });
  const db = new AwtsmoosDB(SHARD, { debug: false });
  await db.open();
  await db.createList(db.root, 'chunks');
  await db.vector.enable(db.root.chunks, { dimensions: 384, metric: 'cosine' });
  for (const record of records) await db.root.chunks.push(record);
  await db.waitForIdle();
  const query = await embedTextAuto('Torah mitzvos teshuvah redemption', { modelRoot: RAG });
  const sample = (await db.vector.nearest(db.root.chunks, query.vector, 10)).map(item => ({
    score: item.score,
    id: item.item.id,
    volume: item.item.volume,
    seriesId: item.item.seriesId,
    postId: item.item.postId,
    verses: [item.item.verseStart, item.item.verseEnd],
    sample: String(item.item.sampleContent || '').slice(0, 120)
  }));
  await db.close();
  writeProgress({ phase: 'done', total, records: records.length, model: runnerState({ modelRoot: RAG }), sample, finished: new Date().toISOString() });
  return { BH: 'B"H', shard: SHARD, records: records.length, sample };
}

async function main() {
  const manifest = await ensureManifest();
  const total = manifest.chunks.length;
  writeProgress({ phase: FINALIZE_ONLY ? 'finalize_only' : 'manifest', total, branches: manifest.branches, skipped: manifest.skipped.length });
  if (!FINALIZE_ONLY) {
    const children = Array.from({ length: WORKERS }, (_, workerId) => spawnWorker(workerId));
    await waitForWorkers(children, total);
  }
  writeProgress({ phase: 'embedded', total, noFinalize: NO_FINALIZE });
  if (NO_FINALIZE) return console.log(JSON.stringify({ BH: 'B"H', phase: 'embedded', total, completed: uniqueRecords(readResultRecords(RESULTS)).length }, null, 2));
  console.log(JSON.stringify(await finalizeShard(total), null, 2));
}

main().catch(error => {
  writeProgress({ phase: 'error', error: String(error?.stack || error) });
  console.error(error?.stack || error);
  process.exit(1);
});
