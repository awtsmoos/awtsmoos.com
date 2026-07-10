// B"H
/** Persistent state helpers for the Sichos Kodesh swarm. */
import fs from 'fs';
import { writeJson } from './save_output.mjs';

export function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export function initialState(previous, entries, config) {
  return {
    startedAt: previous?.startedAt || new Date().toISOString(),
    resumedAt: previous ? new Date().toISOString() : null,
    workers: config.workers,
    model: config.model,
    maxChars: config.maxChars,
    retries: config.retries,
    total: entries.length,
    completed: Array.isArray(previous?.completed) ? previous.completed : [],
    failed: Array.isArray(previous?.failed) ? previous.failed : [],
    pending: Array.isArray(previous?.pending) ? previous.pending : [],
    active: [],
    claimed: [],
    paused: false,
    pauseReason: null,
    progressPercent: 0,
    tokenUsage: previous?.tokenUsage || { prompt: 0, completion: 0, total: 0 },
    estimatedCostUsd: previous?.estimatedCostUsd || 0
  };
}

export function summarizeDocument(summary) {
  const totals = {
    chunks: summary.chunks,
    reusedChunks: 0,
    prompt: 0,
    completion: 0,
    total: 0,
    cost: 0
  };
  for (const result of summary.results || []) {
    if (result.reused) totals.reusedChunks++;
    totals.prompt += result.usage?.prompt_tokens || 0;
    totals.completion += result.usage?.completion_tokens || 0;
    totals.total += result.usage?.total_tokens || 0;
    totals.cost += result.cost?.estimatedUsd || 0;
  }
  return totals;
}

export function persist(file, state) {
  const completed = new Set(state.completed.map(item => item.documentId));
  state.progressPercent = Number(((completed.size / state.total) * 100).toFixed(2));
  writeJson(file, state);
  console.log(JSON.stringify({
    type: 'progress',
    percent: state.progressPercent,
    completed: completed.size,
    failed: state.failed.length,
    pending: state.pending.length,
    active: state.active.length,
    paused: state.paused,
    total: state.total,
    estimatedCostUsd: Number(state.estimatedCostUsd.toFixed(6))
  }));
}

export function removeDocument(list, documentId) {
  return list.filter(item => item.documentId !== documentId);
}
