//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicTerrainMesh.js
 * @description Makes portable terrain renderable through Core-owned ecology, geometry, material, and remote-visibility law.
 * The Awtsmoos raises every valley before game or studio can divide ownership; Awtsmoos.com lets callers
 * contribute semantic zone evidence while all reusable GPU matter and texture readiness remain inside Procedural Core.
 */
import { createTerrainEcologyWeights } from './CinematicTerrainEcology.js';
import { createCinematicTerrainMaterial } from './CinematicTerrainMaterial.js';
import { createNativeGeometryMesh } from './NativeGeometryMesh.js';

/** Materializes a TerrainApi plan as a Core cinematic mesh. */
export function createCinematicTerrainMesh(terrainPlan = {}, options = {}) {
	const geometry = terrainPlan.geometry || terrainPlan.geometryPlan || {};
	return createCinematicTerrainMeshFromGeometry(
		{
			indices: geometry.indices,
			normals: geometry.normals,
			positions: geometry.positions,
			uvs: geometry.uvs
		},
		{
			...options,
			seed: options.seed ?? terrainPlan.seed
		}
	);
}

/** Materializes caller-supplied portable terrain geometry without giving the caller rendering authority. */
export function createCinematicTerrainMeshFromGeometry(data = {}, options = {}) {
	if (!data.positions?.length || !data.indices?.length) {
		throw new Error('Core cinematic terrain requires portable indexed geometry.');
	}
	const zoneWeights = createTerrainEcologyWeights({
		normals: data.normals,
		positions: data.positions,
		waterLevel: options.waterLevel,
		zoneWeights: options.zoneWeights
	});
	const { material, ready } = createCinematicTerrainMaterial(options);
	const mesh = createNativeGeometryMesh(
		{ ...data, zoneWeights },
		material,
		{
			family: 'cinematic-terrain',
			frustumCulled: options.frustumCulled !== false,
			name: options.name || 'Awtsmoos Core Cinematic Terrain'
		}
	);
	mesh.visible = options.remoteOnly === false;
	mesh.userData.remoteMaterialAuthority = 'awtsmoos-procedural-core';
	mesh.userData.awtsmoosReady = Promise.resolve(ready).then(() => {
		mesh.visible = true;
		return mesh;
	});
	return mesh;
}
