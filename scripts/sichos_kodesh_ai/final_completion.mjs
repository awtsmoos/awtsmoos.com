// B"H
/** Converge the repair pipeline until empty, fatal pause, budget gate, or proven stagnation. */
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { DEFAULT_OUTPUT_ROOT, writeJson } from './save_output.mjs';

const options = Object.fromEntries(process.argv.slice(2).filter(x => x.startsWith('--') && x.includes('=')).map(x => x.slice(2).split('=')));
const workers = Math.max(1, Number(options.workers || 80));
const retries = Math.max(0, Number(options.retries || 3));
const model = options.model || 'deepseek-chat';
const maxPasses = Math.max(1, Number(options['max-passes'] || 4));
const maxExpectedCost = Math.max(0, Number(options['max-expected-cost'] || 2.6));
const root = path.join(DEFAULT_OUTPUT_ROOT, 'corpus-runs', 'current');
const repairDir = path.join(DEFAULT_OUTPUT_ROOT, 'logs', 'repair');
const statusFile = path.join(repairDir, 'final-completion-status.json');

function read(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function run(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [`scripts/sichos_kodesh_ai/${script}`, ...args], {
      cwd: process.cwd(), stdio: 'inherit', env: process.env
    });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`)));
  });
}

async function refresh() {
  await run('footnote_free_salvage.mjs');
  await run('mechanical_salvage.mjs');
  await run('repair_plan.mjs');
  await run('cost_projection.mjs');
  return {
    plan: read(path.join(repairDir, 'repair-plan.json'), { summary: {} }),
    cost: read(path.join(repairDir, 'cost-projection.json'), { remaining: {} }),
    state: read(path.join(root, 'swarm-state.json'), {})
  };
}

async function main() {
  fs.mkdirSync(repairDir, { recursive: true });
  const history = [];
  let stagnant = 0;
  let previous = null;
  for (let pass = 1; pass <= maxPasses; pass++) {
    const before = await refresh();
    const chunks = before.plan.summary?.repairChunks || 0;
    const expected = before.cost.remaining?.expectedCostUsd || 0;
    history.push({ pass, phase: 'before', chunks, expectedCostUsd: expected, at: new Date().toISOString() });
    if (!chunks) break;
    if (before.state.paused) throw new Error(`Provider paused: ${before.state.pauseReason || 'unknown'}`);
    if (expected > maxExpectedCost) throw new Error(`Cost gate: expected $${expected.toFixed(4)} exceeds $${maxExpectedCost.toFixed(2)}`);
    await run('run_repair.mjs', [`--workers=${workers}`, `--retries=${retries}`, `--model=${model}`]);
    const after = await refresh();
    const remaining = after.plan.summary?.repairChunks || 0;
    history.push({ pass, phase: 'after', chunks: remaining, at: new Date().toISOString() });
    stagnant = previous === remaining || remaining >= chunks ? stagnant + 1 : 0;
    previous = remaining;
    if (!remaining || after.state.paused || stagnant >= 2) break;
  }
  await run('completion_audit.mjs');
  const finalPlan = read(path.join(repairDir, 'repair-plan.json'), { summary: {} });
  const finalState = read(path.join(root, 'swarm-state.json'), {});
  writeJson(statusFile, {
    generatedAt: new Date().toISOString(), workers, retries, model, maxPasses,
    maxExpectedCost, repairChunks: finalPlan.summary?.repairChunks || 0,
    completedDocuments: finalPlan.summary?.completedDocuments || 0,
    paused: Boolean(finalState.paused), pauseReason: finalState.pauseReason || null,
    history
  });
}

main().catch(async error => {
  writeJson(statusFile, { generatedAt: new Date().toISOString(), status: 'stopped', error: error.message });
  try { await run('completion_audit.mjs'); } catch {}
  console.error(error.stack || String(error));
  process.exit(1);
});
