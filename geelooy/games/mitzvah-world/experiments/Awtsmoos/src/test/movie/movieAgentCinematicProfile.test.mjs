// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { enrichMovieAgentManifest } from '../../movie/MovieAgentCinematicProfile.js';

test('cinematic generation adds deterministic direction without mutating source', () => {
	const source = {
		generation: { ambientKind: 'village', cinematic: true, world: 'emerald-village' },
		markers: [],
		scenes: [
			{ duration: 4, id: 'opening', label: 'Opening', beats: [{ type: 'dialogue', text: 'Shalom' }] },
			{ duration: 3, id: 'close', beats: [] }
		]
	};
	const result = enrichMovieAgentManifest(source);
	assert.equal(source.scenes[0].beats.length, 1);
	assert.equal(result.scenes[0].world, 'emerald-village');
	assert.equal(result.scenes[0].beats[0].type, 'camera');
	assert.equal(result.scenes[0].beats.at(-1).type, 'audio');
	assert.deepEqual(result.markers.map(marker => marker.time), [0, 4]);
	assert.deepEqual(enrichMovieAgentManifest(source), result);
});

test('cinematic enrichment is opt-in and preserves authored camera and audio', () => {
	const plain = { scenes: [{ duration: 2, beats: [] }] };
	assert.equal(enrichMovieAgentManifest(plain), plain);
	const source = {
		generation: { cinematic: true },
		scenes: [{ duration: 2, beats: [{ type: 'camera' }, { type: 'audio' }] }]
	};
	assert.equal(enrichMovieAgentManifest(source).scenes[0].beats.length, 2);
});
