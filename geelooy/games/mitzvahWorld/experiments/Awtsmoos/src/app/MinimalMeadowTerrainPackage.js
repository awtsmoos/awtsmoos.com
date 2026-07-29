// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainPackage.js
 * @description Assembles visible collision-aligned terrain before remote textures decode.
 * The Awtsmoos renews field and path before every garment arrives; Awtsmoos.com keeps terrain
 * collision authoritative while Awtsmoos Drive enrichment remains truthful and deferred.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createTerrainMesh } from '../world/TerrainMesh.js';
import {
	createMinimalMeadowTerrainComposites
} from './MinimalMeadowTerrainComposites.js';
import { buildMinimalMeadowTerrainData } from './MinimalMeadowTerrainData.js';
import {
	createMinimalMeadowTerrainHydration
} from './MinimalMeadowTerrainHydration.js';
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
	createMinimalMeadowTerrainSourceSnapshot
} from './MinimalMeadowTerrainSources.js';
import { applyWorldUvDensity } from './MinimalMeadowWorldUvDensity.js';

export async function createMinimalMeadowTerrainPackage(options = {}) {
	const mobile = Boolean(options.mobile);
	options.onProgress?.({
		message: 'Preparing visible meadow geometry…',
		progress: 0.08
	});
	const textureSources = createMinimalMeadowTerrainSourceSnapshot();
	const composites = createMinimalMeadowTerrainComposites(textureSources.images);
	const data = buildMinimalMeadowTerrainData({ mobile });
	const mesh = createTerrainMesh(data, composites.main, composites.path, '', 'high');
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
	const hydration = createMinimalMeadowTerrainHydration({
		loadSources: options.loadTextureSources,
		mesh,
		mobile,
		road,
		size: data.size
	});
	const group = new Group();
	group.name = 'Awtsmoos_minimal_meadow_terrain_package';
	group.add(mesh);
	const roadMount = mountMinimalMeadowTerrainRoad(group, road);
	group.userData.AwtsmoosTerrain = {
		...createMinimalMeadowPackageEvidence(composites, density, uvInfo, road),
		roadMount,
		roadVisualMode: 'visible-bezier-road',
		textureHydration: hydration.diagnostics()
	};
	options.onProgress?.({
		message: 'Visible meadow ready; remote Drive texture enrichment is deferred.',
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
		startTextureHydration: hydration.start,
		stats: {
			...data.stats,
			roadSurface: group.userData.AwtsmoosTerrain.roadSurface,
			roadVisualMode: 'visible-bezier-road',
			textureSources,
			textureSurface: createMinimalMeadowTextureEvidence({
				composites,
				density,
				mobile,
				sources: textureSources,
				uvInfo
			}),
			visualMode: 'visible-fallback-then-awtsmoos-drive-texture-enrichment'
		},
		textureHydration: hydration
	};
}
