// B"H
/** Concurrent corpus runner with unique claims and a fatal-error circuit breaker. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson } from './save_output.mjs';
import { extractDocument, loadCorpus } from './corpus_utils.mjs';
import { runDocument } from './document_runner.mjs';
import { DeepSeekError } from './deepseek_client.mjs';
import { initialState, persist, readJson, removeDocument, summarizeDocument } from './swarm_state.mjs';

const args = process.argv.slice(2);
const opts = Object.fromEntries(args.filter(a => a.startsWith('--') && a.includes('=')).map(a => a.slice(2).split('=')));
const flags = new Set(args.filter(a => a.startsWith('--') && !a.includes('=')).map(a => a.slice(2)));
const config = {
  workers: Math.max(1, Number(opts.workers || 100)),
  maxChars: Math.max(1, Number(opts['max-chars'] || 3500)),
  retries: Math.max(0, Number(opts.retries || 3)),
  model: opts.model || 'deepseek-chat',
  force: flags.has('force')
};
const root = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const stateFile = path.join(root, 'swarm-state.json');
const lockFile = path.join(root, 'swarm.lock');

function acquireLock() {
  fs.mkdirSync(root, { recursive: true });
  if (fs.existsSync(lockFile)) throw new Error(`Swarm lock exists: ${JSON.stringify(readJson(lockFile, {}))}`);
  writeJson(lockFile, { pid: process.pid, startedAt: new Date().toISOString(), ...config });
}

function releaseLock() {
  try { fs.unlinkSync(lockFile); } catch {}
}

function eligibleEntries() {
  const file = path.join(DEFAULT_OUTPUT_ROOT, 'config', 'corpus-manifest.json');
  const manifest = readJson(file, null);
  if (!manifest) throw new Error(`Missing manifest: ${file}`);
  return manifest.documents.filter(item => item.eligible);
}

function isFatal(error) {
  return error instanceof DeepSeekError && error.fatal;
}

async function main() {
  acquireLock();
  const entries = eligibleEntries();
  const corpus = loadCorpus();
  const state = initialState(readJson(stateFile, null), entries, config);
  const completedIds = new Set(state.completed.map(item => item.documentId));
  const queue = entries.filter(item => config.force || !completedIds.has(item.documentId));
  let cursor = 0;

  async function worker(workerId) {
    while (!state.paused) {
      const position = cursor++;
      if (position >= queue.length) return;
      const entry = queue[position];
      state.claimed.push({ workerId, documentId: entry.documentId, claimedAt: new Date().toISOString() });
      state.active.push({ workerId, documentId: entry.documentId });
      persist(stateFile, state);
      try {
        const source = corpus.collections.Farbrengens.documents[entry.documentId];
        const document = extractDocument(entry.documentId, source);
        const summary = await runDocument(document, { rootDir: root, ...config });
        const usage = summarizeDocument(summary);
        state.completed = removeDocument(state.completed, entry.documentId);
        state.completed.push({ documentId: entry.documentId, workerId, completedAt: new Date().toISOString(), ...usage });
        state.failed = removeDocument(state.failed, entry.documentId);
        state.pending = removeDocument(state.pending, entry.documentId);
        state.tokenUsage.prompt += usage.prompt;
        state.tokenUsage.completion += usage.completion;
        state.tokenUsage.total += usage.total;
        state.estimatedCostUsd += usage.cost;
      } catch (error) {
        state.failed = removeDocument(state.failed, entry.documentId);
        state.pending = removeDocument(state.pending, entry.documentId);
        const record = { documentId: entry.documentId, workerId, at: new Date().toISOString(), error: error.stack || String(error) };
        if (isFatal(error)) {
          state.pending.push({ ...record, reason: 'fatal_provider_pause' });
          state.paused = true;
          state.pauseReason = error.message;
        } else {
          state.failed.push(record);
        }
      } finally {
        state.active = state.active.filter(item => !(item.workerId === workerId && item.documentId === entry.documentId));
        persist(stateFile, state);
      }
    }
  }

  try {
    const count = Math.min(config.workers, Math.max(queue.length, 1));
    await Promise.all(Array.from({ length: count }, (_, index) => worker(index + 1)));
    state.finishedAt = new Date().toISOString();
    persist(stateFile, state);
  } finally {
    releaseLock();
  }
}

process.on('SIGINT', () => { releaseLock(); process.exit(130); });
process.on('SIGTERM', () => { releaseLock(); process.exit(143); });
main().catch(error => { releaseLock(); console.error(error.stack || String(error)); process.exit(1); });
