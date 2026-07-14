// B"H
// Boruch Hashem
// Blessed is He
/** @module WriteReleaseInventory @description Prints the current worktree as train-aware JSON evidence. */
import { execFileSync } from 'node:child_process';
import { buildReleaseInventory } from './releaseInventory.mjs';

const root = process.argv[2] || process.cwd();
const status = execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
	cwd: root,
	encoding: 'utf8',
	maxBuffer: 64 * 1024 * 1024
});
const head = execFileSync('git', ['rev-parse', 'HEAD'], {
	cwd: root,
	encoding: 'utf8'
}).trim();
const inventory = buildReleaseInventory(status, { head });
process.stdout.write(`${JSON.stringify(inventory, null, 2)}\n`);
