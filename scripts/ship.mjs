#!/usr/bin/env node
// B"H
/**
 * Ship helper: stages everything, commits if there is anything to commit, then pushes.
 *
 * The repository can become enormous. Before pushing, this helper expands Git's
 * HTTP/post buffers, disables low-speed aborts, retries transient transport
 * failures, and prints useful pack-size diagnostics. It does not hide real Git
 * failures; it only gives large pushes more room to breathe.
 */
import { spawnSync } from 'node:child_process';

const message = process.argv.slice(2).join(' ').trim() || 'B_H automatic update';
const PUSH_RETRIES = Number(process.env.AWTSMOOS_SHIP_PUSH_RETRIES || 3);
const HUGE_HTTP_BUFFER = String(Number(process.env.AWTSMOOS_GIT_HTTP_POST_BUFFER || 1024 * 1024 * 1024));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false, env: pushFriendlyEnv() });
  if (result.status !== 0 && !options.allowFailure) process.exit(result.status ?? 1);
  return result.status ?? 0;
}

function capture(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', shell: false, env: pushFriendlyEnv() });
  if (result.status !== 0 && !options.allowFailure) process.exit(result.status ?? 1);
  return String(result.stdout || '').trim();
}

function pushFriendlyEnv() {
  return {
    ...process.env,
    GIT_HTTP_LOW_SPEED_LIMIT: process.env.GIT_HTTP_LOW_SPEED_LIMIT || '0',
    GIT_HTTP_LOW_SPEED_TIME: process.env.GIT_HTTP_LOW_SPEED_TIME || '999999',
    GIT_TRACE_PACKET: process.env.GIT_TRACE_PACKET || '0',
    GIT_TRACE_PERFORMANCE: process.env.GIT_TRACE_PERFORMANCE || '1',
    GIT_CURL_VERBOSE: process.env.GIT_CURL_VERBOSE || '0'
  };
}

function configureLargePush() {
  const settings = [
    ['http.postBuffer', HUGE_HTTP_BUFFER],
    ['http.lowSpeedLimit', '0'],
    ['http.lowSpeedTime', '999999'],
    ['pack.windowMemory', process.env.AWTSMOOS_GIT_PACK_WINDOW_MEMORY || '256m'],
    ['pack.packSizeLimit', process.env.AWTSMOOS_GIT_PACK_SIZE_LIMIT || '2g'],
    ['core.compression', process.env.AWTSMOOS_GIT_COMPRESSION || '0']
  ];
  for (const [key, value] of settings) run('git', ['config', key, value], { allowFailure: true });
}

function printDiagnostics() {
  console.log('B"H ship diagnostics before push');
  run('git', ['status', '--short'], { allowFailure: true });
  run('git', ['count-objects', '-vH'], { allowFailure: true });
  const branch = capture('git', ['branch', '--show-current'], { allowFailure: true });
  if (branch) console.log(`B"H current branch: ${branch}`);
  const remotes = capture('git', ['remote', '-v'], { allowFailure: true });
  if (remotes) console.log(remotes);
}

function pushWithRetry() {
  const pushArguments = resolvePushArguments();
  for (let attempt = 1; attempt <= PUSH_RETRIES; attempt++) {
    console.log(`B"H git push attempt ${attempt}/${PUSH_RETRIES}`);
    const status = run('git', pushArguments, { allowFailure: true });
    if (status === 0) return;
    if (attempt < PUSH_RETRIES) {
      console.log('B"H push failed; running cleanup/diagnostics before retry.');
      run('git', ['gc', '--auto'], { allowFailure: true });
      run('git', ['count-objects', '-vH'], { allowFailure: true });
    }
  }
  process.exit(1);
}

function resolvePushArguments() {
  const upstream = capture(
    'git',
    ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'],
    { allowFailure: true }
  );
  if (upstream) {
    const separator = upstream.indexOf('/');
    if (separator > 0 && separator < upstream.length - 1) {
      const remote = upstream.slice(0, separator);
      const branch = upstream.slice(separator + 1);
      return ['push', '--progress', remote, `HEAD:${branch}`];
    }
  }

  const branch = capture('git', ['branch', '--show-current'], { allowFailure: true });
  if (!branch) {
    console.error('B"H cannot push a detached HEAD without an explicit upstream.');
    process.exit(1);
  }
  return ['push', '--progress', '--set-upstream', 'origin', `HEAD:${branch}`];
}

configureLargePush();
run('git', ['add', '.']);
const staged = capture('git', ['diff', '--cached', '--name-only']);
if (staged) {
  run('git', ['commit', '-m', message]);
} else {
  console.log('B"H nothing to commit; continuing to push/deploy.');
}
printDiagnostics();
pushWithRetry();
