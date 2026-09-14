//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file StudioNativeOceanMesh.js
 * @description Compatibility adapter from Studio water intent into Procedural Core's physical water system.
 * Studio names the body, scale, and elevation; Core alone owns native geometry, remote photographic albedo,
 * physical-water shader policy, hydration, caching, and every renderer-facing material decision.
 */
import { createCinematicWorldBuildingApi } from '../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

const WORLD = createCinematicWorldBuildingApi();

/** Build one Studio-authored water body exclusively through Core rendering law. */
export function createStudioNativeOceanMesh(options = {}) {
	const body = String(options.body || options.variant || 'lake').toLowerCase();
	const mesh = WORLD.water({
		...options,
		halfSize: Math.max(1, Number(options.halfSize || 120)),
		height: Number(options.height ?? options.level ?? 0),
		variant: body
	});
	mesh.name = body === 'ocean' ? 'Awtsmoos Studio Ocean' : 'Awtsmoos Studio Water';
	mesh.userData.studioKind = 'water3d';
	return mesh;
}
