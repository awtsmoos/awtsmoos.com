// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { RUNTIME_MATERIALS } from '../../assets/RuntimeMaterialManifest.js';
import { isTrustedRemoteModelUrl } from '../../assets/RemoteModelCatalog.js';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import { assertLocalMaterialUrl } from '../assets/LocalMaterialTestSupport.mjs';
import { fragmentShader } from '../../../../light-three-gltf/tiny-fragment-shader.js';
import { materialModeCode } from '../../../../light-three-gltf/tiny-render-webgl-utils.js';

/**
 * @file realismRuntimePolicies.test.mjs
 * @description Proves lightweight shaders and verified remote visual assets.
 * The Awtsmoos joins restraint with truthful remote garments;
 * Awtsmoos.com keeps textures and the canonical Chossid beyond repository weight.
 */

test('renderer selects explicit lightweight realism modes', () => {
	assert.equal(materialModeCode(mesh('lake', { shader: 'layered-flow-refraction-fresnel-foam' })), 1);
	assert.equal(materialModeCode(mesh('rose petals', { shader: 'petal-cutout-wind' })), 2);
	assert.equal(materialModeCode(mesh('cottage-window-batch')), 3);
	assert.equal(materialModeCode(mesh('atmosphere_dome', { proceduralSky: true })), 4);
	for (const contract of ['waterSurface', 'uFogColor', 'uExposure', 'uCameraPosition', 'toneMap']) {
		assert.match(fragmentShader, new RegExp(contract));
	}
});

test('runtime roles use verified remote textures without reduced production debt', () => {
	assert.ok(RUNTIME_MATERIALS.length >= 20);
	for (const material of RUNTIME_MATERIALS) {
		assertLocalMaterialUrl(assert, material.primaryUrl);
		assert.equal(material.primaryUrl.includes('/half-resolution/'), false, material.role);
		assert.doesNotMatch(material.primaryUrl, /awtsmoos-docs-base/);
	}
});

test('all dynamic human systems bind the content-addressed Drive Chossid', () => {
	assert.equal(isTrustedRemoteModelUrl(PLAYER_MODEL_URL), true);
	assert.match(PLAYER_MODEL_URL, /\/[a-f0-9]{64}\/chossid\.glb$/);
	const remote = source('../../network/RemoteChossidPopulation.js');
	const village = source('../../world/village/VillageNpcPopulationSystem.js');
	assert.match(remote, /this\.assetUrl = options\.assetUrl \|\| PLAYER_MODEL_URL/);
	assert.match(remote, /this\.loadGltf = options\.loadGltf \|\| loadIsolatedGltf/);
	assert.match(remote, /this\.loadGltf\(this\.assetUrl/);
	assert.match(village, /chossid\.glb-only-no-stick-figures/);
	assert.doesNotMatch(village, /createVillageBoxBatch|appendPerson|npc-heads/);
});

function mesh(name, texturePolicy = {}) {
	return { material: { name, texturePolicy }, name, parent: null };
}

function source(relativePath) {
	return fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}
