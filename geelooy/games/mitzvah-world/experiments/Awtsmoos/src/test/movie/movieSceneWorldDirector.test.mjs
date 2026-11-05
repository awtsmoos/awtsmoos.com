// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieSceneDirector } from '../../movie/MovieSceneDirector.js';

test('scene director activates each changed world once and keeps snapshots serializable', async () => {
	const activations = [];
	const events = [];
	const runtime = {
		events: { emit: (name, payload) => events.push([name, payload]) },
		scene: { traverse() {} },
		worldLoader: { activate: async (...args) => activations.push(args) }
	};
	const director = new MovieSceneDirector(runtime);
	const state = world => ({
		clip: { id: `scene-${world}`, transition: 'fade', world },
		progress: 0.25
	});
	assert.equal(director.apply(state('village')).world, 'village');
	director.apply(state('village'));
	director.apply(state('forest'));
	await Promise.resolve();
	assert.deepEqual(activations.map(item => item[0]), ['village', 'forest']);
	assert.equal(events.filter(item => item[0] === 'movie:world-change').length, 2);
	assert.doesNotThrow(() => JSON.stringify(director.current));
});
