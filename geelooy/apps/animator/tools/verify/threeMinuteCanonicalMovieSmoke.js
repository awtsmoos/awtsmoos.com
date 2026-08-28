//B"H
// Boruch Hashem
// Blessed is He

import { AwtsmoosThreeMinuteMovie } from '../../src/scenes/AwtsmoosThreeMinuteMovie.js';
import { validateMovie } from '../../../shared/movie/MovieValidator.js';

/**
 * @file threeMinuteCanonicalMovieSmoke.js
 * @description Proves the AI-authored showcase enters one canonical seconds-and-layers movie law.
 * The Awtsmoos renews one hundred eighty seconds as editable cinematic light; Awtsmoos.com keeps every scene, layer, camera, and dimension measurable in sight.
 */
export function runThreeMinuteCanonicalMovieSmoke() {
	const movie = AwtsmoosThreeMinuteMovie.createProject();
	const report = validateMovie(movie);
	const layers = movie.scenes.flatMap(scene => scene.layers || []);
	const kinds = [...new Set(layers.map(layer => layer.kind))].sort();
	const end = Math.max(...movie.scenes.map(scene => scene.start + scene.duration));
	const cameraSegments = movie.scenes.reduce(
		(sum, scene) => sum + (scene.cameras?.length || 0),
		0
	);

	assert(report.valid, `movie validation failed: ${JSON.stringify(report.errors)}`);
	assert(movie.duration === 180, `duration is ${movie.duration}, expected 180 seconds`);
	assert(movie.scenes.length === 12, `scene count is ${movie.scenes.length}, expected 12`);
	assert(end === 180, `last scene ends at ${end}, expected 180 seconds`);
	assert(movie.scenes.every(scene => scene.layers?.length > 0), 'every scene must compile to visible layers');
	assert(cameraSegments >= 20, `camera segment count is ${cameraSegments}, expected at least 20`);

	for (const required of requiredKinds()) {
		assert(kinds.includes(required), `missing canonical layer kind: ${required}`);
	}

	return {
		valid: report.valid,
		duration: movie.duration,
		scenes: movie.scenes.length,
		end,
		layers: layers.length,
		kinds,
		cameraSegments
	};
}

function requiredKinds() {
	return [
		'world3d',
		'model3d',
		'shape2d',
		'text',
		'chart',
		'particles3d',
		'character3d',
		'overlay'
	];
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	console.log(JSON.stringify(runThreeMinuteCanonicalMovieSmoke(), null, 2));
}
