// B"H
/**
 * One hundred workers move like distinct notes in one niggun: no duplicate
 * claims, no hidden failures, and every incomplete vessel recorded for return.
 */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson } from './save_output.mjs';
import { extractDocument, loadCorpus } from './corpus_utils.mjs';
import { runDocument } from './document_runner.mjs';

const args = process.argv.slice(2);
const options = Object.fromEntries(args.filter(a => a.startsWith('--') && a.includes('=')).map(a => a.slice(2).split('=')));
const flags = new Set(args.filter(a => a.startsWith('--') && !a.includes('=')).map(a => a.slice(2)));
const WORKERS = Math.max(1, Number(options.workers || 100));
const MAX_CHARS = Math.max(1, Number(options['max-chars'] || 12000));
const RETRIES = Math.max(0, Number(options.retries || 3));
const MODEL = options.model || 'deepseek-chat';
const FORCE = flags.has('force');
const ROOT = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const STATE_FILE = path.join(ROOT, 'swarm-state.json');
const LOCK_FILE = path.join(ROOT, 'swarm.lock');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function loadManifest() {
  const file = path.join(DEFAULT_OUTPUT_ROOT, 'config', 'corpus-manifest.json');
  const manifest = readJson(file, null);
  if (!manifest) throw new Error(`Missing manifest: ${file}`);
  return manifest.documents.filter(item => item.eligible);
}

function acquireLock() {
  fs.mkdirSync(ROOT, { recursive: true });
  if (fs.existsSync(LOCK_FILE)) {
    const existing = readJson(LOCK_FILE, {});
    throw new Error(`Swarm lock already exists: ${JSON.stringify(existing)}`);
  }
  writeJson(LOCK_FILE, { pid: process.pid, startedAt: new Date().toISOString(), workers: WORKERS });
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE); } catch {}
}

function initialState(entries) {
  const previous = readJson(STATE_FILE, {});
  const completed = Array.isArray(previous.completed) ? previous.completed : [];
  const failed = Array.isArray(previous.failed) ? previous.failed : [];
  return {
    startedAt: previous.startedAt || new Date().toISOString(),
    resumedAt: previous.startedAt ? new Date().toISOString() : null,
    workers: WORKERS,
    model: MODEL,
    maxChars: MAX_CHARS,
    retries: RETRIES,
    total: entries.length,
    completed,
    failed,
    active: [],
    claimed: [],
    progressPercent: 0,
    tokenUsage: previous.tokenUsage || { prompt: 0, completion: 0, total: 0 },
    estimatedCostUsd: previous.estimatedCostUsd || 0
  };
}

function summarizeDocument(summary) {
  let prompt = 0;
  let completion = 0;
  let total = 0;
  let cost = 0;
  let reusedChunks = 0;
  for (const result of summary.results || []) {
    if (result.reused) reusedChunks++;
    prompt += result.usage?.prompt_tokens || 0;
    completion += result.usage?.completion_tokens || 0;
    total += result.usage?.total_tokens || 0;
    cost += result.cost?.estimatedUsd || 0;
  }
  return { chunks: summary.chunks, reusedChunks, prompt, completion, total, cost };
}

function persist(state) {
  const done = new Set(state.completed.map(item => item.documentId));
  state.progressPercent = Number(((done.size / state.total) * 100).toFixed(2));
  writeJson(STATE_FILE, state);
  console.log(JSON.stringify({
    type: 'progress',
    percent: state.progressPercent,
    completed: done.size,
    failed: state.failed.length,
    active: state.active.length,
    total: state.total,
    estimatedCostUsd: Number(state.estimatedCostUsd.toFixed(6))
  }));
}

async function main() {
  acquireLock();
  const entries = loadManifest();
  const corpus = loadCorpus();
  const state = initialState(entries);
  const completedIds = new Set(state.completed.map(item => item.documentId));
  const queue = entries.filter(entry => FORCE || !completedIds.has(entry.documentId));
  let cursor = 0;

  async function worker(workerId) {
    while (true) {
      const position = cursor++;
      if (position >= queue.length) return;
      const entry = queue[position];
      state.claimed.push({ workerId, documentId: entry.documentId, claimedAt: new Date().toISOString() });
      state.active.push({ workerId, documentId: entry.documentId });
      persist(state);
      try {
        const sourceDoc = corpus.collections.Farbrengens.documents[entry.documentId];
        const document = extractDocument(entry.documentId, sourceDoc);
        const summary = await runDocument(document, {
          rootDir: ROOT,
          model: MODEL,
          maxChars: MAX_CHARS,
          retries: RETRIES,
          force: FORCE
        });
        const usage = summarizeDocument(summary);
        state.completed = state.completed.filter(item => item.documentId !== entry.documentId);
        state.completed.push({ documentId: entry.documentId, workerId, completedAt: new Date().toISOString(), ...usage });
        state.failed = state.failed.filter(item => item.documentId !== entry.documentId);
        state.tokenUsage.prompt += usage.prompt;
        state.tokenUsage.completion += usage.completion;
        state.tokenUsage.total += usage.total;
        state.estimatedCostUsd += usage.cost;
      } catch (error) {
        state.failed = state.failed.filter(item => item.documentId !== entry.documentId);
        state.failed.push({ documentId: entry.documentId, workerId, failedAt: new Date().toISOString(), error: error.stack || String(error) });
      } finally {
        state.active = state.active.filter(item => !(item.workerId === workerId && item.documentId === entry.documentId));
        persist(state);
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: Math.min(WORKERS, Math.max(queue.length, 1)) }, (_, index) => worker(index + 1)));
    state.finishedAt = new Date().toISOString();
    persist(state);
  } finally {
    releaseLock();
  }
}

process.on('SIGINT', () => { releaseLock(); process.exit(130); });
process.on('SIGTERM', () => { releaseLock(); process.exit(143); });
main().catch(error => { releaseLock(); console.error(error.stack || String(error)); process.exit(1); });
