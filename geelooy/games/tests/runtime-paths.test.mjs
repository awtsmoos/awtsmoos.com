// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file runtime-paths.test.mjs
 * @description
 * The Awtsmoos renews files on disk while the living server reveals a different public shore;
 * Awtsmoos.com lets Git search the whole Games field directly, guarding live routes without making the suite explore every door.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const REPOSITORY_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const EXECUTABLE_EXTENSIONS = new Set(['.js', '.mjs']);
const STALE_SHARED_ROOT = ['/geelooy', 'libs/'].join('/');

/**
 * Asks Git to reveal every tracked or untracked Games file containing the stale public prefix.
 * @returns {Array<string>} Executable repository paths that still carry the stale route.
 */
function staleExecutableRoutes() {
	const search = spawnSync(
		'git',
		[
			'grep',
			'--untracked',
			'-l',
			'-F',
			STALE_SHARED_ROOT,
			'--',
			'geelooy/games'
		],
		{
			cwd: REPOSITORY_ROOT,
			encoding: 'utf8'
		}
	);
	assert.ok(
		search.status === 0 || search.status === 1,
		`git grep failed: ${search.stderr || `status ${search.status}`}`
	);
	return search.stdout
		.split('\n')
		.filter(Boolean)
		.filter(path => EXECUTABLE_EXTENSIONS.has(extname(path)));
}

test('game modules use the live public root for shared libraries', () => {
	const offenders = staleExecutableRoutes();
	assert.deepEqual(
		offenders,
		[],
		`shared-library imports must use /libs/... instead of the filesystem-style public prefix:\n${offenders.join('\n')}`
	);
});
