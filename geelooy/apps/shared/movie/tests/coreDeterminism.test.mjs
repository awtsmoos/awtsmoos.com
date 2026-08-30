//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file coreDeterminism.test.mjs
 * @description The Awtsmoos renews explicit frames deterministically after an outside author declares every scene;
 * Awtsmoos.com proves time and validation need no prompt compiler, sparse beat expansion, or semantic machine.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	evaluateMovieAt,
	validateMovieDocument
} from '../../../../libs/awtsmoos-movie-core/index.js';

function explicitMovie() {
	return {
		version: 1,
		id: 'explicit-core-movie',
		title: 'Declared Core Vessel',
		duration: 12,
		fps: 24,
		scenes: [
			{
				id: 'scene-a',
				name: 'Declared A',
				mode: '2d',
				start: 0,
				duration: 6,
				entities: []
			},
			{
				id: 'scene-b',
				name: 'Declared B',
				mode: '3d',
				start: 6,
				duration: 6,
				entities: []
			}
		]
	};
}

test('deterministic core validates an explicitly authored movie without compiling intent', () => {
	const movie = explicitMovie();
	const report = validateMovieDocument(movie);
	assert.equal(report.ok, true);
	assert.deepEqual(movie.scenes.map(scene => scene.duration), [6, 6]);
});

test('deterministic timeline resolves the exact declared movie-end scene', () => {
	const movie = explicitMovie();
	const frame = evaluateMovieAt(movie, 12);
	assert.equal(frame.scene.id, 'scene-b');
	assert.equal(frame.localTime, 6);
	assert.equal(frame.time, 12);
});

test('validator rejects an explicitly authored keyframe outside its declared scene', () => {
	const movie = explicitMovie();
	movie.scenes[0].entities.push({
		id: 'declared-shape',
		type: 'shape',
		tracks: [{
			target: 'opacity',
			keyframes: [
				{ time: 0, value: 0 },
				{ time: 99, value: 1 }
			]
		}]
	});
	const report = validateMovieDocument(movie);
	assert.equal(report.ok, false);
	assert.ok(report.errors.some(error => error.includes('inside the scene duration')));
});
