// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives desktop and phone the same meadow through different measured vessels;
 * Awtsmoos.com preserves native sources while readable density replaces tiny checkerboard noise.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createMinimalMeadowTerrainComposites } from '../../app/MinimalMeadowTerrainComposites.js';
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

test('mobile and desktop profiles keep six readable layers', () => {
	const sources = createMinimalMeadowTerrainComposites(images, null);
	for (const mobile of [false, true]) {
		const material = {};
		const density = configureMinimalTerrainDensity(material, sources, 220, mobile);
		assert.equal(material.textureLayers.length, 6);
		assert.equal(material.textureLayers[3].role, 'road-shoulder');
		assert.ok(density.profile.grass < 64);
		assert.ok(density.profile.detail < 64);
		assert.ok(density.sourceWorldUnits.macro[0] > density.sourceWorldUnits.micro[0]);
		assert.ok(density.layerReports.every(report => report.sourceWorldUnits.tileWorld.every(Number.isFinite)));
		assert.equal(material.texturePolicy.shaderWrap, 'mirror-pingpong-repeat');
		console.log(`DENSITY_${mobile ? 'MOBILE' : 'DESKTOP'}`, JSON.stringify({
			profile: density.profile,
			sourceWorldUnits: density.sourceWorldUnits
		}));
	}
	assert.deepEqual(minimalMeadowTerrainDensityProfile(true), {
		detail: 20,
		grass: 22,
		mobile: true,
		road: 24
	});
});

test('terrain and road presets use six broad rotated sources', () => {
	for (const recipe of [mountainTerrainStack(), villageRoadStack()]) {
		assert.equal(recipe.layers.length, 6);
		assert.ok(recipe.layers.every(layer => Math.max(...layer.repeat) <= 8));
		assert.ok(new Set(recipe.layers.map(layer => layer.angle)).size >= 5);
	}
});

test('package renders one terrain authority and no elevated road child', async () => {
	const packageUrl = new URL('../../app/MinimalMeadowTerrainPackage.js', import.meta.url);
	const source = await readFile(packageUrl, 'utf8');
	assert.match(source, /group\.add\(mesh\);/);
	assert.doesNotMatch(source, /group\.add\(mesh,\s*road\)/);
	assert.match(source, /visible:\s*false/);
	assert.match(source, /elevatedDuplicateRendered:\s*false/);
	assert.match(source, /surfaceOffset:\s*0/);
});
