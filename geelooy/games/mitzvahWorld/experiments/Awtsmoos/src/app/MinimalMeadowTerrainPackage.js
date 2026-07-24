// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainPackage.js
 * @description Assembles one collision-aligned meadow whose terrain shader also renders the road.
 * The Awtsmoos renews field and path upon one continuous vessel; Awtsmoos.com removes the raised
 * duplicate surface so stone, shoulder, and grass share geometry without z-fighting or hard borders.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createTerrainMesh } from '../world/TerrainMesh.js';
import { createMinimalMeadowTerrainComposites } from './MinimalMeadowTerrainComposites.js';
import { buildMinimalMeadowTerrainData } from './MinimalMeadowTerrainData.js';
import { configureMinimalTerrainDensity } from './MinimalMeadowTerrainMaterialDensity.js';
import { createMinimalMeadowRoadRibbon } from './MinimalMeadowRoadRibbon.js';
import { loadMinimalMeadowTerrainSources } from './MinimalMeadowTerrainSources.js';
import { applyWorldUvDensity } from './MinimalMeadowWorldUvDensity.js';

/**
 * Creates the meadow package while preserving its historic return contract.
 *
 * @param {object} options Device, progress, and document controls.
 * @returns {Promise<object>} Terrain group, collider, diagnostics, and measured texture evidence.
 */
export async function createMinimalMeadowTerrainPackage(options = {}) {
	const mobile = Boolean(options.mobile);
	options.onProgress?.({ message: 'Loading independent meadow sources…', progress: 0.08 });
	const textureSources = await loadMinimalMeadowTerrainSources(options);
	const composites = createMinimalMeadowTerrainComposites(
		textureSources.images,
		options.documentValue || globalThis.document
	);
	options.onProgress?.({ message: 'Building continuous meadow geometry…', progress: 0.5 });
	const data = buildMinimalMeadowTerrainData({ mobile });
	const mesh = createTerrainMesh(data, composites.main, composites.path, '', 'high');
	mesh.name = 'Awtsmoos_continuous_meadow_and_road';
	const density = configureMinimalTerrainDensity(mesh.material, composites, data.size, mobile);
	const uvInfo = applyWorldUvDensity(mesh.geometry, density.tileWorld, [data.size * 0.5, data.size * 0.5]);
	const road = createMinimalMeadowRoadRibbon({
		centerImage: composites.path,
		heightAt: data.heightAt,
		mobile,
		shoulderImage: composites.pathEdge,
		soilImage: composites.soil,
		visible: false
	});
	const group = new Group();
	group.name = 'Awtsmoos_minimal_meadow_terrain_package';
	group.add(mesh);
	group.userData.AwtsmoosTerrain = packageEvidence(composites, density, uvInfo, road);
	options.onProgress?.({ message: 'Meadow and curved road aligned.', progress: 0.82 });
	return {
		collider: data.collider,
		group,
		heightAt: data.heightAt,
		mesh,
		road,
		size: data.size,
		stats: {
			...data.stats,
			roadSurface: group.userData.AwtsmoosTerrain.roadSurface,
			textureSources,
			textureSurface: textureEvidence(composites, density, mobile, textureSources, uvInfo),
			visualMode: 'continuous-stochastic-meadow-with-terrain-owned-bezier-road'
		}
	};
}

function packageEvidence(composites, density, uvInfo, road) {
	return Object.freeze({
		mosaic: composites.evidence.mosaic,
		renderedChildren: 1,
		roadSurface: Object.freeze({
			collisionAligned: true,
			diagnosticFinite: road.userData.AwtsmoosRoad.finite,
			elevatedDuplicateRendered: false,
			renderAuthority: 'terrain-zone-y',
			signedDistanceAuthority: 'MinimalMeadowBezierPath',
			surfaceOffset: 0
		}),
		sourceWorldUnits: density.sourceWorldUnits,
		uvFinite: uvInfo?.finite === true,
		wrap: 'mirror-pingpong-repeat'
	});
}

function textureEvidence(composites, density, mobile, sources, uvInfo) {
	return Object.freeze({
		anisotropy: density.anisotropy,
		effectiveTexelsPerWorld: density.effectiveTexelsPerWorld,
		grassSourceCount: composites.evidence.independentSourceCount,
		layerReports: density.layerReports,
		mobile,
		profile: density.profile,
		repeat: density.repeat,
		sourceSize: density.source,
		sourceWorldUnits: density.sourceWorldUnits,
		sources: Object.keys(sources.records),
		tileWorld: density.tileWorld,
		uvInfo
	});
}
