// B"H
/** Measured cost projection from saved successful chunks and exact repair work. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson } from './save_output.mjs';
import { estimateCost } from './cost_estimate.mjs';

const ROOT = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current', 'documents');
const PLAN = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'repair', 'repair-plan.json');
const OUT = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'repair', 'cost-projection.json');

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function walk(dir, name, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, name, files);
    else if (entry.name === name) files.push(full);
  }
  return files;
}

function main() {
  const results = walk(ROOT, 'result.json').map(file => ({ file, result: readJson(file) })).filter(item => item.result?.usage);
  let sourceChars = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  let recordedCost = 0;
  let attempts = 0;
  let chunks = 0;

  for (const item of results) {
    const source = readJson(path.join(path.dirname(item.file), 'source.json'), {});
    const chars = source.combinedChars || 0;
    const usage = item.result.usage;
    sourceChars += chars;
    promptTokens += usage.prompt_tokens || 0;
    completionTokens += usage.completion_tokens || 0;
    recordedCost += estimateCost(usage)?.estimatedUsd || 0;
    attempts += item.result.attempts || 1;
    chunks++;
  }

  const plan = readJson(PLAN, { summary: {} });
  const remainingChars = plan.summary.repairChars || 0;
  const remainingChunks = plan.summary.repairChunks || 0;
  const promptPerChar = sourceChars ? promptTokens / sourceChars : 0;
  const completionPerChar = sourceChars ? completionTokens / sourceChars : 0;
  const meanAttempts = chunks ? attempts / chunks : 1;
  const projectedUsage = {
    prompt_tokens: Math.ceil(remainingChars * promptPerChar * meanAttempts),
    completion_tokens: Math.ceil(remainingChars * completionPerChar * meanAttempts)
  };
  projectedUsage.total_tokens = projectedUsage.prompt_tokens + projectedUsage.completion_tokens;
  const expectedRemaining = estimateCost(projectedUsage)?.estimatedUsd || 0;
  const lowRemaining = expectedRemaining * 0.8;
  const highRemaining = expectedRemaining * 1.5;

  const report = {
    generatedAt: new Date().toISOString(),
    pricing: estimateCost({ prompt_tokens: 0, completion_tokens: 0 })?.rates,
    observed: { chunks, sourceChars, promptTokens, completionTokens, recordedValidatedCostUsd: recordedCost, meanAttemptsPerSuccessfulChunk: meanAttempts },
    remaining: { chunks: remainingChunks, sourceChars: remainingChars, projectedUsage, expectedCostUsd: expectedRemaining, lowCostUsd: lowRemaining, highCostUsd: highRemaining },
    projectedRecordedTotal: { expectedUsd: recordedCost + expectedRemaining, lowUsd: recordedCost + lowRemaining, highUsd: recordedCost + highRemaining },
    warning: 'Recorded validated cost excludes unsuccessful API responses that returned no saved usage, so historical spend may be higher. Remaining estimate is based on measured successful chunk ratios and retry rate.'
  };
  writeJson(OUT, report);
  console.log(JSON.stringify(report, null, 2));
}

main();
