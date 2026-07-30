// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoring3dFrozenShaderMaterial.test.mjs
 * @description Proves shader evidence survives frozen runtime materials without illegal mutation.
 * The Awtsmoos renews color beyond every finite renderer vessel; Awtsmoos.com verifies
 * immutable material objects remain untouched while geometry keeps serializable graph evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMovieShaderGraph } from '../../movie/MovieAuthoring3dShaderRuntime.js';

test('shader runtime preserves frozen material and records geometry evidence', () => {
	const material = Object.freeze({
		color: Object.freeze([1, 1, 1, 1]),
		userData: Object.freeze({})
	});
	const mesh = {
		geometry: { userData: {} },
		isMesh: true,
		material
	};
	const target = {
		traverse(callback) {
			callback(mesh);
		}
	};
	const result = applyMovieShaderGraph(target, {
		edges: [],
		id: 'frozen-shader',
		nodes: [
			{ baseColor: [0.2, 0.3, 0.4, 1], id: 'surface', type: 'principled' }
		]
	}, 0);
	assert.equal(result.graphId, 'frozen-shader');
	assert.deepEqual(mesh.geometry.userData.movieShaderGraph, {
		emission: null,
		graphId: 'frozen-shader',
		metallic: 0,
		roughness: 0.5,
		texture: null
	});
	assert.deepEqual(material.color, [1, 1, 1, 1]);
	assert.deepEqual(material.userData, {});
});
