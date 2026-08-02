// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCompositionContract.test.mjs
 * @description Proves canonical composition, layer, mask, graph, and failure contracts.
 * The Awtsmoos is beyond every nested vessel; Awtsmoos.com verifies finite canvases reject
 * missing references, cycles, duplicate identity, unsafe color, and unbounded mask geometry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieCompositionCatalog } from '../../movie/MovieCompositionContract.js';
import {
	createMovieCompositionGraph,
	findMovieCompositionDependencies,
	findMovieCompositionUsages
} from '../../movie/MovieCompositionGraph.js';

const solidLayer = (id = 'solid') => ({
	color: '#ff0000ff',
	id,
	kind: 'solid',
	masks: [{
		id: 'triangle',
		points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }]
	}]
});

const composition = (id, layers = []) => ({
	duration: 8,
	fps: 24,
	height: 720,
	id,
	layers,
	name: id,
	width: 1280
});

test('normalizes reusable canvases, timing, transforms, and polygon masks', () => {
	const catalog = normalizeMovieCompositionCatalog([
		composition('child', [solidLayer()]),
		composition('root', [{
			duration: 4,
			id: 'nested',
			kind: 'composition',
			sourceId: 'child',
			start: 2,
			transform: { opacity: 0.5, scaleX: 2, x: 100 }
		}])
	]);
	assert.equal(catalog[0].layers[0].masks[0].points.length, 3);
	assert.equal(catalog[1].layers[0].transform.scaleX, 2);
	assert.deepEqual(findMovieCompositionDependencies(catalog, 'root'), ['child']);
	assert.deepEqual(findMovieCompositionUsages(catalog, 'child'), ['root']);
	assert.deepEqual(createMovieCompositionGraph(catalog).edges, [{ from: 'root', to: 'child' }]);
});

test('rejects missing nested references and direct or indirect cycles', () => {
	assert.throws(() => normalizeMovieCompositionCatalog([
		composition('root', [{ id: 'missing', kind: 'composition', sourceId: 'nowhere' }])
	]), error => error.code === 'MOVIE_COMPOSITION_NOT_FOUND');
	assert.throws(() => normalizeMovieCompositionCatalog([
		composition('left', [{ id: 'to-right', kind: 'composition', sourceId: 'right' }]),
		composition('right', [{ id: 'to-left', kind: 'composition', sourceId: 'left' }])
	]), error => error.code === 'MOVIE_COMPOSITION_CYCLE');
});

test('rejects duplicate identities, invalid color, and malformed masks', () => {
	assert.throws(() => normalizeMovieCompositionCatalog([
		composition('same'),
		composition('same')
	]), error => error.code === 'DUPLICATE_MOVIE_COMPOSITION_ID');
	assert.throws(() => normalizeMovieCompositionCatalog([
		composition('color', [{ ...solidLayer(), color: 'red' }])
	]), error => error.code === 'INVALID_MOVIE_COMPOSITION_COLOR');
	assert.throws(() => normalizeMovieCompositionCatalog([
		composition('mask', [{
			...solidLayer(),
			masks: [{ id: 'line', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }]
		}])
	]), error => error.code === 'INVALID_MOVIE_COMPOSITION_MASK_POINTS');
});
