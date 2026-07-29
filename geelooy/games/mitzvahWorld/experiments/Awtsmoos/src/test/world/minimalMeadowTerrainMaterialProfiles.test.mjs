// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTerrainMaterialProfiles.test.mjs
 * @description Proves measured native-pixel frequency, six ecological sources, and one visible road.
 * The Awtsmoos gives desktop and phone one meadow through bounded vessels; Awtsmoos.com
 * prevents blur, arbitrary stretching, hidden passage, and duplicate collision authority.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	createMinimalMeadowTerrainComposites
} from '../../app/MinimalMeadowTerrainComposites.js';
import {
	configureMinimalTerrainDensity,
	minimalMeadowTerrainDensityProfile
} from '../../app/MinimalMeadowTerrainMaterialDensity.js';
import { villageRoadStack } from '../../world/materials/RoadMaterialStackPreset.js';
import { mountainTerrainStack } from '../../world/materials/TerrainMaterialStackPreset.js';

const sourceImage = role => Object.freeze({
	height: 2048,
	naturalHeight: 2048,
	naturalWidth: 2048,
	role,
	width: 2048
});

const images = Object.freeze({
	cobblestone: sourceImage('cobblestone'),
	dirtGrassOne: sourceImage('dirt-grass-one'),
	dirtGrassThree: sourceImage('dirt-grass-three'),
	grassEight: sourceImage('grass-eight'),
	grassFive: sourceImage('grass-five'),
	grassFour: sourceImage('grass-four'),
	grassOne: sourceImage('grass-one'),
	grassSeven: sourceImage('grass-seven'),
	marshGrass: sourceImage('marsh-grass'),
	pathCenter: sourceImage('path-center'),
	soilDark: sourceImage('soil-dark'),
	soilLight: sourceImage('soil-light'),
	tilledSoil: sourceImage('tilled-soil')
});

test('independent sources replace canvas mosaics', () => {
	const composites = createMinimalMeadowTerrainComposites(images, null);
	assert.equal(composites.evidence.compositeCanvases, 0);
	assert.equal(composites.evidence.mosaic, false);
	assert.equal(composites.evidence.resampled, false);
	assert.ok(composites.evidence.independentSourceCount >= 6);
});

test('mobile and desktop derive measured native frequency from source pixels', () => {
	const sources = createMinimalMeadowTerrainComposites(images, null);
	for (const mobile of [false, true]) {
		const material = {};
		const profile = minimalMeadowTerrainDensityProfile(mobile);
		const density = configureMinimalTerrainDensity(material, sources, 220, mobile);
		const expectedRepeat = 220 * profile.grass / 2048;
		assert.equal(material.textureLayers.length, 6);
		assert.equal(material.textureLayers[3].role, 'road-shoulder');
		assert.equal(density.profile.grass, profile.grass);
		assert.equal(material.texturePolicy.nativeTexelDensity, true);
		assert.equal(material.texturePolicy.exactFractionalRepeat, true);
		assert.equal(
			material.texturePolicy.repetitionPolicy,
			'full-resolution-authored-macro-scale'
		);
		assert.ok(
			Math.abs(material.texturePolicy.repeatAcrossWorld[0] - expectedRepeat)
			< 0.00001
		);
		assert.ok(density.layerReports.every(report => {
			return report.sourceWorldUnits.tileWorld.every(Number.isFinite)
				&& report.texelsPerWorld === density.profile.detail;
		}));
	}
	assert.deepEqual(minimalMeadowTerrainDensityProfile(true), {
		detail: 38,
		grass: 32,
		mobile: true,
		road: 68
	});
});

test('terrain and road presets use six broad rotated sources', () => {
	for (const recipe of [mountainTerrainStack(), villageRoadStack()]) {
		assert.equal(recipe.layers.length, 6);
		assert.ok(recipe.layers.every(layer => Math.max(...layer.repeat) <= 8));
		assert.ok(new Set(recipe.layers.map(layer => layer.angle)).size >= 5);
	}
});

test('package mounts a visible road while terrain owns collision', async () => {
	const packageUrl = new URL('../../app/MinimalMeadowTerrainPackage.js', import.meta.url);
	const mountUrl = new URL('../../app/MinimalMeadowTerrainRoadMount.js', import.meta.url);
	const [packageSource, mountSource] = await Promise.all([
		readFile(packageUrl, 'utf8'),
		readFile(mountUrl, 'utf8')
	]);
	assert.match(packageSource, /visible:\s*true/);
	assert.match(packageSource, /mountMinimalMeadowTerrainRoad\(group, road\)/);
	assert.match(packageSource, /visible-bezier-road/);
	assert.match(mountSource, /visualOnly:\s*true/);
	assert.match(mountSource, /terrain-height-sampler/);
	assert.match(mountSource, /frustumCulled\s*=\s*false/);
});
