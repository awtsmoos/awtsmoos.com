// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoring3dRuntime.test.mjs
 * @description Proves motion, geometry, materials, modifiers, and director evidence against the real tiny runtime.
 * The Awtsmoos renews every measured point and garment shade; Awtsmoos.com verifies
 * that serializable intention enters actual vectors, buffers, animation players, and materials.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BufferAttribute, BufferGeometry, Group, Mesh, MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { MovieAuthoring3dDirector } from '../../movie/MovieAuthoring3dDirector.js';
import { applyMovieAuthoring3dMotion } from '../../movie/MovieAuthoring3dMotion.js';
import { applyMovieModifierStack } from '../../movie/MovieAuthoring3dModifierRuntime.js';
import { applyMovieShaderGraph } from '../../movie/MovieAuthoring3dShaderRuntime.js';

function fixture() {
	const model = new Group();
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		-1, 0, 0, 1, 0, 0, 0, 2, 0
	]), 3));
	const material = new MeshStandardMaterial({ color: [1, 1, 1, 1] });
	model.add(new Mesh(geometry, material));
	const played = [];
	const runtime = {
		model,
		player: { names: ['stand', 'cast'], play: name => played.push(name) },
		state: { renderY: 2, x: 4, z: 6 }
	};
	return { geometry, material, model, played, runtime };
}

test('motion interpolates keyframes and resolves an authored action', () => {
	const { model, played, runtime } = fixture();
	const result = applyMovieAuthoring3dMotion(runtime, model, {
		action: 'staff.cast',
		keyframes: [
			{ channel: 'position', time: 0, value: [0, 0, 0] },
			{ channel: 'position', time: 2, value: [2, 4, 6] }
		],
		mode: 'action'
	}, 1);
	assert.deepEqual([model.position.x, model.position.y, model.position.z], [1, 2, 3]);
	assert.deepEqual(played, ['cast']);
	assert.equal(result.keyframeCount, 2);
});

test('modifier stack mutates geometry and records preserved advanced modifiers', () => {
	const { geometry, model, runtime } = fixture();
	const before = [...geometry.attributes.position.array];
	const evidence = applyMovieModifierStack(runtime, model, {
		modifiers: [
			{ amount: 0.2, enabled: true, type: 'displace' },
			{ enabled: true, type: 'weightedNormal' },
			{ enabled: true, type: 'cloth' }
		]
	}, 0);
	assert.notDeepEqual([...geometry.attributes.position.array], before);
	assert.equal(geometry.userData.normalModifier.type, 'weightedNormal');
	assert.deepEqual(evidence.map(item => item.status), ['executed', 'executed', 'preserved']);
});

test('shader graph applies procedural grain and principled evidence', () => {
	const { material, model } = fixture();
	const result = applyMovieShaderGraph(model, {
		id: 'garment',
		nodes: [
			{ id: 'color', type: 'color', value: '#203040' },
			{ id: 'grain', scale: 2, strength: 0.1, type: 'grain' },
			{ id: 'surface', metallic: 0.2, roughness: 0.8, type: 'principled' }
		]
	}, 0, []);
	assert.equal(result.graphId, 'garment');
	assert.equal(material.userData.movieShaderGraph.roughness, 0.8);
	assert.equal(material.color.length, 4);
});

test('director combines model, motion, modifiers, and shader into one frame snapshot', () => {
	const { runtime } = fixture();
	const director = new MovieAuthoring3dDirector(runtime, {
		geometryGraphs: [],
		models: [{ id: 'hero-chossid', modifierStackId: 'mods', motionId: 'motion', shaderGraphId: 'shader' }],
		modifierStacks: [{ id: 'mods', modifiers: [{ enabled: true, type: 'mask', visible: true }] }],
		motions: [{ id: 'motion', keyframes: [], mode: 'manualControls', manualControls: { enabled: true } }],
		sculptLayers: [],
		shaderGraphs: [{ id: 'shader', nodes: [{ id: 'surface', type: 'principled' }] }],
		textures: [],
		vertexGroups: []
	});
	const frame = director.apply(1);
	assert.equal(frame[0].status, 'applied');
	assert.equal(frame[0].motion.mode, 'manualControls');
	assert.deepEqual(director.snapshot(), frame);
	director.destroy();
	assert.deepEqual(director.snapshot(), []);
});
