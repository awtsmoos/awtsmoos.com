// B"H
/** Produce a precise final classification for every eligible farbrengen. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson, writeText } from './save_output.mjs';
import { extractDocument, loadCorpus } from './corpus_utils.mjs';

const root = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const repairDir = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'repair');
const state = read(path.join(root, 'swarm-state.json'), {});
const plan = read(path.join(repairDir, 'repair-plan.json'), { summary: {}, documents: [] });
const cost = read(path.join(repairDir, 'cost-projection.json'), {});
const completed = new Map((state.completed || []).map(item => [item.documentId, item]));
const pending = new Map((plan.documents || []).map(item => [item.documentId, item]));
const corpus = loadCorpus();
const documents = [];

function read(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

for (const [documentId, source] of Object.entries(corpus.collections?.Farbrengens?.documents || {})) {
  const document = extractDocument(documentId, source);
  if (!document.meaningfulSubsectionCount) continue;
  if (completed.has(documentId)) {
    documents.push({ documentId, status: 'completed', chunks: completed.get(documentId).chunks || null });
    continue;
  }
  const item = pending.get(documentId);
  const unresolved = (item?.chunks || []).filter(chunk => !chunk.reusable).map(chunk => ({
    chunkIndex: chunk.chunkIndex,
    reason: chunk.reason || 'unresolved',
    errors: chunk.errors || null,
    error: chunk.error || null
  }));
  documents.push({ documentId, status: 'failed_or_unresolved', unresolvedChunks: unresolved.length, chunks: unresolved });
}

const report = {
  generatedAt: new Date().toISOString(),
  totalEligible: documents.length,
  completed: documents.filter(item => item.status === 'completed').length,
  remaining: documents.filter(item => item.status !== 'completed').length,
  repairChunks: plan.summary?.repairChunks || 0,
  reusableChunks: plan.summary?.reusableChunks || 0,
  tokenUsage: state.tokenUsage || {},
  estimatedRecordedCostUsd: state.estimatedCostUsd || 0,
  projectedRemainingCost: cost.remaining || null,
  paused: Boolean(state.paused),
  pauseReason: state.pauseReason || null,
  documents
};
writeJson(path.join(repairDir, 'final-completion-audit.json'), report);
writeText(path.join(repairDir, 'final-completion-audit.md'), [
  'B"H', '', '# Final Completion Audit', '',
  `- Total eligible: ${report.totalEligible}`,
  `- Completed: ${report.completed}`,
  `- Remaining: ${report.remaining}`,
  `- Repair chunks: ${report.repairChunks}`,
  `- Reusable chunks: ${report.reusableChunks}`,
  `- Paused: ${report.paused}`,
  `- Pause reason: ${report.pauseReason || 'none'}`
].join('\n'));
console.log(JSON.stringify(report, null, 2));
