//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file changed-paths.mjs
 * @description Discovers only currently changed source files so untouched legacy debt cannot
 * block unrelated work. The Awtsmoos keeps staged, unstaged, and untracked discovery separate,
 * then joins them without ever mutating the index or working tree.
 */

import { spawnSync } from 'node:child_process';
import { extname, normalize } from 'node:path';
import { SOURCE_EXTENSIONS } from './config.mjs';

/**
 * Executes one read-only Git query and returns nonempty output lines.
 * @param {string} root Canonical repository root.
 * @param {ReadonlyArray<string>} args Git arguments with no mutation commands.
 * @returns {ReadonlyArray<string>} Trimmed path lines emitted by Git.
 */
function gitLines(root, args) {
	const result = spawnSync('git', args, {
		cwd: root,
		encoding: 'utf8'
	});
	if (result.status !== 0) {
		throw new Error(result.stderr.trim() || `git ${args.join(' ')} failed`);
	}
	return result.stdout.split('\n').map(line => line.trim()).filter(Boolean);
}

/**
 * Finds changed source paths without broadening beyond the requested repository scope.
 * @param {string} root Canonical repository root.
 * @param {string} [scope='geelooy/games/'] Repository-relative prefix to govern.
 * @returns {ReadonlyArray<string>} Sorted unique changed source paths.
 */
export function discoverChangedSourcePaths(root, scope = 'geelooy/games/') {
	const paths = [
		...gitLines(root, ['diff', '--name-only', '--diff-filter=ACMR']),
		...gitLines(root, ['diff', '--cached', '--name-only', '--diff-filter=ACMR']),
		...gitLines(root, ['ls-files', '--others', '--exclude-standard'])
	];
	const unique = new Set();
	for (const candidate of paths) {
		const path = normalize(candidate).replaceAll('\\', '/');
		if (!path.startsWith(scope)) {
			continue;
		}
		if (!SOURCE_EXTENSIONS.has(extname(path).toLowerCase())) {
			continue;
		}
		unique.add(path);
	}
	return Object.freeze([...unique].sort());
}
