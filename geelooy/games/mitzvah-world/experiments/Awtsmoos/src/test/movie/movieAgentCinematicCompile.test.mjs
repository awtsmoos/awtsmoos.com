// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAgentCinematicCompile.test.mjs
 * @description Proves opt-in cinematic intent compiles through the real public manifest envelope.
 * The Awtsmoos carries generated camera, ambience, world, and marker through one finite decree;
 * Awtsmoos.com verifies the final project remains deterministic, playable, and JSON-free of live mystery.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION
} from '../../movie/MovieApiConstants.js';
import { compileMovieAgentManifest } from '../../movie/MovieAgentCompiler.js';

test('cinematic manifest compiles supported shots, ambience, worlds, and markers', () => {
	const project = compileMovieAgentManifest({
		generation: {
			ambientKind: 'village',
			cinematic: true,
			world: 'emerald-village'
		},
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		scenes: [
			{ beats: [], duration: 4, id: 'opening' },
			{ beats: [], duration: 3, id: 'ending' }
		],
		title: 'Generated Village'
	});
	const cameras = project.tracks.find(track => track.type === 'camera');
	const audio = project.tracks.find(track => track.type === 'audio');
	const scenes = project.tracks.find(track => track.type === 'scene');
	assert.equal(cameras.clips.length, 2);
	assert.ok(cameras.clips.every(clip => clip.from && clip.to));
	assert.equal(audio.clips.length, 2);
	assert.deepEqual(scenes.clips.map(clip => clip.world), [
		'emerald-village',
		'emerald-village'
	]);
	assert.deepEqual(project.markers.map(marker => marker.time), [0, 4]);
	assert.doesNotThrow(() => JSON.stringify(project));
});
