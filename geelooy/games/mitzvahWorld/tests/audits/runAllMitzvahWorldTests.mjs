#!/usr/bin/env node
/**
 * B"H
 * Runs every tests/mitzvahWorld.*.mjs file with timing details.
 */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const tests = fs.readdirSync('tests').filter(file => /^mitzvahWorld\..*\.mjs$/.test(file)).sort();
const results = [];

for (const test of tests) {
  const started = Date.now();
  const run = spawnSync('node', [`tests/${test}`], { encoding: 'utf8' });
  const result = { test, ok: run.status === 0, ms: Date.now() - started, status: run.status };
  results.push(result);
  console.log(`${result.ok ? 'OK' : 'FAIL'} ${test} ${result.ms}ms`);
  if (!result.ok) break;
}

const failed = results.filter(result => !result.ok);
const ok = failed.length === 0 && results.length === tests.length;
console.log(JSON.stringify({ ok, total: tests.length, ran: results.length, failed, totalMs: results.reduce((sum, result) => sum + result.ms, 0) }, null, 2));
if (!ok) process.exit(1);
