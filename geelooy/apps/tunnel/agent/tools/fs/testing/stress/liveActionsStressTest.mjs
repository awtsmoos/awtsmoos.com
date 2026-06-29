// B"H
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
const here = path.dirname(new URL(import.meta.url).pathname);
const fsTesting = path.resolve(here, '..');
const repo = path.resolve(fsTesting, '../../../../../../');
const tests = [
  path.join(here, 'missionLiveWorkLoopStress.mjs'),
  path.join(here, 'continuousImprovementStress.mjs'),
  path.join(fsTesting, 'action-registry-stress.test.cjs'),
  path.join(fsTesting, 'all-actions-source-stress.test.cjs'),
  path.join(fsTesting, 'connected-files-pagination-stress.test.cjs'),
  path.join(repo, 'testing/tunnelCorrelationStress.test.cjs')
].filter(file => fs.existsSync(file));
const results = [];
for (const file of tests) {
  const started = Date.now();
  const run = spawnSync(process.execPath, [file], { cwd: repo, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  results.push({ file: path.relative(repo, file), ok: run.status === 0, status: run.status, ms: Date.now() - started, stdout: run.stdout.slice(-4000), stderr: run.stderr.slice(-4000) });
  if (run.status !== 0) break;
}
const ok = results.length === tests.length && results.every(r => r.ok);
console.log(JSON.stringify({ ok, suite: 'live-actions-stress', count: results.length, results }, null, 2));
if (!ok) process.exit(1);
