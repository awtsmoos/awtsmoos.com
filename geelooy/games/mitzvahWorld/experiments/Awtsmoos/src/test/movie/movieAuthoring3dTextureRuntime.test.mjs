// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoring3dTextureRuntime.test.mjs
 * @description Proves authored texture loading, failure evidence, transforms, and live material binding.
 * The Awtsmoos reveals pixels after distance without confusing promise and present frame;
 * Awtsmoos.com verifies fallback, cached arrival, renderer mapImage, and serializable evidence agree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	Group,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { MovieAuthoring3dDirector } from '../../movie/MovieAuthoring3dDirector.js';
import { applyMovieShaderGraph } from '../../movie/MovieAuthoring3dShaderRuntime.js';
import { MovieAuthoring3dTextureRuntime } from '../../movie/MovieAuthoring3dTextureRuntime.js';

const TEXTURE = {
	family: 'craft',
	filename: 'tan cloth.png',
	id: 'cloth',
	kind: 'remoteCatalog',
	offset: [0.25, 0.5],
	repeat: [3, 4]
};

function target() {
	const root = new Group();
	const material = new MeshStandardMaterial();
	root.add(new Mesh(null, material));
	return { material, root };
}

test('texture runtime loads one renderer-compatible image with serializable dimensions', async () => {
	const image = { height: 64, width: 128 };
	const runtime = new MovieAuthoring3dTextureRuntime([TEXTURE], {
		loader: async url => ({ height: 64, image, method: 'test', ok: true, url, width: 128 })
	});
	assert.equal(runtime.asset('cloth').status, 'loading');
	await runtime.ready();
	assert.equal(runtime.asset('cloth').image, image);
	assert.deepEqual(runtime.snapshot()[0], {
		error: null,
		height: 64,
		id: 'cloth',
		status: 'ready',
		texture: runtime.asset('cloth').texture,
		width: 128
	});
});

test('texture runtime converts loader rejection into bounded error evidence', async () => {
	const runtime = new MovieAuthoring3dTextureRuntime([TEXTURE], {
		loader: async () => { throw new Error('network-down'); }
	});
	await runtime.ready();
	assert.equal(runtime.asset('cloth').status, 'error');
	assert.equal(runtime.snapshot()[0].error, 'network-down');
});

test('shader graph binds loaded image, URL, repeat, and offset to live material', async () => {
	const image = { height: 32, width: 32 };
	const textures = new MovieAuthoring3dTextureRuntime([TEXTURE], {
		loader: async () => ({ height: 32, image, ok: true, width: 32 })
	});
	await textures.ready();
	const { material, root } = target();
	const result = applyMovieShaderGraph(root, {
		id: 'cloth-shader',
		nodes: [
			{ id: 'cloth-node', textureId: 'cloth', type: 'texture' },
			{ id: 'surface', roughness: 0.8, type: 'principled' }
		]
	}, 0, [TEXTURE], textures);
	assert.equal(material.mapImage, image);
	assert.deepEqual(material.mapRepeat, [3, 4]);
	assert.deepEqual(material.mapOffset, [0.25, 0.5]);
	assert.equal(result.texture.status, 'ready');
	assert.equal(material.userData.movieShaderGraph.texture.width, 32);
});

test('director preserves frame snapshot contract and exposes texture evidence separately', async () => {
	const { root } = target();
	const director = new MovieAuthoring3dDirector({ model: root, player: { names: [] }, state: {} }, {
		geometryGraphs: [],
		models: [{ id: 'hero-chossid', shaderGraphId: 'shader' }],
		modifierStacks: [],
		motions: [],
		sculptLayers: [],
		shaderGraphs: [{ id: 'shader', nodes: [{ id: 'cloth-node', textureId: 'cloth', type: 'texture' }] }],
		textures: [TEXTURE],
		vertexGroups: []
	}, { textures: { loader: async () => ({ image: { height: 2, width: 2 }, ok: true }) } });
	await director.textures.ready();
	const frame = director.apply(0);
	assert.deepEqual(director.snapshot(), frame);
	assert.equal(director.textureSnapshot()[0].status, 'ready');
});
