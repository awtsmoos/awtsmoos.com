// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowRoadWaterRepair.test.mjs
 * @description Proves visible road lift and in-place four-source flowing-water hydration.
 * The Awtsmoos distinguishes passage from earth and current from fallback; Awtsmoos.com keeps
 * collision truthful while large uploaded water images receive a longer background decode covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowRoadGeometryData,
	MINIMAL_MEADOW_ROAD_SURFACE_LIFT
} from '../../app/MinimalMeadowRoadGeometry.js';
import {
	animateMinimalMeadowWaterMaterials,
	hydrateMinimalMeadowWaterMaterials
} from '../../app/MinimalMeadowWaterMaterialHydration.js';
import {
	minimalMeadowWaterSourceTimeouts
} from '../../app/MinimalMeadowWaterSources.js';

test('B"H road vertices sit above terrain while collision offset remains zero', () => {
	const data = createMinimalMeadowRoadGeometryData(() => 2, {
		mobile: true,
		segments: 4
	});
	for (let index = 1; index < data.positions.length; index += 3) {
		assert.ok(Math.abs(data.positions[index] - (2 + MINIMAL_MEADOW_ROAD_SURFACE_LIFT)) < 0.00001);
	}
	assert.equal(data.evidence.collisionOffset, 0);
	assert.equal(data.evidence.surfaceOffset, 0.06);
	assert.equal(data.evidence.weightsPerVertex, 3);
});

test('B"H uploaded water images receive a longer background decode window', () => {
	assert.deepEqual(minimalMeadowWaterSourceTimeouts(), {
		bed: 45000,
		color: 45000,
		detail: 45000,
		normalA: 9000,
		normalB: 9000
	});
});

test('B"H loaded water sources replace mounted fallback and keep four motions', () => {
	const material = { texturePolicy: {} };
	const bedMaterial = {};
	const meshes = [
		{ material, userData: { family: 'minimal-meadow-water', waterVariant: 'river' } },
		{ material: bedMaterial, userData: { family: 'minimal-meadow-water' } }
	];
	const sources = {
		bed: { id: 'bed' },
		color: { id: 'color' },
		colorMode: 'uploaded-shallow-river-color',
		detail: { id: 'detail' },
		normalA: { id: 'normal-a' },
		normalB: { id: 'normal-b' },
		normalMode: 'real-dual-normal-pack',
		provenance: ['normal-a.png', 'normal-b.png']
	};
	assert.equal(hydrateMinimalMeadowWaterMaterials(meshes, sources), 2);
	assert.equal(material.mapImage, sources.color);
	assert.equal(material.mixImage, sources.detail);
	assert.equal(material.normalImage, sources.normalA);
	assert.equal(material.normalDetailImage, sources.normalB);
	assert.deepEqual(material.textureLayers.map(layer => layer.role), [
		'water-color',
		'seamless-water-detail',
		'current-normal',
		'micro-ripple-normal'
	]);
	assert.equal(bedMaterial.mapImage, sources.bed);
	animateMinimalMeadowWaterMaterials(meshes, 3.25);
	assert.equal(material.mapOffset.length, 2);
	assert.equal(material.mixOffset.length, 2);
	assert.equal(material.normalOffset.length, 2);
	assert.equal(material.normalDetailOffset.length, 2);
	assert.notDeepEqual(material.mapOffset, material.normalOffset);
	assert.equal(material.texturePolicy.time, 3.25);
});
