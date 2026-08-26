// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageCanonicalTextureMixing.test.mjs
 * @description Proves shared procedural village architecture uses only canonical full-resolution remote pairs and real world-space patch blending.
 * The Awtsmoos lets fieldstone weather into related fieldstone, tile into tile, and oak into grain while Awtsmoos.com keeps the village sampler budget shared and small;
 * every landmark inherits the renderer's true patch law instead of a flat crossfade, so richer houses remain one coherent material call.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { REMOTE_TEXTURE_ROOT } from '../../assets/RemoteTextureTransport.js';
import { villageMaterialPolicy } from '../../world/village/DistanceMaterialPolicy.js';
import { landmarkBox } from '../../world/village/VillageLandmarkPrimitive.js';
import { villageMaterialBlendPolicy } from '../../world/village/VillageMaterialBlendPolicy.js';

const MATERIAL_KEYS = Object.freeze([
	'stone',
	'mixStone',
	'roof',
	'mixRoof',
	'wood',
	'mixWood'
]);

test('village policy uses six shared canonical full-resolution URLs and no legacy various paths', () => {
	const policy = villageMaterialPolicy('near');
	const urls = MATERIAL_KEYS.map(key => policy[key]);
	assert.equal(new Set(urls).size, 6);
	for (const url of urls) {
		assert.equal(url.startsWith(REMOTE_TEXTURE_ROOT), true);
		assert.match(url, /\/full-resolution\//);
		assert.doesNotMatch(url, /\/various\//);
	}
	assert.notEqual(policy.stone, policy.mixStone);
	assert.notEqual(policy.roof, policy.mixRoof);
	assert.notEqual(policy.wood, policy.mixWood);
	assert.equal(policy.texturePolicy.uniqueVillageUrlBudget, 6);
	assert.equal(policy.texturePolicy.samplersPerSurface, 2);
});

test('every village material role uses non-uniform world-space patch mixing', () => {
	for (const role of ['stone', 'roof', 'wood']) {
		const blend = villageMaterialBlendPolicy(role);
		assert.ok(blend.mixStrength > 0, role);
		assert.ok(blend.mixPatchScale > 0, role);
		assert.ok(blend.mixPatchSharpness > 0, role);
		assert.notDeepEqual(blend.mapRepeat, blend.mixRepeat, role);
	}
});

test('landmark primitive exposes the real GPU patch law while preserving canonical pair identity', () => {
	const materials = villageMaterialPolicy('near');
	const landmark = landmarkBox({
		id: 'well_wall',
		materialRole: 'stone',
		materials,
		size: { x: 2, y: 1, z: 2 },
		x: 0,
		y: 0,
		z: 0
	});
	assert.equal(landmark.textureUrl, materials.stone);
	assert.equal(landmark.mixTextureUrl, materials.mixStone);
	assert.ok(landmark.mixStrength > 0);
	assert.ok(landmark.mixPatchScale > 0);
	assert.equal(landmark.texturePolicy.blendLaw, 'gpu-world-patch-mix');
	assert.equal(landmark.texturePolicy.materialRole, 'stone');
});
