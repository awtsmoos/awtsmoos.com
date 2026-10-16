//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const source = path.resolve(import.meta.dirname, '../unix-install-progress.sh');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-progress-'));
const script = `source "${source}"; install_intro full; install_begin_step 1 3 'Verify package' 'Preserve identity' 0 50; install_progress 20 'Checking bundle'; install_progress 42 'SHA-256 verified'; install_finish_step 'Verified'; install_begin_step 2 3 'Prove registration' 'Keep predecessor available' 50 90; install_progress 70 'Registration fresh'; finish_install_progress_line`;
function run(env = {}) {
  return spawnSync('bash', ['-c', script], { encoding: 'utf8', env: { ...process.env, AWTSMOOS_INSTALL_PROGRESS_FILE: path.join(root, 'progress-' + String(Object.keys(env).length)), TERM: 'xterm-256color', LANG: 'en_US.UTF-8', ...env } });
}
test('redirected installer output is clean, complete and line-oriented', () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /Verify package/);
  assert.match(result.stderr, /\[ 42%\] step 1\/3 SHA-256 verified/);
  assert.match(result.stderr, /\[ 70%\] step 2\/3 Registration fresh/);
  assert.equal(result.stderr.includes('\x1b'), false, 'ANSI escapes must not reach a pipe');
  assert.equal(result.stderr.includes('\r'), false, 'no CR redraw in CI logs');
});
test('NO_COLOR and dumb terminals do not introduce ANSI sequences', () => {
  for (const env of [{ NO_COLOR: '1' }, { TERM: 'dumb' }]) {
    const result = run(env);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr.includes('\x1b'), false);
  }
});
test('interactive terminal receives a bounded, colored progress display', { skip: process.platform !== 'darwin' }, () => {
  const result = spawnSync('script', ['-q', '/dev/null', '/bin/bash', '-c', `export TERM=xterm-256color LANG=en_US.UTF-8 AWTSMOOS_INSTALL_PROGRESS_FILE="${path.join(root, 'pty')}"; ${script}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\x1b\[2K/);
  assert.match(result.stdout, /42%/);
  assert.match(result.stdout, /Registration fresh/);
});
process.on('exit', () => fs.rmSync(root, { recursive: true, force: true }));
