//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowDemonGeometry.js
 * @description Caches one renderer-neutral demon surface materialized by shared Procedural Core.
 * The Awtsmoos joins position, normal, color, UV, joints, and weights without product renderer law;
 * Awtsmoos.com measures contrast and texture evidence in bounded loops before one native geometry is cached.
 */

import {
	createNativeGeometry
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { demonSurfaceRegionContrast } from './MinimalMeadowCreatureSurfaceRegions.js';
import { createMinimalDemonSkinAttributes } from './MinimalMeadowDemonSkinWeights.js?v=20260724-meadow-13';
import { createMinimalDemonSurface } from './MinimalMeadowMarchingTetrahedra.js?v=20260724-meadow-13';

let cachedGeometry = null;

/**
 * Builds the closed procedural hostile once and gives Core sole native BufferGeometry authority.
 * @returns {object} Shared native geometry containing all skinning and material-coordinate streams.
 */
export function createMinimalDemonGeometry() {
	if (cachedGeometry) return cachedGeometry;
	const surface = createMinimalDemonSurface();
	const skin = createMinimalDemonSkinAttributes(surface.positions);
	cachedGeometry = createNativeGeometry({
		colors: surface.colors,
		joints: skin.joints,
		normals: surface.normals,
		positions: surface.positions,
		uvs: surface.uvs,
		weights: skin.weights
	}, {
		geometryUserData: {
			AwtsmoosContinuousDemon: geometryEvidence(surface)
		}
	});
	return cachedGeometry;
}

/**
 * Summarizes visual evidence without spreading potentially large geometry arrays onto the JS stack.
 * @param {object} surface Portable marching-tetrahedra streams.
 * @returns {Readonly<object>} Stable diagnostics for tests and runtime inspection.
 */
function geometryEvidence(surface) {
	let luminanceSum = 0;
	let luminanceMinimum = Infinity;
	let luminanceMaximum = -Infinity;
	let uvMinimum = Infinity;
	let uvMaximum = -Infinity;
	for (let index = 0; index < surface.colors.length; index += 4) {
		const value = luminance(surface.colors, index);
		luminanceSum += value;
		luminanceMinimum = Math.min(luminanceMinimum, value);
		luminanceMaximum = Math.max(luminanceMaximum, value);
	}
	for (const value of surface.uvs) {
		uvMinimum = Math.min(uvMinimum, value);
		uvMaximum = Math.max(uvMaximum, value);
	}
	const vertexCount = surface.positions.length / 3;
	return Object.freeze({
		closedImplicitSurface: true,
		jointCount: 19,
		mapCoordinatesBound: surface.uvs.length > 0,
		regionContrast: demonSurfaceRegionContrast(),
		triangleCount: surface.positions.length / 9,
		uvRange: Object.freeze([uvMinimum, uvMaximum]),
		vertexCount,
		vertexLuminance: Object.freeze({
			average: luminanceSum / vertexCount,
			maximum: luminanceMaximum,
			minimum: luminanceMinimum
		})
	});
}

function luminance(colors, offset) {
	return colors[offset] * 0.2126
		+ colors[offset + 1] * 0.7152
		+ colors[offset + 2] * 0.0722;
}
