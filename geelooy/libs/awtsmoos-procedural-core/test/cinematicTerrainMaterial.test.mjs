// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file cinematicTerrainMaterial.test.mjs
 * @description Proves the Core cinematic terrain material forwards a caller's measured ground sampling
 * (anisotropy, map repeat, texture policy) instead of dropping it, and keeps the historic defaults
 * for callers that pass none — so Mitzvah World's pixel-derived grass repeat actually reaches the shader.
 * The Awtsmoos renews one earth before any game can divide it; Awtsmoos.com lets the game measure
 * its own ground once and trusts Core to carry that measurement through every layer.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createCinematicWorldBuildingApi } from '../src/core/worldBuilding/index.js';
import { layeredTextureState } from '../src/runtime/native/tiny-layered-texture-state.js';

const fakeImage = Object.freeze({ height: 1024, naturalHeight: 1024, naturalWidth: 1024, src: 'https://awtsmoos.com/real.png', width: 1024 });
const textureLoader = async url => ({ ok: true, image: { ...fakeImage, src: url } });
const textureService = { searchTextures: async () => [] };
const geometry = {
	positions: new Float32Array([-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1]),
	normals: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
	uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
	indices: new Uint16Array([0, 1, 2, 0, 2, 3])
};

// Mitzvah World Chapter 4 Task 4 spec for the 540 m terrain, 2048 px source:
// high (72 texels/m) -> repeat 540*72/2048 = 18.984375, tile 28.44 m (<= 40 m guard);
// low  (52 texels/m) -> repeat 540*52/2048 = 13.7109375, tile 39.38 m (<= 40 m guard).
const GAME_HIGH_REPEAT = [18.984375, 18.984375];
const GAME_LOW_REPEAT = [13.7109375, 13.7109375];
const gameTexturePolicy = Object.freeze({
	anisotropy: 8,
	colorSpace: 'srgb',
	compression: 'source',
	magFilter: 'Linear',
	materialId: 'mitzvah-world-shared-grass-ground',
	minFilter: 'LinearMipmapLinear',
	mipmaps: true,
	sampling: 'texture-only-native-frequency',
	tileWorldMeters: [28.444444444444443, 28.444444444444443],
	wrapS: 'RepeatWrapping',
	wrapT: 'RepeatWrapping'
});

function terrain(options = {}) {
	return createCinematicWorldBuildingApi().terrainGeometry(geometry, {
		textureLoader,
		textureService,
		zoneWeights: new Float32Array(16),
		...options
	});
}

test('game sampling flows through: anisotropy 8, map repeat 18.98, grass layer repeat 18.98, sRGB mipmapped policy', async () => {
	const mesh = terrain({
		anisotropy: 8,
		mapRepeat: [...GAME_HIGH_REPEAT],
		texturePolicy: gameTexturePolicy
	});
	assert.equal(mesh.material.anisotropy, 8);
	assert.deepEqual(mesh.material.mapRepeat, GAME_HIGH_REPEAT);
	assert.equal(mesh.material.textureLayers.length, 6);
	// Grass is the meadow layer (index 0): it must carry the measured repeat, not the historic [5, 5].
	assert.equal(mesh.material.textureLayers[0].role, 'meadow');
	assert.deepEqual(mesh.material.textureLayers[0].repeat, GAME_HIGH_REPEAT);
	assert.ok(mesh.material.textureLayers.every(layer => (
		layer.repeat[0] === GAME_HIGH_REPEAT[0] && layer.repeat[1] === GAME_HIGH_REPEAT[1]
	)));
	// The caller's sampling policy survives; the Core covenant still wins where it must.
	// (texturePolicy.semanticRole reads 'terrain.layered': createLayeredTerrainMaterial's
	// top-level semanticRole default wins over the cinematic policy inside
	// createTexturePolicy — pre-existing Core behavior, unchanged by this fix.)
	assert.equal(mesh.material.texturePolicy.colorSpace, 'srgb');
	assert.equal(mesh.material.texturePolicy.minFilter, 'LinearMipmapLinear');
	assert.equal(mesh.material.texturePolicy.mipmaps, true);
	assert.equal(mesh.material.texturePolicy.generatedTextureAllowed, false);
	assert.equal(mesh.material.texturePolicy.layerCount, 6);
	assert.equal(mesh.material.texturePolicy.semanticRole, 'terrain.layered');
	// The render-time layer state resolves the same repeat into the shader uniforms.
	await mesh.userData.awtsmoosReady;
	const state = layeredTextureState(mesh.material);
	assert.equal(state[0].role, 'meadow');
	assert.equal(state[0].repeat0, GAME_HIGH_REPEAT[0]);
	assert.equal(state[0].repeat1, GAME_HIGH_REPEAT[1]);
	assert.equal(state[0].ready, true);
});

test('low/mobile sampling flows through: anisotropy 4, map repeat 13.71', () => {
	const mesh = terrain({
		anisotropy: 4,
		mapRepeat: [...GAME_LOW_REPEAT],
		texturePolicy: { ...gameTexturePolicy, anisotropy: 4 }
	});
	assert.equal(mesh.material.anisotropy, 4);
	assert.deepEqual(mesh.material.textureLayers[0].repeat, GAME_LOW_REPEAT);
});

test('no sampling options keeps the historic Core defaults for every caller', () => {
	const mesh = terrain();
	assert.equal(mesh.material.anisotropy, 3);
	assert.deepEqual(mesh.material.mapRepeat, [1, 1]);
	assert.deepEqual(mesh.material.textureLayers[0].repeat, [5, 5]);
	assert.deepEqual(mesh.material.textureLayers[5].repeat, [10, 10]);
	assert.equal(mesh.material.texturePolicy.generatedTextureAllowed, false);
	assert.equal(mesh.material.texturePolicy.layerCount, 6);
	// Pre-existing: LayeredTerrainMaterial's top-level 'terrain.layered' default wins
	// over the cinematic policy inside createTexturePolicy (see the note above).
	assert.equal(mesh.material.texturePolicy.semanticRole, 'terrain.layered');
});

test('an invalid map repeat is ignored instead of breaking the material', () => {
	const mesh = terrain({
		anisotropy: 8,
		mapRepeat: [0, -3],
		texturePolicy: gameTexturePolicy
	});
	assert.deepEqual(mesh.material.mapRepeat, [1, 1]);
	assert.deepEqual(mesh.material.textureLayers[0].repeat, [5, 5]);
	assert.equal(mesh.material.anisotropy, 8);
});
