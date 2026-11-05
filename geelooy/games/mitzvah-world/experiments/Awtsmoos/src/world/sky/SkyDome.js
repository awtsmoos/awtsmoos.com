//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file SkyDome.js
 * @description Preserves the historical MitzvahWorld sky-dome doorway while delegating all atmosphere rendering to Procedural Core.
 * Radius and subdivision intent remain compatible for old semantic callers, but game code no longer manufactures sphere vertices,
 * normals, UVs, indices, materials, or shader metadata; the shared Core atmosphere is the sole rendering authority.
 */
import { createCinematicWorldBuildingApi } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

const WORLD = createCinematicWorldBuildingApi();

/**
 * Create one Core-owned procedural atmosphere using the legacy fidelity arguments.
 * @param {number} radius Sky radius in world units.
 * @param {number} rings Requested vertical subdivisions, bounded by Core.
 * @param {number} segments Requested horizontal subdivisions, bounded by Core.
 * @returns {object} Shared Core cinematic atmosphere mesh.
 */
export function createSkyDome(radius = 360, rings = 28, segments = 64) {
	const mesh = WORLD.sky({
		name: 'Awtsmoos_procedural_daylight_atmosphere_sphere',
		radius,
		rings,
		segments
	});
	mesh.userData.compatibilityDoorway = 'mitzvah-world-sky-dome';
	return mesh;
}
