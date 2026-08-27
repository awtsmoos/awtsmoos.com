// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowRemoteTerrainMaterial.test.mjs
 * @description Proves canonical Awtsmoos Drive URLs, terrain roles, and measured visual density.
 * The Awtsmoos gives meadow and road distinct remote garments; Awtsmoos.com preserves source
 * identity and path encoding while fallback colors keep first motion independent of network work.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES,
	MINIMAL_MEADOW_TEXTURE_FILENAMES,
	minimalMeadowTextureTransportEvidence
} from '../../app/MinimalMeadowAwtsmoosDriveTextures.js';
import {
	minimalMeadowTerrainDensityProfile
} from '../../app/MinimalMeadowTerrainMaterialDensity.js';
import {
	minimalMeadowTerrainSourceRoles
} from '../../app/MinimalMeadowTerrainSources.js';
import {
	createMinimalMeadowRoadRibbon
} from '../../app/MinimalMeadowRoadRibbon.js';

function image(name) {
	return {
		height: 4096,
		name,
		naturalHeight: 4096,
		naturalWidth: 4096,
		width: 4096
	};
}

test('B"H meadow roles use remote grass, dirt, and cobblestone sources', () => {
	assert.equal(MINIMAL_MEADOW_TEXTURE_FILENAMES.grassFour, 'grass 4.png');
	assert.equal(MINIMAL_MEADOW_TEXTURE_FILENAMES.dirtGrassSix, 'dirt grass 6.png');
	assert.equal(MINIMAL_MEADOW_TEXTURE_FILENAMES.soilDark, 'dirt 2.png');
	assert.equal(MINIMAL_MEADOW_TEXTURE_FILENAMES.roadCobblestone, 'cobblestone.png');
	assert.equal(
		MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES.dirtGrassSix,
		'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/dirt%20grass%206.png'
	);
	assert.equal(
		MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES.roadCobblestone,
		'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/cobblestone.png'
	);
	assert.doesNotMatch(
		JSON.stringify(MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES),
		/assets\/materials\/local|firebasestorage\.googleapis/
	);
	assert.deepEqual(minimalMeadowTextureTransportEvidence(), {
		fallbackAssetFiles: 0,
		origin: 'https://awtsmoos.com',
		path: '/sites/firebase_drive_migration/full-resolution/',
		policy: 'remote-authoritative-fallback-colors-only',
		roles: 14,
		uniqueUrls: 13
	});
	const roles = minimalMeadowTerrainSourceRoles({
		dirtGrassThree: image('shoulder'),
		grassFour: image('grass'),
		roadCobblestone: image('road'),
		soilDark: image('soil')
	});
	assert.equal(roles.main.name, 'grass');
	assert.equal(roles.path.name, 'road');
	assert.equal(roles.pathEdge.name, 'shoulder');
	assert.equal(roles.mud.name, 'soil');
});

test('B"H grass is enlarged and road repeats one full tile across with many along', () => {
	assert.deepEqual(minimalMeadowTerrainDensityProfile(true), {
		detail: 38,
		grass: 32,
		mobile: true,
		road: 68
	});
	assert.deepEqual(minimalMeadowTerrainDensityProfile(false), {
		detail: 48,
		grass: 40,
		mobile: false,
		road: 84
	});
	const road = createMinimalMeadowRoadRibbon({
		centerImage: image('cobblestone'),
		heightAt: () => 0,
		mobile: true,
		shoulderImage: image('dirt-grass'),
		soilImage: image('dirt')
	});
	assert.deepEqual(
		road.material.textureLayers.map(layer => layer.role),
		['cobblestone-center', 'dirt-grass-shoulder', 'open-dirt-transition']
	);
	assert.ok(road.material.mapRepeat[0] >= 1);
	assert.ok(road.material.mapRepeat[1] > 1);
	assert.deepEqual(road.material.mapRepeat, road.userData.AwtsmoosRoad.repeat);
});
