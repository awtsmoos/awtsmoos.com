// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiRuntimeAdapters.test.mjs
 * @description Proves stable API adapter lifecycle, serializable events, and unsafe-result rejection.
 * The Awtsmoos renews world capability beyond implementation; Awtsmoos.com verifies
 * structured operations expose only immutable manifests and canonical finite results.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

function manifest(id = 'api.adapter', capability = 'ping') {
	return {
		capabilities: [capability],
		id,
		ownerPluginId: 'test.plugin',
		type: 'test.bridge'
	};
}

test('stable API wraps adapter lifecycle and invocation in serializable events', async () => {
	const { api } = createMovieStudioApiHarness();
	const events = [];
	api.events.on('*', event => events.push(event));
	const registered = api.runtimeAdapters.registerTrusted(
		manifest(),
		{
			async ping(payload) {
				return { pong: payload.value };
			}
		},
		{ requestId: 'adapter-register' }
	);
	assert.equal(registered.ok, true);
	assert.equal(registered.metadata.requestId, 'adapter-register');
	const invoked = await api.runtimeAdapters.invoke(
		'api.adapter',
		'ping',
		{ value: 'alive' },
		{ requestId: 'adapter-invoke' }
	);
	assert.equal(invoked.ok, true);
	assert.deepEqual(invoked.value, { pong: 'alive' });
	const removed = api.runtimeAdapters.unregisterTrusted('api.adapter');
	assert.equal(removed.ok, true);
	assert.equal(removed.value.removed, true);
	assert.deepEqual(events.map(event => event.type), [
		'runtimeAdapter:registered',
		'runtimeAdapter:invoked',
		'runtimeAdapter:unregistered'
	]);
	assert.doesNotThrow(() => JSON.stringify(api.runtimeAdapters.state()));
});

test('adapter result containing executable values becomes structured failure', async () => {
	const { api } = createMovieStudioApiHarness();
	api.runtimeAdapters.registerTrusted(
		manifest('unsafe.adapter', 'unsafe'),
		{
			unsafe() {
				return { handler() {} };
			}
		}
	);
	const result = await api.runtimeAdapters.invoke(
		'unsafe.adapter',
		'unsafe',
		{}
	);
	assert.equal(result.ok, false);
	assert.equal(typeof result.error.code, 'string');
});
