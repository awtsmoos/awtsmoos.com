// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoring3dVisibleTopology.test.mjs
 * @description Proves visible geometry-node and modifier topology operations remain deterministic across frames.
 * The Awtsmoos renews every point without cumulative corruption; Awtsmoos.com verifies
 * extrusion, subdivision, decimation, bevel, evidence, and cached source restoration on real buffer vessels.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMovieGeometryGraph } from '../../movie/MovieAuthoring3dGeometryGraphRuntime.js';
import { applyMovieModifierStack } from '../../movie/MovieAuthoring3dModifierRuntime.js';
import {
	MovieTestAttribute,
	movieTargetWith,
	movieTriangleMesh,
	movieTwoTrianglePositions
} from './movieAuthoring3dTopologyFixtures.mjs';

test('geometry graph executes extrude and subdivision into visible position buffers', () => {
	const mesh = movieTriangleMesh();
	const result = applyMovieGeometryGraph(movieTargetWith(mesh), {
		edges: [],
		id: 'visible-graph',
		nodes: [
			{ id: 'extrude', offset: [0, 0, 1], type: 'extrude' },
			{ id: 'subdivide', levels: 1, type: 'subdivide' }
		]
	});
	assert.equal(mesh.geometry.attributes.position.count, 24);
	assert.deepEqual(result.nodes.map(node => node.status), ['executed', 'executed']);
	assert.equal(result.nodes.at(-1).vertexCount, 24);
});

test('geometry graph repeated evaluation does not compound topology', () => {
	const mesh = movieTriangleMesh();
	const target = movieTargetWith(mesh);
	const graph = {
		edges: [],
		id: 'stable-graph',
		nodes: [{ id: 'extrude', offset: [0, 0.5, 0], type: 'extrude' }]
	};
	applyMovieGeometryGraph(target, graph);
	const first = [...mesh.geometry.attributes.position.array];
	applyMovieGeometryGraph(target, graph);
	assert.deepEqual([...mesh.geometry.attributes.position.array], first);
	assert.equal(mesh.geometry.attributes.position.count, 6);
});

test('decimate graph preserves at least one triangle', () => {
	const mesh = movieTriangleMesh();
	mesh.geometry.attributes.position = new MovieTestAttribute(
		movieTwoTrianglePositions()
	);
	applyMovieGeometryGraph(movieTargetWith(mesh), {
		edges: [],
		id: 'decimate-graph',
		nodes: [{ id: 'decimate', ratio: 0.5, type: 'decimate' }]
	});
	assert.equal(mesh.geometry.attributes.position.count, 3);
});

test('modifier stack executes bevel, subdivision surface, and decimate truthfully', () => {
	for (const modifier of [
		{ type: 'bevel', width: 0.1 },
		{ levels: 1, type: 'subdivisionSurface' },
		{ ratio: 0.5, type: 'decimate' }
	]) {
		const mesh = movieTriangleMesh();
		const evidence = applyMovieModifierStack({}, movieTargetWith(mesh), {
			modifiers: [{ ...modifier, enabled: true }]
		}, 0);
		assert.equal(evidence[0].status, 'executed');
		assert.equal(mesh.geometry.userData.topologyModifier.status, 'executed');
	}
});

test('modifier repeated evaluation remains stable', () => {
	const mesh = movieTriangleMesh();
	const target = movieTargetWith(mesh);
	const stack = {
		modifiers: [{ enabled: true, levels: 1, type: 'subdivisionSurface' }]
	};
	applyMovieModifierStack({}, target, stack, 0);
	const firstCount = mesh.geometry.attributes.position.count;
	applyMovieModifierStack({}, target, stack, 1);
	assert.equal(mesh.geometry.attributes.position.count, firstCount);
	assert.equal(firstCount, 12);
});
