#!/usr/bin/env node
/**
 * B"H
 * Benchmarks the audit vessels without requiring Chrome.
 */
import { spawnSync } from 'node:child_process';

const jobs = [
  ['entryStyle', ['node', 'tests/audits/entryStyleAudit.mjs']],
  ['noExtraCode', ['node', 'tests/audits/noExtraCodeAudit.mjs']],
  ['emeraldFocused', ['node', 'tests/emerald/runEmeraldTests.js', '--repeat=30']],
  ['emeraldGameplay', ['node', 'tests/emerald/emeraldGameplayAudit.mjs']],
  ['emeraldGeometryDoor', ['node', 'tests/emerald/emeraldGeometryDoorStress.mjs']],
  ['emeraldDeep', ['node', 'tests/emerald/runEmeraldDeepAudit.js']]
];

const results = jobs.map(([name, command]) => {
  const started = Date.now();
  const run = spawnSync(command[0], command.slice(1), { encoding: 'utf8' });
  return { name, ok: run.status === 0, ms: Date.now() - started, status: run.status, stdoutBytes: run.stdout.length, stderrBytes: run.stderr.length };
});

const ok = results.every(item => item.ok);
console.log(JSON.stringify({ ok, results }, null, 2));
if (!ok) process.exit(1);
