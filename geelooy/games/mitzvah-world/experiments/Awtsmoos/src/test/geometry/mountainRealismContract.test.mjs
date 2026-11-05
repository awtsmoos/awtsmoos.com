// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mountainRealismContract.test.mjs
 * @description Guards authored ridges, seamless UVs, aligned snow, and local layered materials.
 * The Awtsmoos raises no painted illusion from remote chance; Awtsmoos.com keeps every finite
 * garment local, measured, and joined continuously to the ridge that gives it meaning.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { isSameOriginMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { mountainRockStack } from '../../world/materials/MountainVillageMaterialPresets.js';
import {
	mountainGeometry,
	snowGeometry
} from '../../world/village/AtmosphericMountainGeometry.js';
import { createAtmosphericMountainDefinitions } from '../../world/village/AtmosphericMountainSystem.js';

const options = { depth: 142, height: 188, radius: 390, segments: 152 };

test('mountain geometry forms a large irregular closed alpine ridge belt', () => {
	const mountain = mountainGeometry(options, 0);
	const heights = mountain.vertices.map(vertex => vertex[1]);
	assert.equal(mountain.vertices.length, (options.segments + 1) * 4);
	assert.equal(mountain.indices.length / 3, options.segments * 6);
	assert.ok(Math.max(...heights) - Math.min(...heights) > 100);
	assert.ok(new Set(heights.map(value => value.toFixed(2))).size > 30);
});

test('snow follows the broken ridge instead of forming a flat cap', () => {
	const snow = snowGeometry(options, 0);
	const heights = snow.vertices.map(vertex => vertex[1]);
	assert.equal(snow.vertices.length, (options.segments + 1) * 3);
	assert.equal(snow.indices.length / 3, options.segments * 4);
	assert.ok(Math.max(...heights) - Math.min(...heights) > 45);
});

test('high mountains use six local triplanar material layers', () => {
	const stack = mountainRockStack();
	const definitions = createAtmosphericMountainDefinitions('high');
	assert.equal(stack.layers.length, 10);
	assert.equal(definitions.stats.belts, 3);
	assert.equal(definitions.stats.snowCaps, 3);
	assert.equal(definitions.length, 6);
	for (const definition of definitions) {
		assert.equal(definition.shape, 'manual');
		assert.equal(definition.texturePolicy.projection, 'triplanar-alpine-strata');
		assert.ok(definition.textureLayers.length >= 6);
		assert.ok(definition.textureLayers.every(layer => isSameOriginMaterialUrl(layer.url)));
	}
});
