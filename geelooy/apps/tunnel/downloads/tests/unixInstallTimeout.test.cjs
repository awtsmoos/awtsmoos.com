#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

// run_with_timeout on macOS has no GNU timeout, so it uses a portable
// fallback. The old fallback parked a watcher subshell and waited on it —
// on the old bash macOS ships, the subshell defers the kill while its
// sleep child runs, so a fast command still cost the full 15s and the
// installer sat on the install lock past its own no-progress budget.
// The fallback now polls the child with kill -0 and returns the moment
// it exits, on any bash.
const assert = require('node:assert');
const { test } = require('node:test');
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const errorsFile = path.join(__dirname, '..', 'unix-install-errors.sh');
const progressFile = path.join(__dirname, '..', 'unix-install-progress.sh');
const lockFile = path.join(__dirname, '..', 'unix-install-lock.sh');
const ownerFile = path.join(__dirname, '..', 'unix-install-lock-owner.cjs');

function runFallback(script) {
  // A bin dir with sleep but deliberately NO timeout, so the portable
  // fallback runs even on this Linux box.
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-no-timeout-'));
  for (const name of ['sleep']) {
    fs.symlinkSync(`/usr/bin/${name}`, path.join(bin, name));
  }
  const wrapped = `export PATH='${bin}'\n. '${progressFile}'\n. '${errorsFile}'\n${script}`;
  return new Promise((resolve, reject) => {
    execFile('bash', ['-c', wrapped], (error, stdout, stderr) => {
      fs.rmSync(bin, { recursive: true, force: true });
      if (error && error.code === undefined) return reject(error);
      resolve({ code: error ? error.code : 0, stdout, stderr });
    });
  });
}

test('a fast command returns at once through the portable fallback, not after the timeout', async () => {
  const r = await runFallback([
    'START=$SECONDS',
    'run_with_timeout 15 "fast" -- true',
    'echo "fast rc=$? elapsed=$((SECONDS-START))"',
  ].join('\n'));
  assert.match(r.stdout, /fast rc=0 elapsed=[012]/);
}, { timeout: 10000 });

test('a slow command is killed at the timeout through the portable fallback', async () => {
  const r = await runFallback([
    'START=$SECONDS',
    'run_with_timeout 2 "slow" -- sleep 10',
    'echo "slow rc=$? elapsed=$((SECONDS-START))"',
  ].join('\n'));
  assert.match(r.stdout, /slow rc=124 elapsed=[234]/);
}, { timeout: 10000 });

test('the lock checks are bounded short and the owner ps call cannot hang', () => {
  const errors = fs.readFileSync(errorsFile, 'utf8');
  assert.match(errors, /kill -0 "\$pid"/);
  assert.ok(!errors.includes('wait "$watcher"'), 'watcher subshell wait must be gone');
  const lock = fs.readFileSync(lockFile, 'utf8');
  assert.match(lock, /run_with_timeout 5 "install lock owner check"/);
  assert.match(lock, /run_with_timeout 5 "install lock release"/);
  assert.match(lock, /Claiming the install lock \(waiting /);
  const owner = fs.readFileSync(ownerFile, 'utf8');
  assert.match(owner, /timeout: 3000/);
});
