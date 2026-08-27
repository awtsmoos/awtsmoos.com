// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoring3dAdvancedRuntime.test.mjs
 * @description Proves geometry nodes, vertex masks, sculpt strokes, and integrated director evidence.
 * The Awtsmoos renews graph and stroke beyond abstraction; Awtsmoos.com verifies
 * that custom authored systems enter actual transforms, buffers, masks, and frame snapshots.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BufferAttribute, BufferGeometry, Group, Mesh, MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { MovieAuthoring3dDirector } from '../../movie/MovieAuthoring3dDirector.js';
import { applyMovieGeometryGraph } from '../../movie/MovieAuthoring3dGeometryGraphRuntime.js';
import { applyMovieSculptLayers } from '../../movie/MovieAuthoring3dSculptRuntime.js';
import { movieVertexWeights } from '../../movie/MovieAuthoring3dVertexGroups.js';

function fixture() {
	const model = new Group();
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		0, 0, 0,
		0, 1, 0,
		0, 2, 0
	]), 3));
	model.add(new Mesh(geometry, new MeshStandardMaterial()));
	return { geometry, model, runtime: { model, state: {}, player: { names: [] } } };
}

test('height vertex group selects a bounded lower garment region', () => {
	const { geometry } = fixture();
	const weights = movieVertexWeights(geometry.attributes.position, { selector: 'height:bottom-50%' });
	assert.deepEqual([...weights], [1, 1, 0]);
});

test('sculpt layer changes only weighted vertices inside its brush radius', () => {
	const { geometry, model } = fixture();
	const result = applyMovieSculptLayers(model, [{
		brush: 'grab',
		id: 'stroke-layer',
		strokes: [{ center: [0, 0, 0], radius: 1.1, strength: 0.5 }],
		target: 'hero-chossid',
		vertexGroupId: 'bottom'
	}], [{ id: 'bottom', selector: 'height:bottom-50%' }]);
	assert.equal(result.strokeCount, 1);
	assert.ok(geometry.attributes.position.array[0] > 0);
	assert.equal(geometry.attributes.position.array[6], 0);
});

test('geometry graph executes transform and instance nodes while preserving advanced nodes', () => {
	const { model } = fixture();
	const result = applyMovieGeometryGraph(model, {
		edges: [],
		id: 'graph',
		nodes: [
			{ id: 'move', position: [1, 2, 3], type: 'transform' },
			{ count: 4, id: 'instance', type: 'instance' },
			{ id: 'boolean', type: 'boolean' }
		]
	});
	assert.deepEqual([model.position.x, model.position.y, model.position.z], [1, 2, 3]);
	assert.equal(model.userData.instanceCount, 4);
	assert.equal(result.nodes[2].status, 'preserved');
});

test('director frame reports geometry and sculpt execution together', () => {
	const { runtime } = fixture();
	const director = new MovieAuthoring3dDirector(runtime, {
		geometryGraphs: [{ id: 'geometry', nodes: [{ id: 'instance', count: 2, modelId: 'hero-chossid', type: 'instance' }], edges: [] }],
		models: [{ id: 'hero-chossid' }],
		modifierStacks: [],
		motions: [],
		sculptLayers: [{ brush: 'grab', id: 'sculpt', target: 'hero-chossid', strokes: [{ center: [0, 0, 0], radius: 1, strength: 0.1 }] }],
		shaderGraphs: [],
		vertexGroups: []
	});
	const frame = director.apply(0);
	assert.equal(frame[0].geometry.graphId, 'geometry');
	assert.equal(frame[0].sculpt.strokeCount, 1);
});
