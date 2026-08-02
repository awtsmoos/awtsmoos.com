// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	invokeMovieStudioApiMethod,
	listMovieStudioApiMethods
} from '../../movie/MovieStudioApiMethodInventory.js';

test('method inventory discovers callable leaves without touching getters or cycles', () => {
	let getterReads = 0;
	const api = { commands: { list: () => ['one'] }, unsafe: { erase: () => true } };
	api.self = api;
	Object.defineProperty(api, 'revision', { get: () => { getterReads += 1; return 1; } });
	const safe = listMovieStudioApiMethods(api);
	const all = listMovieStudioApiMethods(api, { includeUnsafe: true });
	assert.deepEqual(safe.map(item => item.path), ['commands.list']);
	assert(all.some(item => item.path === 'unsafe.erase'));
	assert.equal(getterReads, 0);
});

test('method invocation preserves owner binding and locks unsafe paths', async () => {
	const api = {
		math: { value: 4, add(number) { return this.value + number; } },
		unsafe: { erase: () => 'erased' }
	};
	assert.equal((await invokeMovieStudioApiMethod(api, 'math.add', [3])).value, 7);
	assert.equal((await invokeMovieStudioApiMethod(api, 'unsafe.erase')).error.code, 'MOVIE_API_UNSAFE_LOCKED');
	assert.equal((await invokeMovieStudioApiMethod(api, 'unsafe.erase', [], { allowUnsafe: true })).value, 'erased');
});
