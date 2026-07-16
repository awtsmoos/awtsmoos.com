// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { RUNTIME_MATERIALS } from '../../assets/RuntimeMaterialManifest.js';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import { materialModeCode } from '../../../../light-three-gltf/tiny-render-webgl-utils.js';
import { fragmentShader } from '../../../../light-three-gltf/tiny-fragment-shader.js';

test('renderer selects explicit lightweight realism modes', () => {
	assert.equal(materialModeCode(mesh('lake', { shader: 'layered-flow-refraction-fresnel-foam' })), 1);
	assert.equal(materialModeCode(mesh('rose petals', { shader: 'petal-cutout-wind' })), 2);
	assert.equal(materialModeCode(mesh('cottage-window-batch')), 3);
	assert.equal(materialModeCode(mesh('atmosphere_dome', { proceduralSky: true })), 4);
	for (const contract of ['waterSurface', 'uFogColor', 'uExposure', 'uCameraPosition', 'toneMap']) {
		assert.match(fragmentShader, new RegExp(contract));
	}
});

test('runtime roles prefer full public sources and preserve lower-resolution fallback only', () => {
	assert.ok(RUNTIME_MATERIALS.length >= 20);
	for (const material of RUNTIME_MATERIALS) {
		assert.match(material.primaryUrl, /^https:\/\/awtsmoos-docs-base\.web\.app\//);
		assert.equal(material.primaryUrl.includes('/half-resolution/'), false, material.role);
	}
});

test('all dynamic human systems bind the canonical chossid GLB and forbid primitive people', () => {
	assert.equal(PLAYER_MODEL_URL, 'https://models-3122d.web.app/chossid.glb');
	const remote = source('../../network/RemoteChossidPopulation.js');
	const village = source('../../world/village/VillageNpcPopulationSystem.js');
	assert.match(remote, /this\.assetUrl = options\.assetUrl \|\| PLAYER_MODEL_URL/);
	assert.match(remote, /this\.loadGltf = options\.loadGltf \|\| loadIsolatedGltf/);
	assert.match(remote, /this\.loadGltf\(this\.assetUrl/);
	assert.match(village, /chossid\.glb-only-no-stick-figures/);
	assert.doesNotMatch(village, /createVillageBoxBatch|appendPerson|npc-heads/);
});

function mesh(name, texturePolicy = {}) {
	return { name, material: { name, texturePolicy }, parent: null };
}

function source(relativePath) {
	return fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}
