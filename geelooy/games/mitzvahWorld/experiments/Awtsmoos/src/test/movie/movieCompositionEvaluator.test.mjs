// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCompositionEvaluator.test.mjs
 * @description Proves deterministic nested timing, looping, masks, blends, transforms, and immutable plans.
 * The Awtsmoos is beyond inner and outer clocks; Awtsmoos.com verifies every finite nested
 * layer reaches the renderer with its authored path, combined opacity, geometry, and source time intact.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateMovieComposition } from '../../movie/MovieCompositionEvaluator.js';

const triangle = id => ({
	id,
	points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }]
});

function catalog(loop = false) {
	return [{
		duration: 4,
		id: 'child',
		layers: [{
			blendMode: 'screen',
			duration: 4,
			id: 'leaf',
			kind: 'solid',
			masks: [triangle('leaf-mask')],
			opacity: 0.8,
			transform: { rotation: 5, x: 10 }
		}],
		name: 'Child'
	}, {
		duration: 6,
		id: 'root',
		layers: [{
			blendMode: 'multiply',
			duration: 5,
			id: 'nested',
			kind: 'composition',
			loop,
			masks: [triangle('root-mask')],
			opacity: 0.5,
			playbackRate: loop ? 2 : 1,
			sourceId: 'child',
			sourceStart: loop ? 3.5 : 0,
			start: loop ? 0 : 1,
			transform: { scaleX: 2, x: 100 }
		}],
		name: 'Root'
	}];
}

test('flattens nested layers with composed timing, masks, blends, and transforms', () => {
	const plan = evaluateMovieComposition(catalog(), 'root', 2);
	assert.equal(plan.layers.length, 1);
	const layer = plan.layers[0];
	assert.equal(layer.sourceTime, 1);
	assert.equal(layer.opacity, 0.4);
	assert.equal(layer.transform.x, 120);
	assert.equal(layer.transform.rotation, 5);
	assert.deepEqual(layer.blendModeChain, ['multiply', 'screen']);
	assert.equal(layer.maskChain.length, 2);
	assert.deepEqual(layer.path, [
		{ compositionId: 'root', layerId: 'nested' },
		{ compositionId: 'child', layerId: 'leaf' }
	]);
	assert.equal(Object.isFrozen(layer.transform), true);
	assert.throws(() => layer.path.push('mutate'), TypeError);
});

test('loops nested source time deterministically', () => {
	const plan = evaluateMovieComposition(catalog(true), 'root', 1);
	assert.equal(plan.layers[0].sourceTime, 1.5);
});

test('returns no inactive layers and rejects invalid evaluation time', () => {
	assert.equal(evaluateMovieComposition(catalog(), 'root', 0.5).layers.length, 0);
	assert.throws(
		() => evaluateMovieComposition(catalog(), 'root', -1),
		error => error.code === 'INVALID_MOVIE_COMPOSITION_TIME'
	);
	assert.throws(
		() => evaluateMovieComposition(catalog(), 'missing', 0),
		error => error.code === 'MOVIE_COMPOSITION_NOT_FOUND'
	);
});
