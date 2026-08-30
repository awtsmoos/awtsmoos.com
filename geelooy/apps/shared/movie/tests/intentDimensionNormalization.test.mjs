//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file intentDimensionNormalization.test.mjs
 * @description Historic filename, semantic-neutral normalization: the Awtsmoos preserves declared dimensions exactly;
 * Awtsmoos.com proves omitted fields stay omitted and no synthetic world, light, character, particle, or shape appears unexpectedly.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieIntentInput } from '../ai/MovieIntentNormalizer.js';

function structuredInput(dimension) {
	const scene = {
		id: 'dimension-scene',
		name: '3D orbit particles tutorial character words are only a name',
		start: 0,
		duration: 8,
		layers: [{ id: 'literal', kind: 'text', text: 'world light particles' }]
	};
	if (dimension !== undefined) scene.dimension = dimension;
	return { duration: 8, scenes: [scene] };
}

test('omitted dimension remains omitted with no synthesized layers', () => {
	const input = structuredInput(undefined);
	const output = normalizeMovieIntentInput(input);
	assert.deepEqual(output, input);
	assert.equal('dimension' in output.scenes[0], false);
	assert.deepEqual(output.scenes[0].layers.map(layer => layer.kind), ['text']);
});

test('explicit 2d remains exactly 2d without synthetic spatial vessels', () => {
	const input = structuredInput('2d');
	const output = normalizeMovieIntentInput(input);
	assert.deepEqual(output, input);
	assert.equal(output.scenes[0].dimension, '2d');
});

test('explicit 3d remains exactly 3d without synthesized world or light', () => {
	const input = structuredInput('3d');
	const output = normalizeMovieIntentInput(input);
	assert.deepEqual(output, input);
	assert.equal(output.scenes[0].dimension, '3d');
	assert.deepEqual(output.scenes[0].layers.map(layer => layer.kind), ['text']);
});
