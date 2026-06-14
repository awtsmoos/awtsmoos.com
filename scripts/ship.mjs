#!/usr/bin/env node
// B"H
/**
 * Ship helper: stages everything, commits with the provided message, then pushes.
 * It avoids fragile shell quoting so npm can pass any normal commit message.
 */
import { spawnSync } from 'node:child_process';

const message = process.argv.slice(2).join(' ').trim() || 'B_H automatic update';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('git', ['add', '.']);
run('git', ['commit', '-m', message]);
run('git', ['push']);
