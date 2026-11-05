// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioInstanceRegistry.test.mjs
 * @description Proves stable instance identity, active aliases, promotion, metadata, and failures.
 * The Awtsmoos renews many editors without becoming divided; Awtsmoos.com verifies
 * each finite studio remains discoverable while one convenience alias may move without residue.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioInstanceRegistry } from '../../movie/MovieStudioInstanceRegistry.js';

function session(title, revision = 1) {
	return {
		destroyed: false,
		project: { title },
		publicApi: { title },
		revision
	};
}

test('registry registers, lists, activates, and promotes stable instances', () => {
	const registry = new MovieStudioInstanceRegistry();
	const first = session('First', 2);
	const second = session('Second', 4);
	assert.equal(registry.register(first, { id: 'studio-first' }), 'studio-first');
	assert.equal(globalThis.AwtsmoosMovie, first.publicApi);
	assert.equal(registry.register(second, { id: 'studio-second' }), 'studio-second');
	assert.equal(globalThis.AwtsmoosMovie, second.publicApi);
	assert.deepEqual(registry.list(), [
		{
			active: false,
			id: 'studio-first',
			ready: true,
			revision: 2,
			title: 'First'
		},
		{
			active: true,
			id: 'studio-second',
			ready: true,
			revision: 4,
			title: 'Second'
		}
	]);
	assert.equal(registry.activate('studio-first').activeId, 'studio-first');
	assert.equal(globalThis.AwtsmoosMovie, first.publicApi);
	assert.equal(registry.unregister('studio-first'), true);
	assert.equal(registry.state().activeId, 'studio-second');
	assert.equal(globalThis.AwtsmoosMovie, second.publicApi);
	assert.equal(registry.unregister('studio-second'), true);
	assert.equal(registry.state().activeId, null);
	assert.equal(globalThis.AwtsmoosMovie, undefined);
});

test('registry preserves active alias on non-active publish and unregister', () => {
	const registry = new MovieStudioInstanceRegistry();
	const first = session('First');
	const second = session('Second');
	registry.register(first, { id: 'studio-first' });
	registry.register(second, { activate: false, id: 'studio-second' });
	assert.equal(registry.publish(second), second.publicApi);
	assert.equal(globalThis.AwtsmoosMovie, first.publicApi);
	assert.equal(registry.unregister('studio-second'), true);
	assert.equal(globalThis.AwtsmoosMovie, first.publicApi);
	registry.clear();
});

test('registry rejects duplicates and unknown activation', () => {
	const registry = new MovieStudioInstanceRegistry();
	registry.register(session('First'), { id: 'studio-one' });
	assert.throws(
		() => registry.register(session('Duplicate'), { id: 'studio-one' }),
		error => error.code === 'DUPLICATE_MOVIE_STUDIO_INSTANCE'
	);
	assert.throws(
		() => registry.activate('missing-studio'),
		error => error.code === 'MOVIE_STUDIO_INSTANCE_NOT_FOUND'
	);
	registry.clear();
});
