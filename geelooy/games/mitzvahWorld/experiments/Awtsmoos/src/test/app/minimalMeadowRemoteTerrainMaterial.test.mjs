// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowRemoteTerrainMaterial.test.mjs
 * @description Proves larger full-resolution grass, dirt transitions, and real cobblestone road roles.
 * The Awtsmoos gives meadow and road distinct visible garments; Awtsmoos.com keeps source pixels
 * whole while measured world density prevents tiny grass repetition and one stretched road image.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MINIMAL_MEADOW_TEXTURE_FILENAMES
} from '../../app/MinimalMeadowFirebaseTextures.js';
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

test('B"H meadow roles use grass, dirt-grass, soil, and cobblestone filenames', () => {
	assert.equal(MINIMAL_MEADOW_TEXTURE_FILENAMES.grassFour, 'grass 4.png');
	assert.equal(MINIMAL_MEADOW_TEXTURE_FILENAMES.dirtGrassThree, 'dirt grass 3.png');
	assert.equal(MINIMAL_MEADOW_TEXTURE_FILENAMES.soilDark, 'dirt 2.png');
	assert.equal(MINIMAL_MEADOW_TEXTURE_FILENAMES.roadCobblestone, 'cobblestone.png');
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
