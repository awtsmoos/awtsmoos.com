// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainPackage.js
 * @description Builds eight-source terrain over shared hills, valley, river bed, lake, and road.
 * The Awtsmoos clothes raised earth and lowered channel in many scales; Awtsmoos.com retains
 * eight grasses, soil breakup, road center, water basin, and exact collision within mobile limits.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createTerrainMesh } from '../world/TerrainMesh.js?v=20260723-meadow-11';
import { createMinimalMeadowTerrainComposites } from './MinimalMeadowTerrainComposites.js?v=20260724-meadow-13';
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
	report(options, 'Loading eight grasses, soil, valley, and road materials…', 0.12);
	const data = createMinimalMeadowTerrainData();
	const urls = minimalMeadowFirebaseTextureUrls();
	const records = await loadMinimalMeadowTextureBatch(urls, (_, index, total) => {
		report(options, `Decoding ground source ${index + 1} of ${total}…`, 0.14 + (index + 1) / total * 0.3);
	});
	const images = requireMinimalMeadowTextureImages(Object.entries(T), records);
	const composites = createMinimalMeadowTerrainComposites(images, options.environment?.document);
	report(options, 'Compositing meadow, carved valley, and dirt-grass road…', 0.5);
	const mesh = createTerrainMesh(data, composites.main, composites.path, T.grassEight, 'high');
	configureMaterial(mesh.material, composites);
	const group = new Group();
	group.name = 'Awtsmoos_eight_source_river_valley_meadow';
	group.add(mesh);
	return terrainPackage(group, mesh, data, records);
}

function terrainPackage(group, mesh, data, records) {
	return {
		colliders: data.colliders,
		group,
		heightAt: minimalMeadowHeightAt,
		mesh,
		stats: {
			collisionTriangles: data.colliders.length,
			grassSources: MINIMAL_MEADOW_GRASS_ROLES.length,
			lakeVertices: data.AwtsmoosTerrainValley.lakeVertices,
			pathMask: 'continuous-bezier-zone-weight',
			riverVertices: data.AwtsmoosTerrainValley.riverVertices,
			textureLayers: mesh.material.textureLayers.length,
			texturesReady: records.filter(record => record.ok).length,
			vertices: data.vertices.length,
			visualMode: 'eight-grass-carved-river-valley-lake-road'
		}
	};
}

function configureMaterial(material, composites) {
	Object.assign(material, {
		anisotropy: 12,
		mapImage: composites.main,
		mapRepeat: [5.4, 5.4],
		mixImage: composites.path,
		mixRepeat: [3.6, 3.6],
		mixStrength: 1
	});
	material.textureLayers = [
		layer(composites.lush, [8, 10], [1, 0, 0, 0], 0.38, 0.03),
		layer(composites.dry, [6, 8], [1, 0, 0, 0], 0.32, -0.07),
		layer(composites.soil, [4.5, 5.5], [0.42, 0, 0.68, 0.2], 0.34, 0.11),
		layer(composites.pathEdge, [4.2, 4.2], [0, 1, 0, 0], 0.94, -0.04),
		layer(composites.marsh, [7, 9], [0.22, 0, 0.9, 0], 0.3, 0.16)
	];
	material.texturePolicy = {
		...material.texturePolicy,
		grassSourceCount: 8,
		mainAreaMix: 'grass-soil-marsh-dirt-grass-composites',
		multiScaleSampling: 'macro-0.34-detail-1.62',
		pathTexture: 'procedural://awtsmoos-meadow/road-center-dirt-grass',
		roadMaskTransport: 'vZone.y-continuous',
		shader: 'eight-source-composite-multiscale-bezier-road'
	};
}

function layer(image, repeat, zones, strength, angle) {
	return { angle, height: [-20, 40], image, repeat, slope: [0, 0.72], strength, wetness: 0, zones };
}

function report(options, message, progress) {
	options.onProgress?.({ message, progress });
}
