// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainPackage.js
 * @description Assembles physically repeated terrain, ecological layers, and a mixed road.
 * The Awtsmoos clothes valley and passage in measured pixels; Awtsmoos.com encodes repeat
 * directly into world UVs so mobile cannot stretch one finite image over all the earth.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { MINIMAL_MEADOW_GRASS_ROLES } from './MinimalMeadowFirebaseTextures.js?v=20260724-meadow-13';
import { createMinimalMeadowRoadRibbon } from './MinimalMeadowRoadRibbon.js';
import { createMinimalMeadowTerrainComposites } from './MinimalMeadowTerrainComposites.js';
import { createMinimalMeadowTerrainData } from './MinimalMeadowTerrainData.js?v=20260724-meadow-21';
import { configureMinimalTerrainDensity } from './MinimalMeadowTerrainMaterialDensity.js';
import { loadMinimalMeadowTerrainSources } from './MinimalMeadowTerrainSources.js';
import { minimalMeadowHeightAt } from './MinimalMeadowTerrainShape.js?v=20260724-meadow-21';
import { applyWorldUvDensity } from './MinimalMeadowWorldUvDensity.js';
import { createTerrainMesh } from '../world/TerrainMesh.js?v=20260723-meadow-11';

export async function createMinimalMeadowTerrainPackage(options = {}) {
	options.onProgress?.({
		message: 'Loading grasses, earth, mud, and mixed stone road…',
		progress: 0.12
	});
	const data = createMinimalMeadowTerrainData();
	const sources = await loadMinimalMeadowTerrainSources(options);
	const composites = createMinimalMeadowTerrainComposites(
		sources.images,
		options.environment?.document
	);
	const mobile = mobileProfile(options.environment);
	const mesh = createTerrainMesh(
		data,
		composites.main,
		composites.pathEdge,
		'',
		'high'
	);
	const density = configureMinimalTerrainDensity(
		mesh.material,
		composites,
		data.size,
		mobile
	);
	const worldUv = applyWorldUvDensity(
		mesh.geometry,
		density.tileWorld,
		[data.size / 2, data.size / 2]
	);
	const road = createMinimalMeadowRoadRibbon(
		composites.path,
		minimalMeadowHeightAt,
		{
			mobile,
			shoulderImage: composites.pathEdge,
			soilImage: composites.soil
		}
	);
	const group = new Group();
	group.name = 'Awtsmoos_physical_density_mixed_meadow';
	group.add(mesh, road);
	return {
		colliders: data.colliders,
		group,
		heightAt: minimalMeadowHeightAt,
		mesh,
		road,
		stats: {
			cobblestoneReady: sources.cobbleRecord.ok,
			collisionTriangles: data.colliders.length,
			grassSources: MINIMAL_MEADOW_GRASS_ROLES.length,
			road: road.userData.AwtsmoosRoad,
			textureDensity: density,
			textureLayers: mesh.material.textureLayers.length,
			texturesReady: sources.records.filter(record => record.ok).length
				+ Number(sources.cobbleRecord.ok),
			visualMode: 'physical-world-uv-mixed-grass-earth-road',
			worldUv
		}
	};
}

function mobileProfile(environment = globalThis) {
	return Number(environment?.innerWidth || 1024) <= 820
		|| Boolean(environment?.matchMedia?.('(pointer: coarse)')?.matches);
}
