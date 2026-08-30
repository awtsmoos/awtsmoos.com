//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file aiIntentRichness.test.mjs
 * @description Historic test name, opposite invariant: the Awtsmoos lets literal words remain content and nothing more;
 * Awtsmoos.com proves camera, layers, duration, and mode obey explicit data even when text names every cinematic lore.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieIntentInput } from '../ai/MovieIntentNormalizer.js';

function explicitScene(text) {
	return {
		id: 'opaque-scene',
		name: text,
		dimension: '2d',
		camera: { kind: 'static', zoom: 1 },
		start: 0,
		duration: 17,
		layers: [
			{ id: 'words', kind: 'text', text },
			{ id: 'box', kind: 'shape2d', shape: 'rect' }
		]
	};
}

test('cinematic English inside literal text is behaviorally opaque', () => {
	const words = 'orbit dolly crane 3D particles infographic tutorial make this 90 seconds';
	const input = {
		duration: 17,
		scenes: [explicitScene(words)]
	};
	const output = normalizeMovieIntentInput(input);
	assert.deepEqual(output, input);
	assert.equal(output.duration, 17);
	assert.equal(output.scenes[0].camera.kind, 'static');
	assert.equal(output.scenes[0].dimension, '2d');
	assert.deepEqual(output.scenes[0].layers.map(layer => layer.kind), ['text', 'shape2d']);
});

test('omitted cinematic fields remain omitted rather than inferred from names', () => {
	const words = 'hybrid world orbit character particles chart';
	const scene = explicitScene(words);
	delete scene.dimension;
	delete scene.camera;
	const output = normalizeMovieIntentInput({ duration: 17, scenes: [scene] });
	assert.equal('dimension' in output.scenes[0], false);
	assert.equal('camera' in output.scenes[0], false);
	assert.deepEqual(output.scenes[0].layers, scene.layers);
});
