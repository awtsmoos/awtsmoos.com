// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTerrainVisualQuality.test.mjs
 * @description Guards native detail, six ecological identities, zones, and road mounting.
 * The Awtsmoos reveals one meadow through distinct finite garments; Awtsmoos.com prevents
 * blur, arbitrary stretching, green monotony, hidden roads, and collision duplication.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	minimalMeadowLayerDefinitions
} from '../../app/MinimalMeadowTerrainDensityLayers.js';
import {
	minimalMeadowTerrainDensityProfile
} from '../../app/MinimalMeadowTerrainMaterialDensity.js';
import {
	mountMinimalMeadowTerrainRoad
} from '../../app/MinimalMeadowTerrainRoadMount.js';
import { minimalMeadowZoneWeight } from '../../world/TerrainMesh.js';

test('B"H mobile terrain preserves full native source quality', () => {
	const mobile = minimalMeadowTerrainDensityProfile(true);
	const desktop = minimalMeadowTerrainDensityProfile(false);
	assert.deepEqual(mobile, {
		detail: 64,
		grass: 72,
		mobile: true,
		road: 80
	});
	assert.deepEqual(desktop, {
		detail: 84,
		grass: 96,
		mobile: false,
		road: 112
	});
	assert.ok(desktop.detail > mobile.detail);
	assert.ok(desktop.grass > mobile.grass);
	assert.ok(desktop.road > mobile.road);
});

test('B"H six ecological sources retain strong nonuniform identities', () => {
	const layers = minimalMeadowLayerDefinitions(sourceVessel());
	assert.deepEqual(layers.map(layer => layer.role), [
		'lush-grass',
		'meadow-grass',
		'open-soil',
		'road-shoulder',
		'moss-and-wet-grass',
		'dry-ground'
	]);
	assert.ok(layers.every(layer => layer.strength >= 0.66));
	assert.equal(new Set(layers.map(layer => layer.image)).size, 6);
	assert.equal(
		layers.find(layer => layer.role === 'road-shoulder').strength,
		1
	);
	assert.ok(
		layers.find(layer => layer.role === 'moss-and-wet-grass').zones[2]
		>= 0.9
	);
});

test('B"H terrain zone weights distinguish road, wetness, dryness, and rock', () => {
	const road = minimalMeadowZoneWeight('meadow-road', 0.8);
	const wet = minimalMeadowZoneWeight('wet-meadow');
	const dry = minimalMeadowZoneWeight('meadow-dry-grass');
	const rock = minimalMeadowZoneWeight('alpine-rock');
	assert.ok(road[1] >= 0.8);
	assert.ok(wet[2] >= 0.66);
	assert.ok(dry[3] >= 0.22);
	assert.ok(rock[3] >= 0.9);
	assert.equal(new Set([road, wet, dry, rock].map(JSON.stringify)).size, 4);
});

test('B"H visible road mounts without becoming collision authority', () => {
	const group = new Group();
	const road = new Group();
	road.visible = false;
	road.frustumCulled = true;
	road.userData.AwtsmoosRoad = {};
	const receipt = mountMinimalMeadowTerrainRoad(group, road);
	assert.equal(road.parent, group);
	assert.equal(road.visible, true);
	assert.equal(road.frustumCulled, false);
	assert.equal(receipt.mounted, true);
	assert.equal(receipt.visualOnly, true);
	assert.equal(receipt.collisionAuthority, 'terrain-height-sampler');
});

function sourceVessel() {
	return {
		dry: { id: 'dry' },
		lush: { id: 'lush' },
		marsh: { id: 'marsh' },
		pathEdge: { id: 'path-edge' },
		secondary: { id: 'secondary' },
		soil: { id: 'soil' }
	};
}
