// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiPlugins.test.mjs
 * @description Proves successful permission-scoped plugin registration, execution, and cleanup.
 * The Awtsmoos renews extension and withdrawal through one source; Awtsmoos.com verifies
 * trusted resources act through declared powers and leave no listener, handler, or adapter behind.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMovieStudioApiHarness,
	sampleMovieProject
} from './movieStudioApiHarness.mjs';
import { moviePluginTestManifest } from './moviePluginTestFixtures.mjs';

test('plugin resources execute and disappear completely on unregister', async () => {
	const { api } = createMovieStudioApiHarness();
	let observed = 0;
	let deactivated = false;
	const registered = await api.plugins.registerTrusted(
		moviePluginTestManifest(),
		{
			activate(context) {
				context.subscribe('project:changed', () => { observed += 1; });
				context.registerCommand('describe', payload => ({
					echo: payload.echo,
					title: context.getProject().title
				}), { label: 'Describe project' });
				context.registerCommand('mark', payload => context.executeCommand({
					payload: { time: payload.time },
					type: 'marker.add'
				}));
				context.registerExporter('snapshot', () => ({
					project: context.getProject()
				}));
				context.registerRuntimeAdapter({
					capabilities: ['ping'],
					id: 'test.plugin-adapter',
					type: 'test.bridge'
				}, {
					ping: payload => ({ pong: payload.value })
				});
			},
			deactivate() { deactivated = true; }
		},
		{ requestId: 'plugin-register' }
	);
	assert.equal(registered.ok, true);
	assert.equal(registered.metadata.requestId, 'plugin-register');
	assert.equal(api.plugins.list().resources.commands.length, 2);
	assert.equal(api.plugins.list().resources.exporters.length, 1);
	const described = await api.plugins.execute(
		'test.plugin:describe',
		{ echo: 'hello' }
	);
	assert.deepEqual(described.value, {
		echo: 'hello',
		title: 'API Harness Movie'
	});
	assert.equal((await api.plugins.execute(
		'test.plugin:mark',
		{ time: 5 }
	)).ok, true);
	assert.equal(api.project.markers[0].time, 5);
	assert.equal((await api.plugins.export(
		'test.plugin:snapshot',
		{}
	)).value.project.title, 'API Harness Movie');
	assert.deepEqual((await api.runtimeAdapters.invoke(
		'test.plugin-adapter',
		'ping',
		{ value: 8 }
	)).value, { pong: 8 });
	assert.ok(observed >= 1);
	const beforeRemoval = observed;
	assert.equal((await api.plugins.unregisterTrusted('test.plugin')).ok, true);
	assert.equal(deactivated, true);
	assert.equal(api.plugins.list().plugins.length, 0);
	assert.equal(api.runtimeAdapters.list().length, 0);
	api.project.replace(sampleMovieProject(), {
		expectedRevision: api.revision
	});
	assert.equal(observed, beforeRemoval);
	assert.equal(JSON.stringify(api).includes('function'), false);
});
