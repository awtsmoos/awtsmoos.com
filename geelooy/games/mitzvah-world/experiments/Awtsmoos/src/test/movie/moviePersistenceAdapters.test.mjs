// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePersistenceAdapters.test.mjs
 * @description Proves detached memory/local adapters, sorted listing, removal, selection, and registry safety.
 * The Awtsmoos renews memory beyond medium; Awtsmoos.com verifies each trusted adapter
 * stores only canonical record text while agents discover manifests without implementation functions.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieLocalStoragePersistenceAdapter } from '../../movie/MovieLocalStoragePersistenceAdapter.js';
import { MovieMemoryPersistenceAdapter } from '../../movie/MovieMemoryPersistenceAdapter.js';
import { MoviePersistenceRegistry } from '../../movie/MoviePersistenceRegistry.js';
import { createMoviePersistenceRecord } from '../../movie/MoviePersistenceRecord.js';
import { sampleMovieProject } from './movieStudioApiHarness.mjs';

function record(key, title = key) {
	const project = sampleMovieProject();
	project.title = title;
	return createMoviePersistenceRecord(project, {}, {
		key,
		revision: 3,
		savedAt: '2026-07-28T00:00:00.000Z'
	});
}

test('memory adapter saves detached records, lists, loads, and removes', async () => {
	const adapter = new MovieMemoryPersistenceAdapter('test-memory');
	const source = structuredClone(record('b', 'Second'));
	await adapter.save(source);
	source.project.project.title = 'Mutated outside adapter';
	await adapter.save(record('a', 'First'));
	const list = await adapter.list();
	assert.deepEqual(list.map(item => item.key), ['a', 'b']);
	assert.equal((await adapter.load('b')).project.project.title, 'Second');
	assert.equal(await adapter.remove('a'), true);
	assert.equal((await adapter.list()).length, 1);
	await assert.rejects(
		() => adapter.load('missing'),
		error => error.code === 'MOVIE_PERSISTENCE_RECORD_NOT_FOUND'
	);
});

test('local-storage adapter uses namespace and detached verified loads', async () => {
	const storage = fakeStorage();
	const adapter = new MovieLocalStoragePersistenceAdapter({
		id: 'local-test',
		prefix: 'movie.',
		storage
	});
	await adapter.save(record('space key', 'Stored'));
	assert.equal(storage.length, 1);
	assert.match(storage.key(0), /^movie\./);
	assert.equal((await adapter.load('space key')).project.project.title, 'Stored');
	assert.equal((await adapter.list())[0].key, 'space key');
	assert.equal(await adapter.remove('space key'), true);
	assert.equal(storage.length, 0);
});

test('unavailable local storage is a coded failure', async () => {
	const adapter = new MovieLocalStoragePersistenceAdapter({
		id: 'unavailable',
		storage: null
	});
	await assert.rejects(
		() => adapter.list(),
		error => error.code === 'MOVIE_LOCAL_STORAGE_UNAVAILABLE'
	);
});

test('registry exposes manifests, selects, unregisters, and rejects invalid adapters', () => {
	const registry = new MoviePersistenceRegistry();
	const adapter = new MovieMemoryPersistenceAdapter('memory-one');
	registry.register({ id: 'one', persistent: false }, adapter);
	registry.register({ id: 'two', persistent: false }, new MovieMemoryPersistenceAdapter('two'));
	assert.equal(registry.state().activeId, 'one');
	assert.equal(registry.select('two').activeId, 'two');
	assert.equal(registry.get(), registry.get('two'));
	assert.deepEqual(registry.list().map(item => item.id), ['one', 'two']);
	assert.equal(registry.unregister('two'), true);
	assert.equal(registry.state().activeId, 'one');
	assert.throws(
		() => registry.register({ id: 'one' }, adapter),
		error => error.code === 'DUPLICATE_MOVIE_PERSISTENCE_ADAPTER'
	);
	assert.throws(
		() => registry.register({ id: 'bad' }, {}),
		error => error.code === 'INVALID_MOVIE_PERSISTENCE_ADAPTER'
	);
});

function fakeStorage() {
	const values = new Map();
	return {
		get length() { return values.size; },
		getItem: key => values.get(key) || null,
		key: index => [...values.keys()][index] || null,
		removeItem: key => values.delete(key),
		setItem: (key, value) => values.set(key, String(value))
	};
}
