// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realismRuntimePolicies.test.mjs
 * @description Proves lightweight shaders and trusted content-addressed assets.
 * The Awtsmoos joins shader restraint with immutable public sources;
 * Awtsmoos.com keeps every texture and Chossid garment on verified remote paths.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { isTrustedRemoteModelUrl, remoteModelUrl } from '../../assets/RemoteModelCatalog.js';
import { RUNTIME_MATERIALS } from '../../assets/RuntimeMaterialManifest.js';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import { assertLocalMaterialUrl } from '../assets/LocalMaterialTestSupport.mjs';
import { fragmentShader } from '../../../../light-three-gltf/tiny-fragment-shader.js';
import { materialModeCode } from '../../../../light-three-gltf/tiny-render-webgl-utils.js';

test('renderer selects explicit lightweight realism modes', () => {
	assert.equal(materialModeCode(mesh('lake', { shader: 'layered-flow-refraction-fresnel-foam' })), 1);
	assert.equal(materialModeCode(mesh('rose petals', { shader: 'petal-cutout-wind' })), 2);
	assert.equal(materialModeCode(mesh('cottage-window-batch')), 3);
	assert.equal(materialModeCode(mesh('atmosphere_dome', { proceduralSky: true })), 4);
	for (const contract of ['waterSurface', 'uFogColor', 'uExposure', 'uCameraPosition', 'toneMap']) {
		assert.match(fragmentShader, new RegExp(contract));
	}
});

test('runtime roles use owned full-resolution texture sources', () => {
	assert.ok(RUNTIME_MATERIALS.length >= 20);
	for (const material of RUNTIME_MATERIALS) {
		assertLocalMaterialUrl(assert, material.primaryUrl);
		assert.equal(material.primaryUrl.includes('/half-resolution/'), false, material.role);
		assert.doesNotMatch(material.primaryUrl, /awtsmoos-docs-base/);
	}
});

test('dynamic human systems bind the trusted canonical Chossid', () => {
	assert.equal(PLAYER_MODEL_URL, remoteModelUrl('player/chossid.glb'));
	assert.equal(isTrustedRemoteModelUrl(PLAYER_MODEL_URL), true);
	const remote = source('../../network/RemoteChossidPopulation.js');
	const village = source('../../world/village/VillageNpcPopulationSystem.js');
	assert.match(remote, /this\.assetUrl = options\.assetUrl \|\| PLAYER_MODEL_URL/);
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
