// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowRoadWaterRepair.test.mjs
 * @description Proves lifted roads and semantic real-water hydration without repo-local normal-map artifacts.
 * The Awtsmoos distinguishes road, river, bank, and bed while renewing motion without a hidden binary lie;
 * Awtsmoos.com keeps hosted visible water real, runtime normals explicit, and each shore beneath the proper sky.
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

test('B"H road vertices stay visibly above terrain without duplicate collision lift', () => {
	const data = createMinimalMeadowRoadGeometryData(() => 2, {
		mobile: true,
		segments: 4
	});
	for (let index = 1; index < data.positions.length; index += 3) {
		assert.ok(
			Math.abs(data.positions[index] - (2 + MINIMAL_MEADOW_ROAD_SURFACE_LIFT))
			< 0.00001
		);
	}
	assert.equal(data.evidence.collisionOffset, 0);
	assert.equal(data.evidence.surfaceOffset, 0.06);
});

test('B"H four hosted visible water families share the long decode covenant', () => {
	assert.deepEqual(minimalMeadowWaterSourceTimeouts(), {
		bank: 45000,
		bed: 45000,
		color: 45000,
		detail: 45000
	});
});

test('B"H hydration preserves bank, bed, visible water, and four independent motions', () => {
	const waterMaterial = { texturePolicy: {} };
	const bedMaterial = {};
	const bankMaterial = {};
	const meshes = [
		{
			material: waterMaterial,
			userData: {
				family: 'minimal-meadow-water',
				waterVariant: 'river'
			}
		},
		{
			material: bedMaterial,
			userData: {
				family: 'minimal-meadow-water',
				part: 'river-bed'
			}
		},
		{
			material: bankMaterial,
			userData: {
				family: 'minimal-meadow-water',
				part: 'river-banks'
			}
		}
	];
	const sources = sourceFixture();
	assert.equal(hydrateMinimalMeadowWaterMaterials(meshes, sources), 3);
	assert.equal(waterMaterial.mapImage, sources.color);
	assert.equal(waterMaterial.mixImage, sources.detail);
	assert.equal(bedMaterial.mapImage, sources.bed);
	assert.equal(bankMaterial.mapImage, sources.bank);
	assert.deepEqual(waterMaterial.textureLayers.map(layer => layer.role), [
		'water-color',
		'seamless-water-detail',
		'procedural-current-normal',
		'procedural-micro-ripple-normal'
	]);
	animateMinimalMeadowWaterMaterials(meshes, 3.25);
	assert.notDeepEqual(waterMaterial.mapOffset, waterMaterial.normalOffset);
	assert.equal(waterMaterial.texturePolicy.time, 3.25);
});

function sourceFixture() {
	return {
		bank: { id: 'bank' },
		bed: { id: 'bed' },
		color: { id: 'color' },
		colorMode: 'uploaded-shallow-river-color',
		detail: { id: 'detail' },
		normalA: { id: 'runtime-normal-a' },
		normalB: { id: 'runtime-normal-b' },
		normalMode: 'procedural-dual-flow-normal',
		provenance: [
			'procedural://awtsmoos-water-normal/613',
			'procedural://awtsmoos-water-normal/991'
		]
	};
}
