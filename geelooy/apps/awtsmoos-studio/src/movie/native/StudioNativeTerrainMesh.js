//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file StudioNativeTerrainMesh.js
 * @description Compatibility adapter from Studio terrain plans into Procedural Core's rendering authority.
 * Studio owns movie semantics only: geometry materialization, ecological material policy, remote texture
 * discovery, hydration, visibility, and renderer-facing mesh construction remain entirely inside Core.
 */
import { createCinematicWorldBuildingApi } from '../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

const WORLD = createCinematicWorldBuildingApi();

/**
 * Materialize one authored Studio terrain plan through Core without constructing GPU resources here.
 * @param {object} terrainPlan Deterministic portable terrain truth already owned by the movie recipe.
 * @param {object} options Optional Core hydration/testing overrides; Studio never interprets them.
 * @returns {object} Core-owned native mesh carrying Studio selection metadata only.
 */
export function createStudioNativeTerrainMesh(terrainPlan = {}, options = {}) {
	const mesh = WORLD.terrain({
		...options,
		name: 'Awtsmoos Studio Mountain Terrain',
		plan: terrainPlan
	});
	mesh.name = 'Awtsmoos Studio Mountain Terrain';
	mesh.userData.studioKind = 'terrain3d';
	return mesh;
}
