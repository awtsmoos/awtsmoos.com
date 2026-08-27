// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiPluginSafety.test.mjs
 * @description Proves plugin permission denial, rollback, duplicates, and unsafe-result rejection.
 * The Awtsmoos renews extension and boundary together; Awtsmoos.com verifies failed local
 * code cannot leave a visible plugin, command, exporter, listener, adapter, or executable result.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';
import { moviePluginTestManifest } from './moviePluginTestFixtures.mjs';

test('permission denial and activation failure roll back every partial resource', async () => {
	const { api } = createMovieStudioApiHarness();
	const denied = await api.plugins.registerTrusted(
		moviePluginTestManifest('denied.plugin', ['project.read']),
		{
			activate(context) {
				context.registerCommand('forbidden', () => ({}));
			}
		}
	);
	assert.equal(denied.ok, false);
	assert.equal(denied.error.code, 'MOVIE_PLUGIN_PERMISSION_DENIED');
	assert.equal(api.plugins.list().plugins.length, 0);
	const failed = await api.plugins.registerTrusted(
		moviePluginTestManifest(
			'failed.plugin',
			['runtime.adapters.register']
		),
		{
			activate(context) {
				context.registerRuntimeAdapter({
					capabilities: ['ping'],
					id: 'failed.adapter',
					type: 'test.bridge'
				}, { ping: () => ({ ok: true }) });
				throw new Error('activation failed');
			}
		}
	);
	assert.equal(failed.ok, false);
	assert.equal(api.plugins.list().plugins.length, 0);
	assert.equal(api.plugins.list().resources.commands.length, 0);
	assert.equal(api.runtimeAdapters.list().length, 0);
});

test('duplicates and executable handler results become structured failures', async () => {
	const { api } = createMovieStudioApiHarness();
	const implementation = {
		activate(context) {
			context.registerCommand('unsafe', () => ({ handler() {} }));
		}
	};
	assert.equal((await api.plugins.registerTrusted(
		moviePluginTestManifest(
			'unsafe.plugin',
			['commands.register']
		),
		implementation
	)).ok, true);
	const duplicate = await api.plugins.registerTrusted(
		moviePluginTestManifest(
			'unsafe.plugin',
			['commands.register']
		),
		implementation
	);
	assert.equal(duplicate.ok, false);
	assert.equal(duplicate.error.code, 'DUPLICATE_MOVIE_PLUGIN');
	const unsafe = await api.plugins.execute('unsafe.plugin:unsafe', {});
	assert.equal(unsafe.ok, false);
	assert.equal(typeof unsafe.error.code, 'string');
	assert.equal((await api.plugins.unregisterTrusted('unsafe.plugin')).ok, true);
	const missing = await api.plugins.execute('unsafe.plugin:unsafe', {});
	assert.equal(missing.ok, false);
	assert.equal(missing.error.code, 'MOVIE_PLUGIN_NOT_FOUND');
});

test('ungranted project, event, exporter, command, and adapter powers are denied', async () => {
	const { api } = createMovieStudioApiHarness();
	const calls = [
		context => context.getProject(),
		context => context.executeCommand({ type: 'marker.add' }),
		context => context.subscribe('project:changed', () => {}),
		context => context.registerExporter('x', () => ({})),
		context => context.registerRuntimeAdapter({
			capabilities: ['ping'],
			id: 'denied.adapter',
			type: 'test.bridge'
		}, { ping: () => ({}) })
	];
	for (let index = 0; index < calls.length; index += 1) {
		const result = await api.plugins.registerTrusted(
			moviePluginTestManifest(`denied.power-${index}`, []),
			{ activate: calls[index] }
		);
		assert.equal(result.ok, false);
		assert.equal(result.error.code, 'MOVIE_PLUGIN_PERMISSION_DENIED');
	}
	assert.equal(api.plugins.list().plugins.length, 0);
	assert.equal(api.runtimeAdapters.list().length, 0);
});
