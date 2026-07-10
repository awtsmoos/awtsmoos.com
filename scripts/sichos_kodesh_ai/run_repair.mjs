// B"H
/** Repair-only swarm: calls DeepSeek only for chunks that fail strict reuse. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson } from './save_output.mjs';
import { extractDocument, loadCorpus } from './corpus_utils.mjs';
import { runDocument } from './document_runner.mjs';
import { DeepSeekError } from './deepseek_client.mjs';
import { persist, readJson, removeDocument, summarizeDocument } from './swarm_state.mjs';

const args = process.argv.slice(2);
const opts = Object.fromEntries(args.filter(a => a.includes('=')).map(a => a.slice(2).split('=')));
const config = {
  workers: Math.max(1, Number(opts.workers || 100)),
  maxChars: 3500,
  retries: Math.max(0, Number(opts.retries || 3)),
  model: opts.model || 'deepseek-v4-flash'
};
const root = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const stateFile = path.join(root, 'swarm-state.json');
const planFile = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'repair', 'repair-plan.json');
const lockFile = path.join(root, 'repair.lock');

function acquireLock() {
  if (fs.existsSync(lockFile)) throw new Error(`Repair lock exists: ${JSON.stringify(readJson(lockFile, {}))}`);
  writeJson(lockFile, { pid: process.pid, startedAt: new Date().toISOString(), ...config });
}

function releaseLock() {
  try { fs.unlinkSync(lockFile); } catch {}
}

function isFatal(error) {
  return error instanceof DeepSeekError && error.fatal;
}

async function main() {
  acquireLock();
  const plan = readJson(planFile, null);
  if (!plan) throw new Error('Repair plan missing; run repair_plan.mjs first');
  const corpus = loadCorpus();
  const state = readJson(stateFile, {});
  const queue = plan.documents.filter(doc => doc.repairChunks > 0);
  state.workers = config.workers;
  state.maxChars = config.maxChars;
  state.model = config.model;
  state.retries = config.retries;
  state.active = [];
  state.claimed = [];
  state.paused = false;
  state.pauseReason = null;
  state.repairRunStartedAt = new Date().toISOString();
  let cursor = 0;

  async function worker(workerId) {
    while (!state.paused) {
      const index = cursor++;
      if (index >= queue.length) return;
      const item = queue[index];
      state.active.push({ workerId, documentId: item.documentId });
      state.claimed.push({ workerId, documentId: item.documentId, claimedAt: new Date().toISOString() });
      persist(stateFile, state);
      try {
        const source = corpus.collections.Farbrengens.documents[item.documentId];
        const document = extractDocument(item.documentId, source);
        const summary = await runDocument(document, { rootDir: root, ...config });
        const usage = summarizeDocument(summary);
        state.completed = removeDocument(state.completed || [], item.documentId);
        state.completed.push({ documentId: item.documentId, workerId, repairedAt: new Date().toISOString(), ...usage });
        state.failed = removeDocument(state.failed || [], item.documentId);
        state.pending = removeDocument(state.pending || [], item.documentId);
        state.tokenUsage.prompt += usage.prompt;
        state.tokenUsage.completion += usage.completion;
        state.tokenUsage.total += usage.total;
        state.estimatedCostUsd += usage.cost;
      } catch (error) {
        const record = { documentId: item.documentId, workerId, at: new Date().toISOString(), error: error.stack || String(error) };
        if (isFatal(error)) {
          state.pending = removeDocument(state.pending || [], item.documentId);
          state.pending.push({ ...record, reason: 'fatal_provider_pause' });
          state.paused = true;
          state.pauseReason = error.message;
        } else {
          state.failed = removeDocument(state.failed || [], item.documentId);
          state.failed.push(record);
        }
      } finally {
        state.active = state.active.filter(active => active.documentId !== item.documentId);
        persist(stateFile, state);
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: Math.min(config.workers, Math.max(queue.length, 1)) }, (_, i) => worker(i + 1)));
    state.repairRunFinishedAt = new Date().toISOString();
    persist(stateFile, state);
  } finally {
    releaseLock();
  }
}

process.on('SIGINT', () => { releaseLock(); process.exit(130); });
process.on('SIGTERM', () => { releaseLock(); process.exit(143); });
main().catch(error => { releaseLock(); console.error(error.stack || String(error)); process.exit(1); });
