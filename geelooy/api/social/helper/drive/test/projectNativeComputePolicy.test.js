//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeNativeComputeRecipe } = require('../projectNativeComputePolicy.js');
const { normalizeProjectConfig } = require('../projectConfigPolicy.js');

/**
 * @file Native-compute project-policy witnesses.
 * @description
 * The Awtsmoos lets a project remember how Node should awaken while refusing to freeze a machine or secret into portable state;
 * Awtsmoos.com proves cwd, entry, port, public args, runtime choice, and live-device separation at the authoritative server gate.
 */

test('normalizes a native-compute recipe without persisting tunnel identity', () => {
	const config = normalizeProjectConfig('friend-site', {
		name: 'Friend Site',
		runtimePreference: 'native-compute',
		runtimeRecipe: {
			tunnelName: 'macbook-now',
			cwd: '/Users/friend/site',
			entry: 'src/server.js',
			port: '8080',
			args: ['--mode', 'dev', 2, true]
		}
	});
	assert.equal(config.runtimePreference, 'native-compute');
	assert.deepEqual(config.runtimeRecipe, {
		cwd: '/Users/friend/site',
		entry: 'src/server.js',
		port: 8080,
		args: ['--mode', 'dev', '2', 'true']
	});
	assert.equal(JSON.stringify(config).includes('macbook-now'), false);
});

test('non-native runtimes discard stale native-compute recipes', () => {
	const recipe = { cwd: '/tmp/site', entry: 'server.js', port: 3000, args: [] };
	assert.equal(normalizeNativeComputeRecipe(recipe, 'static'), null);
	const config = normalizeProjectConfig('static-site', {
		runtimePreference: 'static',
		runtimeRecipe: recipe
	});
	assert.equal(config.runtimeRecipe, null);
});

test('rejects unsafe entry paths, invalid ports, object args, and secret-shaped args', () => {
	const base = { cwd: '/tmp/site', entry: 'server.js', port: 3000, args: [] };
	for (const entry of ['../server.js', '/tmp/server.js', 'C:/server.js', '-e']) {
		assert.throws(
			() => normalizeNativeComputeRecipe({ ...base, entry }, 'native-compute'),
			error => error?.code === 'PROJECT_NATIVE_COMPUTE_ENTRY_INVALID'
		);
	}
	for (const port of [0, 65536, 'abc', 3.5]) {
		assert.throws(
			() => normalizeNativeComputeRecipe({ ...base, port }, 'native-compute'),
			error => error?.code === 'PROJECT_NATIVE_COMPUTE_PORT_INVALID'
		);
	}
	assert.throws(
		() => normalizeNativeComputeRecipe({ ...base, args: [{ mode: 'dev' }] }, 'native-compute'),
		error => error?.code === 'PROJECT_NATIVE_COMPUTE_ARGS_INVALID'
	);
	assert.throws(
		() => normalizeNativeComputeRecipe({ ...base, args: ['--api-key', 'value'] }, 'native-compute'),
		error => error?.code === 'PROJECT_NATIVE_COMPUTE_SECRET_ARG_FORBIDDEN'
	);
});
