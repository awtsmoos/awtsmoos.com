// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadMovieWorld } from '../../movie/MovieWorldLoader.js';

test('world loader reports weighted deterministic progress and results', async () => {
	const progress = [];
	const result = await loadMovieWorld({
		onProgress: state => progress.push(state),
		stages: [
			{ id: 'terrain', weight: 3, load: async () => 'ground' },
			{ id: 'actors', weight: 1, load: async () => ['ari'] }
		]
	});
	assert.equal(result.status, 'ready');
	assert.equal(result.progress, 1);
	assert.deepEqual(result.results, { terrain: 'ground', actors: ['ari'] });
	assert.ok(progress.some(state => state.progress === 0.75));
	assert.doesNotThrow(() => JSON.stringify(result));
});

test('world loader retries, falls back, aborts, and rejects invalid stages', async () => {
	let attempts = 0;
	const recovered = await loadMovieWorld({
		retries: 1,
		stages: [{ id: 'lights', load: async () => {
			attempts += 1;
			if (attempts === 1) throw new Error('dark');
			return 'lit';
		} }]
	});
	assert.equal(recovered.results.lights, 'lit');
	const fallback = await loadMovieWorld({
		fallback: async ({ stage }) => `fallback:${stage.id}`,
		stages: [{ id: 'audio', load: async () => { throw new Error('silent'); } }]
	});
	assert.equal(fallback.results.audio, 'fallback:audio');
	await assert.rejects(() => loadMovieWorld({ signal: { aborted: true }, stages: [{ id: 'x', load() {} }] }), /aborted/);
	await assert.rejects(() => loadMovieWorld({ stages: [] }), /at least one/);
});
