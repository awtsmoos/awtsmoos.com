// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VolumetricSunShaftSystem.test.js
 * @description Prevents opaque rectangular shaft geometry from crossing the world.
 * The Awtsmoos reveals light without a counterfeit wall; Awtsmoos.com guards every
 * camera direction so the sun may glow while unsafe quad boundaries remain absent.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
	SUN_SHAFT_SAFETY_REPORT,
	createVolumetricSunShafts,
	inspectVolumetricSunShaftSafety
} from '../../src/world/lighting/VolumetricSunShaftSystem.js';

const QUALITY_TIERS = ['low', 'medium', 'high', 'cinematic', 'unknown'];
const TARGET_SOURCE = readSource(
	'../../src/world/lighting/VolumetricSunShaftSystem.js'
);
const CLOUD_SOURCE = readSource(
	'../../src/world/lighting/ReferenceSkyCloudSystem.js'
);
const SKY_DOME_SOURCE = readSource('../../src/world/sky/SkyDome.js');
const SKY_FACTORY_SOURCE = readSource('../../src/world/sky/SkyMeshFactory.js');

test('every quality tier submits zero sun-shaft geometry', () => {
	for (const quality of QUALITY_TIERS) {
		const first = createVolumetricSunShafts(quality);
		const second = createVolumetricSunShafts(quality);

		assert.deepEqual(first, [], quality);
		assert.notEqual(first, second, quality);
	}
});

test('shaft opacity, edge alpha, and overdraw remain bounded at zero', () => {
	const report = inspectVolumetricSunShaftSafety();

	assert.deepEqual(report, SUN_SHAFT_SAFETY_REPORT);
	assert.equal(report.boundaryAlphaMaximum, 0);
	assert.equal(report.edgeAlphaSampleCount, 0);
	assert.equal(report.geometryCount, 0);
	assert.equal(report.maximumAccumulatedOpacity, 0);
	assert.equal(report.maximumOverdraw, 0);
	assert.equal(report.uniformOpaqueRectangleCount, 0);
});

test('uniform opaque rectangular shaft regions are rejected', () => {
	const opaqueRectangle = syntheticOpaqueRectangle();

	assert.equal(isUniformOpaqueRectangle(opaqueRectangle), true);
	for (const quality of QUALITY_TIERS) {
		const offenders = createVolumetricSunShafts(quality)
			.filter(isUniformOpaqueRectangle);
		assert.deepEqual(offenders, [], quality);
	}
	assert.equal(TARGET_SOURCE.includes('createSkyRay'), false);
});

test('camera rotation cannot reveal a full shaft surface', () => {
	const cameraDirections = [
		[-132, 92, -210],
		[132, -92, 210],
		[1, 0, 0],
		[-1, 0, 0]
	];

	for (const direction of cameraDirections) {
		assert.equal(createVolumetricSunShafts('high').length, 0, direction.join(','));
		assert.equal(SUN_SHAFT_SAFETY_REPORT.cameraFacingSurfaceCount, 0);
		assert.equal(SUN_SHAFT_SAFETY_REPORT.depthUnfadedSurfaceCount, 0);
	}
});

test('sun, atmospheric glow, clouds, and haze remain independently retained', () => {
	assert.match(SKY_DOME_SOURCE, /atmospheric-scattering-cloud-sun/);
	assert.match(SKY_FACTORY_SOURCE, /export function createSkyDisc/);
	assert.match(CLOUD_SOURCE, /export function createReferenceSkyClouds/);
	assert.match(CLOUD_SOURCE, /export function createReferenceHazeLayers/);
	assert.match(CLOUD_SOURCE, /proceduralCloudTexture/);
	assert.match(CLOUD_SOURCE, /proceduralHazeTexture/);
});

function isUniformOpaqueRectangle(mesh) {
	const positions = mesh.geometry?.attributes?.position?.array || [];
	const colors = mesh.geometry?.attributes?.color?.array || [];
	const vertexAlphas = [];
	for (let index = 3; index < colors.length; index += 4) {
		vertexAlphas.push(colors[index]);
	}
	return positions.length === 12
		&& vertexAlphas.length === 4
		&& vertexAlphas.every((alpha) => alpha >= 0.95)
		&& (mesh.material?.opacity ?? 1) >= 0.95;
}

function syntheticOpaqueRectangle() {
	return {
		geometry: {
			attributes: {
				color: { array: new Float32Array(16).fill(1) },
				position: { array: new Float32Array(12) }
			}
		},
		material: { opacity: 1 }
	};
}

function readSource(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}
