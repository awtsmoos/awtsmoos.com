#!/usr/bin/env node
// B"H
/**
 * Ship helper: stages everything, commits if there is anything to commit, then pushes.
 * If the tree is already clean it still succeeds, so deploy scripts can continue.
 */
import { spawnSync } from 'node:child_process';

const message = process.argv.slice(2).join(' ').trim() || 'B_H automatic update';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0 && !options.allowFailure) process.exit(result.status ?? 1);
  return result.status ?? 0;
}

function capture(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
  return result.stdout.trim();
}

run('git', ['add', '.']);
const staged = capture('git', ['diff', '--cached', '--name-only']);
if (staged) {
  run('git', ['commit', '-m', message]);
} else {
  console.log('B"H nothing to commit; continuing to push/deploy.');
}
run('git', ['push']);
