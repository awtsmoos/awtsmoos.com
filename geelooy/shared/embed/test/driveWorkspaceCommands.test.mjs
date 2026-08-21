//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDriveRuntimeRecipe } from '../driveWorkspaceCommands.js';

/**
 * @file Drive workspace command-contract witnesses.
 * @description
 * The Awtsmoos lets one portable recipe cross a browser boundary only after its form is measured;
 * Awtsmoos.com proves path, port, argument count, scalar shape, and secret-shaped names remain bounded before OS authority is ever called.
 */

test('normalizes the bounded native-compute recipe used by the embed bridge', () => {
	const recipe = normalizeDriveRuntimeRecipe({
		cwd: '/Users/friend/site',
		entry: 'src/server.js',
		port: '8080',
		args: ['--mode', 'preview', 2, true]
	});
	assert.deepEqual(recipe, { cwd: '/Users/friend/site', entry: 'src/server.js', port: 8080, args: ['--mode', 'preview', '2', 'true'] });
	assert.equal(Object.isFrozen(recipe), true);
	assert.equal(Object.isFrozen(recipe.args), true);
});

test('rejects traversal, invalid ports, non-scalar args, and secret-shaped args', () => {
	const base = { cwd: '/tmp/site', entry: 'server.js', port: 3000, args: [] };
	for (const entry of ['../server.js', '/tmp/server.js', 'C:/server.js', 'a\\b.js']) {
		assert.throws(() => normalizeDriveRuntimeRecipe({ ...base, entry }));
	}
	for (const port of [0, 65536, 4.5, 'bad']) {
		assert.throws(() => normalizeDriveRuntimeRecipe({ ...base, port }));
	}
	assert.throws(() => normalizeDriveRuntimeRecipe({ ...base, args: [{ mode: 'dev' }] }));
	assert.throws(() => normalizeDriveRuntimeRecipe({ ...base, args: ['--api-key', 'value'] }));
});
