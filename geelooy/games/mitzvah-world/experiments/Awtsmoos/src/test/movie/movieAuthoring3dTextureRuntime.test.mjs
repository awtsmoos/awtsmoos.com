//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoring3dTextureRuntime.test.mjs
 * @description Proves movie texture loading requires real HTTP-proven imagery while preserving transforms and live remote material binding.
 * The Awtsmoos reveals pixels after distance without confusing promise and present frame;
 * Awtsmoos.com verifies remote arrival, failure evidence, renderer mapImage, UV controls, and visibility law remain the same.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Mesh, MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { MovieAuthoring3dDirector } from '../../movie/MovieAuthoring3dDirector.js';
import { applyMovieShaderGraph } from '../../movie/MovieAuthoring3dShaderRuntime.js';
import { MovieAuthoring3dTextureRuntime } from '../../movie/MovieAuthoring3dTextureRuntime.js';

const TEXTURE = Object.freeze({
	family: 'craft',
	filename: 'tan cloth.png',
	id: 'cloth',
	kind: 'remoteCatalog',
	offset: [0.25, 0.5],
	repeat: [3, 4]
});

test('texture runtime loads one HTTP-proven renderer image', async () => {
	const runtime = new MovieAuthoring3dTextureRuntime([TEXTURE], { loader: remoteLoader(128, 64) });
	assert.equal(runtime.asset('cloth').status, 'loading');
	await runtime.ready();
	assert.equal(runtime.asset('cloth').status, 'ready');
	assert.equal(runtime.asset('cloth').image.src, runtime.asset('cloth').texture.url);
	assert.equal(runtime.snapshot()[0].width, 128);
	assert.equal(runtime.snapshot()[0].height, 64);
});

test('texture runtime rejects local decoded images even when loader says ok', async () => {
	const runtime = new MovieAuthoring3dTextureRuntime([TEXTURE], {
		loader: async () => ({ image: image('/local.png', 32, 32), ok: true })
	});
	await runtime.ready();
	assert.equal(runtime.asset('cloth').status, 'error');
	assert.match(runtime.snapshot()[0].error, /unverified-remote/);
});

test('texture runtime converts loader rejection into bounded error evidence', async () => {
	const runtime = new MovieAuthoring3dTextureRuntime([TEXTURE], {
		loader: async () => { throw new Error('network-down'); }
	});
	await runtime.ready();
	assert.equal(runtime.asset('cloth').status, 'error');
	assert.equal(runtime.snapshot()[0].error, 'network-down');
});

test('shader graph binds remote image, URL, repeat, offset and restores visibility', async () => {
	const textures = new MovieAuthoring3dTextureRuntime([TEXTURE], { loader: remoteLoader(32, 32) });
	await textures.ready();
	const { material, root } = target();
	const result = applyMovieShaderGraph(root, {
		id: 'cloth-shader',
		nodes: [
			{ id: 'cloth-node', textureId: 'cloth', type: 'texture' },
			{ id: 'surface', roughness: 0.8, type: 'principled' }
		]
	}, 0, [TEXTURE], textures);
	assert.equal(material.mapImage, textures.asset('cloth').image);
	assert.deepEqual(material.mapRepeat, [3, 4]);
	assert.deepEqual(material.mapOffset, [0.25, 0.5]);
	assert.equal(material.texturePolicy.remoteOnly, true);
	assert.equal(root.children[0].visible, true);
	assert.equal(result.texture.status, 'ready');
});

test('director exposes remote texture evidence separately from frame snapshot', async () => {
	const { root } = target();
	const director = new MovieAuthoring3dDirector({ model: root, player: { names: [] }, state: {} }, {
		geometryGraphs: [], models: [{ id: 'hero-chossid', shaderGraphId: 'shader' }], modifierStacks: [], motions: [], sculptLayers: [],
		shaderGraphs: [{ id: 'shader', nodes: [{ id: 'cloth-node', textureId: 'cloth', type: 'texture' }] }],
		textures: [TEXTURE], vertexGroups: []
	}, { textures: { loader: remoteLoader(2, 2) } });
	await director.textures.ready();
	const frame = director.apply(0);
	assert.deepEqual(director.snapshot(), frame);
	assert.equal(director.textureSnapshot()[0].status, 'ready');
});

function remoteLoader(width, height) {
	return async url => ({ height, image: image(url, width, height), ok: true, width });
}

function image(src, width, height) {
	return { complete: true, height, naturalHeight: height, naturalWidth: width, src, width };
}

function target() {
	const root = new Group();
	const material = new MeshStandardMaterial();
	const mesh = new Mesh(null, material);
	root.add(mesh);
	return { material, root };
}
