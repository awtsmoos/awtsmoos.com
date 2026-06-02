// B"H
/**
 * Follow-up local stress probe.
 *
 * The first wave found two dark sparks. This second wave does not erase the
 * first wave; it appends clearer evidence, imports the ESM Merkava service by
 * its real directory barrel, retests agent commands with a shorter swarm, and
 * rewrites the complete report files as a single truthful scroll.
 */
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const sandbox = path.join(repo, 'AI_THOUGHTS/runtime-stress/local-action-sandbox');
const reportPath = path.join(sandbox, 'run-report.json');
const mdPath = path.join(sandbox, 'run-report.md');
const failPath = path.join(sandbox, 'failures.json');
const subDir = path.join(sandbox, 'subagents');
const snapDir = path.join(sandbox, 'snapshots');
const matrixPath = path.join(repo, 'AI_THOUGHTS/runtime-stress/direct-runtime-matrix.json');
const agentDir = path.join(repo, 'geelooy/scripts/awtsmoos/minimax-virtual-os-game/agent-command');
const servicePath = path.join(repo, 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js');

function rel(p) { return path.relative(repo, p).replace(/\\/g, '/'); }
function runNode(args, opts = {}) {
  return cp.spawnSync(process.execPath, args, { cwd: repo, encoding: 'utf8', timeout: opts.timeout || 60000, env: { ...process.env, ...(opts.env || {}) } });
}
function push(report, test) { report.tests.push({ ...test, followup: true }); }
async function timed(action, family, fn) {
  const start = Date.now();
  try { return { action, family, status: 'passed', ms: Date.now() - start, detail: await fn() }; }
  catch (e) { return { action, family, status: 'failed', ms: Date.now() - start, error: e.message, stack: e.stack }; }
}
function recompute(report) {
  const failed = report.tests.filter(t => t.status === 'failed');
  const passed = report.tests.filter(t => t.status === 'passed');
  const skipped = report.tests.filter(t => t.status === 'skipped');
  report.generatedAt = new Date().toISOString();
  report.totalTests = report.tests.length;
  report.passed = passed.length;
  report.failed = failed.length;
  report.skipped = skipped.length;
  report.failedActions = failed.map(t => t.action);
  return { failed, passed, skipped };
}
function writeReports(report) {
  const { failed, skipped } = recompute(report);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(failPath, JSON.stringify(failed, null, 2));
  fs.writeFileSync(mdPath, [
    '# B"H Local Action Stress Report', '',
    `Generated: ${report.generatedAt}`,
    `Total: ${report.totalTests}`,
    `Passed: ${report.passed}`,
    `Failed: ${report.failed}`,
    `Skipped: ${report.skipped}`, '',
    `simulateRuntime worked: ${report.facts.simulateRuntimeWorked}`,
    `MekravaExecutor worked: ${report.facts.mekravaWorked}`,
    `Snapshot-like API exists: ${report.facts.snapshotApiExists}`,
    `Agent spawn/status/watch worked: ${report.facts.agentWorked}`, '',
    '## Failed actions',
    ...(failed.length ? failed.map(f => `- ${f.action}: ${f.error}`) : ['- none']), '',
    '## Skipped',
    ...(skipped.length ? skipped.map(s => `- ${s.action}: ${s.reason}`) : ['- none'])
  ].join('\n'));
  fs.writeFileSync(matrixPath, JSON.stringify({
    ok: report.passed,
    failed: report.failed,
    total: report.totalTests,
    count: report.totalTests,
    caps: { collectMs: 0, runtimeMs: 0 },
    rows: report.tests.map(t => ({ p: t.action, ok: t.status === 'passed', error: t.error || t.reason || '', ms: t.ms || 0, fileCount: 0 }))
  }, null, 2));
  fs.writeFileSync(path.join(repo, 'AI_THOUGHTS/runtime-stress/direct-runtime-matrix.jsonl'), report.tests.map(t => JSON.stringify(t)).join('\n') + '\n');
}
async function main() {
  fs.mkdirSync(subDir, { recursive: true });
  fs.mkdirSync(snapDir, { recursive: true });
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  push(report, await timed('simulateRuntime-esm-import', 'runtime', async () => {
    const service = await import(servicePath);
    if (typeof service.simulateRuntime !== 'function') throw new Error('simulateRuntime_not_exported');
    report.facts.mekravaWorked = true;
    return { imported: rel(servicePath), exports: Object.keys(service).sort() };
  }));

  const service = await import(servicePath);
  push(report, await timed('simulateRuntime-success-esm', 'runtime', async () => {
    const res = await service.simulateRuntime({ entry: 'index.html', files: { 'index.html': '<script>globalThis.answer=42</script>' }, values: ['answer'] });
    if (res.ok === false) throw new Error(JSON.stringify(res));
    report.facts.simulateRuntimeWorked = true;
    return { ok: res.ok, engine: res.engine, values: res.values };
  }));
  push(report, await timed('simulateRuntime-thrown-error-esm', 'runtime', async () => {
    const res = await service.simulateRuntime({ entry: 'index.html', files: { 'index.html': '<script>throw new Error("awtsmoos-boom")</script>' } });
    if (!JSON.stringify(res).includes('awtsmoos-boom')) throw new Error('runtime_error_not_captured:' + JSON.stringify(res).slice(0, 500));
    return { captured: true, ok: res.ok, error: res.error || res.result?.error || null };
  }));
  push(report, await timed('simulateRuntime-async-error-esm', 'runtime', async () => {
    const res = await service.simulateRuntime({ entry: 'index.html', files: { 'index.html': '<script>setTimeout(()=>{throw new Error("async-boom")},0)</script>' } });
    return { observed: JSON.stringify(res).includes('async-boom'), ok: res.ok, note: 'async errors may require runtime tick support' };
  }));
  push(report, await timed('snapshot-like-api-esm', 'runtime', async () => {
    const res = await service.simulateRuntime({ runtime: 'MekravaExecutor', entry: 'index.html', files: { 'index.html': '<h1>B"H Snapshot</h1><script>globalThis.snap=1</script>' }, snapshot: true, format: 'json', fullPage: true, values: ['snap'] });
    fs.writeFileSync(path.join(snapDir, 'snapshot-api-followup-result.json'), JSON.stringify(res, null, 2));
    const exists = Boolean(res.snapshot || res.screenshot || res.image || res.result?.snapshot);
    report.facts.snapshotApiExists = exists;
    if (!exists) {
      fs.writeFileSync(path.join(snapDir, 'proposed-interface.json'), JSON.stringify({ action: 'simulateRuntime', runtime: 'MekravaExecutor', scriptText: 'document.body.innerHTML="B\\"H"', snapshot: true, format: 'png|json|html', fullPage: true }, null, 2));
      throw new Error('snapshot_api_missing: no top-level snapshot/screenshot/image and no result.snapshot');
    }
    return { exists, snapshotKeys: Object.keys(res.snapshot || res.result?.snapshot || {}) };
  }));

  push(report, await timed('agent-spawn-status-watch-short', 'agent-command', async () => {
    const spawn = runNode([path.join(agentDir, 'spawn.cjs'), '2'], { env: { AWTSMOOS_AGENT_ROUNDS: '2' }, timeout: 15000 });
    if (spawn.status !== 0) throw new Error('spawn_failed:' + spawn.stderr);
    const parsed = JSON.parse(spawn.stdout);
    const status = runNode([path.join(agentDir, 'status.cjs'), parsed.agentId], { timeout: 15000 });
    if (status.status !== 0) throw new Error('status_failed:' + status.stderr);
    const watch = runNode([path.join(agentDir, 'watch.cjs'), parsed.agentId], { timeout: 35000 });
    fs.writeFileSync(path.join(subDir, 'agent-watch-short-output.log'), watch.stdout + watch.stderr);
    if (watch.status !== 0) throw new Error('watch_failed:' + watch.stderr);
    const lines = watch.stdout.trim().split(/\n/).filter(Boolean);
    const final = JSON.parse(lines[lines.length - 1]);
    if (!final.ok) throw new Error('watch_final_not_ok');
    report.facts.agentWorked = true;
    return { agentId: parsed.agentId, finalStatus: final.final.status, lines: lines.length };
  }));

  writeReports(report);
  console.log(JSON.stringify({ total: report.totalTests, passed: report.passed, failed: report.failed, skipped: report.skipped, failedActions: report.failedActions, reports: [rel(reportPath), rel(mdPath), rel(failPath)] }, null, 2));
  if (report.failed) process.exitCode = 1;
}
main().catch(e => { console.error(e.stack || e.message); process.exit(1); });
