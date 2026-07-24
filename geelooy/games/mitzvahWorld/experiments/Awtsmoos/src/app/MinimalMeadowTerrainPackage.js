// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainPackage.js
 * @description Builds image-density terrain, ecological blends, and one aligned cobblestone road.
 * The Awtsmoos clothes hill, valley, mud, soil, grass, and passage in measured pixels;
 * Awtsmoos.com keeps bright fallback boot while rich surfaces reveal through bounded cached sources.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage, loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { textureDensityPlan } from '../assets/TextureRepeat.js';
import { createTerrainMesh } from '../world/TerrainMesh.js?v=20260723-meadow-11';
import { createMinimalMeadowRoadRibbon } from './MinimalMeadowRoadRibbon.js';
import { createMinimalMeadowTerrainComposites } from './MinimalMeadowTerrainComposites.js';
import { createMinimalMeadowTerrainData } from './MinimalMeadowTerrainData.js?v=20260724-meadow-21';
import {
	MINIMAL_MEADOW_FIREBASE_TEXTURES as T,
	MINIMAL_MEADOW_GRASS_ROLES,
	minimalMeadowFirebaseTextureUrls
} from './MinimalMeadowFirebaseTextures.js?v=20260724-meadow-13';
import { minimalMeadowHeightAt } from './MinimalMeadowTerrainShape.js?v=20260724-meadow-21';
import {
	loadMinimalMeadowTextureBatch,
	requireMinimalMeadowTextureImages
} from './MinimalMeadowTextureBatchLoader.js?v=20260724-meadow-14';

export async function createMinimalMeadowTerrainPackage(options = {}) {
	report(options, 'Loading eight grasses, soil, mud, and real cobblestone…', 0.12);
	const data = createMinimalMeadowTerrainData();
	const [records, cobbleRecord] = await Promise.all([
		loadMinimalMeadowTextureBatch(minimalMeadowFirebaseTextureUrls(), (_, index, total) => {
			report(options, `Decoding ground source ${index + 1} of ${total}…`, 0.14 + (index + 1) / total * 0.3);
		}),
		loadPublicMaterialUrl(TEXTURE_URLS.stone.cobblestone, 18000)
	]);
	const images = requireMinimalMeadowTextureImages(Object.entries(T), records);
	images.cobblestone = cobbleRecord.ok
		? cobbleRecord.image
		: cachedTextureImage(TEXTURE_URLS.stone.cobblestone) || images.pathCenter;
	const composites = createMinimalMeadowTerrainComposites(images, options.environment?.document);
	const mobile = mobileProfile(options.environment);
	const mesh = createTerrainMesh(data, composites.main, composites.pathEdge, T.grassEight, 'high');
	const density = configureMaterial(mesh.material, composites, data.size, mobile);
	const road = createMinimalMeadowRoadRibbon(composites.path, minimalMeadowHeightAt, { mobile });
	const group = new Group();
	group.name = 'Awtsmoos_density_measured_river_valley_meadow';
	group.add(mesh, road);
	return terrainPackage(group, mesh, road, data, records, cobbleRecord, density);
}

function terrainPackage(group, mesh, road, data, records, cobbleRecord, density) {
	return {
		colliders: data.colliders,
		group,
		heightAt: minimalMeadowHeightAt,
		mesh,
		road,
		stats: {
			cobblestoneReady: cobbleRecord.ok,
			collisionTriangles: data.colliders.length,
			grassSources: MINIMAL_MEADOW_GRASS_ROLES.length,
			pathMask: 'continuous-bezier-zone-weight',
			road: road.userData.AwtsmoosRoad,
			textureDensity: density,
			textureLayers: mesh.material.textureLayers.length,
			texturesReady: records.filter(record => record.ok).length + Number(cobbleRecord.ok),
			vertices: data.vertices.length,
			visualMode: 'eight-grass-mud-dirt-cobblestone-river-valley-road'
		}
	};
}

function configureMaterial(material, composites, size, mobile) {
	const main = textureDensityPlan({ image: composites.main, mobile, quality: mobile ? 'medium' : 'high', texelsPerWorld: 56, worldDepth: size, worldWidth: size });
	const shoulder = textureDensityPlan({ image: composites.pathEdge, mobile, texelsPerWorld: 52, worldDepth: size, worldWidth: size });
	Object.assign(material, {
		anisotropy: main.anisotropy,
		mapImage: composites.main,
		mapRepeat: [...main.repeat],
		mixImage: composites.pathEdge,
		mixRepeat: [...shoulder.repeat],
		mixStrength: 1
	});
	material.textureLayers = [
		layer(composites.lush, size, mobile, [1, 0, 0, 0], 0.46),
		layer(composites.dry, size, mobile, [0.72, 0, 0.18, 0.1], 0.35),
		layer(composites.soil, size, mobile, [0.3, 0, 0.7, 0.16], 0.38),
		layer(composites.pathEdge, size, mobile, [0.08, 0.86, 0.04, 0.02], 0.52),
		layer(composites.mud, size, mobile, [0.12, 0, 0.88, 0], 0.4),
		layer(composites.marsh, size, mobile, [0.22, 0, 0.78, 0], 0.28)
	];
	material.texturePolicy = {
		...material.texturePolicy,
		densityPlan: main,
		grassSourceCount: 8,
		mainAreaMix: 'grass-dry-soil-mud-marsh-dirt-shoulder',
		roadMaskTransport: 'vZone.y-continuous',
		shader: 'density-measured-ecological-blend-with-cobblestone-ribbon'
	};
	return main;
}

function layer(image, size, mobile, zones, strength) {
	const density = textureDensityPlan({ image, mobile, texelsPerWorld: 52, worldDepth: size, worldWidth: size });
	return { density, height: [-20, 40], image, repeat: [...density.repeat], slope: [0, 0.72], strength, wetness: 0, zones };
}

function mobileProfile(environment = globalThis) {
	return Number(environment?.innerWidth || 1024) <= 820 || Boolean(environment?.matchMedia?.('(pointer: coarse)')?.matches);
}

function report(options, message, progress) {
	options.onProgress?.({ message, progress });
}
