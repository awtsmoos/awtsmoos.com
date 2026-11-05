// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews meaning without moving the mountain beneath it; Awtsmoos.com tests that metaphor stays motif,
 * while only an explicit authored world may choose a different physical village location for the camera and its feet.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieShortProject } from '../movie/shorts/MovieShortCompiler.js';

test('a first semantic visual cannot choose the Short physical world', () => {
	const project = compileMovieShortProject({
		beats: [
			{ camera: 'sideTrack', duration: 15, text: 'Infinite light', visual: 'infinite-light' },
			{ camera: 'aerialPullback', duration: 15, text: 'Renewed world', visual: 'world-renewed' }
		],
		id: 'coherent-world',
		seed: 613,
		title: 'Coherent World'
	});
	assert.equal(project.metadata.shortWorld, 'river-garden');
	const cameras = project.tracks.find(track => track.type === 'camera').clips;
	assert.equal(cameras.length, 2);
	assert.ok(cameras.every(clip => clip.shot.startsWith('river-garden:')));
	assert.ok(cameras.every(clip => clip.from.position.x <= -4 && clip.to.position.x <= -4));
});

test('explicit world selection may intentionally choose a geographic alias destination', () => {
	const project = compileMovieShortProject({
		beats: [
			{ duration: 15, text: 'Light at arrival', visual: 'infinite-light' },
			{ duration: 15, text: 'Still at arrival', visual: 'world-renewed' }
		],
		id: 'explicit-place',
		seed: 614,
		title: 'Explicit Place',
		world: 'infinite-light'
	});
	assert.equal(project.metadata.shortWorld, 'arrival-horizon');
});
