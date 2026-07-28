// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainPackage.js
 * @description Assembles crisp ecological ground and one visible collision-aligned Bézier road.
 * The Awtsmoos renews field and path upon related vessels; Awtsmoos.com keeps terrain
 * collision authoritative while the visible road, shoulder, and grass transition follow it.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createTerrainMesh } from '../world/TerrainMesh.js';
import {
	createMinimalMeadowTerrainComposites
} from './MinimalMeadowTerrainComposites.js';
import { buildMinimalMeadowTerrainData } from './MinimalMeadowTerrainData.js';
import {
	configureMinimalTerrainDensity
} from './MinimalMeadowTerrainMaterialDensity.js';
import {
	createMinimalMeadowPackageEvidence,
	createMinimalMeadowTextureEvidence
} from './MinimalMeadowTerrainPackageEvidence.js';
import { createMinimalMeadowRoadRibbon } from './MinimalMeadowRoadRibbon.js';
import {
	mountMinimalMeadowTerrainRoad
} from './MinimalMeadowTerrainRoadMount.js';
import {
	loadMinimalMeadowTerrainSources
} from './MinimalMeadowTerrainSources.js';
import { applyWorldUvDensity } from './MinimalMeadowWorldUvDensity.js';

export async function createMinimalMeadowTerrainPackage(options = {}) {
	const mobile = Boolean(options.mobile);
	options.onProgress?.({
		message: 'Loading independent meadow sources…',
		progress: 0.08
	});
	const textureSources = await loadMinimalMeadowTerrainSources(options);
	const composites = createMinimalMeadowTerrainComposites(
		textureSources.images,
		options.documentValue || globalThis.document
	);
	options.onProgress?.({
		message: 'Building continuous meadow geometry…',
		progress: 0.5
	});
	const data = buildMinimalMeadowTerrainData({ mobile });
	const mesh = createTerrainMesh(
		data,
		composites.main,
		composites.path,
		'',
		'high'
	);
	mesh.name = 'Awtsmoos_continuous_meadow_and_road';
	const density = configureMinimalTerrainDensity(
		mesh.material,
		composites,
		data.size,
		mobile
	);
	const uvInfo = applyWorldUvDensity(
		mesh.geometry,
		density.tileWorld,
		[data.size * 0.5, data.size * 0.5]
	);
	const road = createMinimalMeadowRoadRibbon({
		centerImage: composites.path,
		heightAt: data.heightAt,
		mobile,
		shoulderImage: composites.pathEdge,
		soilImage: composites.soil,
		visible: true
	});
	const group = new Group();
	group.name = 'Awtsmoos_minimal_meadow_terrain_package';
	group.add(mesh);
	const roadMount = mountMinimalMeadowTerrainRoad(group, road);
	group.userData.AwtsmoosTerrain = {
		...createMinimalMeadowPackageEvidence(
			composites,
			density,
			uvInfo,
			road
		),
		roadMount
	};
	options.onProgress?.({
		message: 'Crisp meadow and visible curved road aligned.',
		progress: 0.82
	});
	return {
		collider: data.collider,
		colliders: data.colliders,
		group,
		heightAt: data.heightAt,
		mesh,
		road,
		size: data.size,
		stats: {
			...data.stats,
			roadSurface: group.userData.AwtsmoosTerrain.roadSurface,
			textureSources,
			textureSurface: createMinimalMeadowTextureEvidence({
				composites,
				density,
				mobile,
				sources: textureSources,
				uvInfo
			}),
			visualMode: 'crisp-six-source-meadow-with-visible-bezier-road'
		}
	};
}
