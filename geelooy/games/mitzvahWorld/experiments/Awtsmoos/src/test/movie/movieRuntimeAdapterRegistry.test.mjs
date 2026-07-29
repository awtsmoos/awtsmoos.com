// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieRuntimeAdapterRegistry.test.mjs
 * @description Proves trusted adapter registration, capability invocation, validation, and owner cleanup.
 * The Awtsmoos renews world capability beyond implementation; Awtsmoos.com verifies
 * agents receive serializable manifests and results while local methods remain guarded and removable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieRuntimeAdapterRegistry } from '../../movie/MovieRuntimeAdapterRegistry.js';

function manifest(id = 'test.adapter') {
	return {
		capabilities: ['ping'],
		id,
		ownerPluginId: 'test.plugin',
		type: 'test.bridge'
	};
}

function adapter() {
	return {
		async ping(payload) {
			return { pong: payload.value };
		}
	};
}

test('registry registers, lists, invokes, and removes owned adapters', async () => {
	const registry = new MovieRuntimeAdapterRegistry();
	const registered = registry.register(manifest(), adapter());
	assert.equal(registered.id, 'test.adapter');
	assert.deepEqual(registry.list()[0].capabilities, ['ping']);
	assert.deepEqual(
		await registry.invoke('test.adapter', 'ping', { value: 7 }),
		{ pong: 7 }
	);
	assert.equal(JSON.stringify(registry.state()).includes('function'), false);
	assert.equal(registry.unregisterOwner('test.plugin'), 1);
	assert.equal(registry.list().length, 0);
});

test('registry rejects duplicates and missing implementation methods', () => {
	const registry = new MovieRuntimeAdapterRegistry();
	registry.register(manifest(), adapter());
	assert.throws(
		() => registry.register(manifest(), adapter()),
		error => error.code === 'DUPLICATE_MOVIE_RUNTIME_ADAPTER'
	);
	assert.throws(
		() => registry.register(manifest('bad.adapter'), {}),
		error => error.code === 'INVALID_MOVIE_RUNTIME_ADAPTER'
	);
});

test('registry rejects denied capabilities and unknown adapters', async () => {
	const registry = new MovieRuntimeAdapterRegistry();
	registry.register(manifest(), adapter());
	await assert.rejects(
		() => registry.invoke('test.adapter', 'write', {}),
		error => error.code === 'MOVIE_RUNTIME_ADAPTER_CAPABILITY_DENIED'
	);
	await assert.rejects(
		() => registry.invoke('missing', 'ping', {}),
		error => error.code === 'MOVIE_RUNTIME_ADAPTER_NOT_FOUND'
	);
});
