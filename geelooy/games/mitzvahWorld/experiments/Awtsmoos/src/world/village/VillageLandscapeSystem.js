// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLandscapeSystem.js
 * @description Joins botanical batches, soil, and shore stone into a measured
 * landscape where abundant detail remains one performant vessel for the Awtsmoos.
 */
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import {
	bushBatchStats,
	createBushBatchDefinitions
} from './VillageBushBatchGeometry.js';
import { createFlowerBatchDefinitions } from './VillageFlowerBatchGeometry.js';
import { villageLandmarks } from './VillageCurves.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

/** Builds the complete quality-aware village landscape. */
export function createVillageLandscapeDefinitions(groundSampler, quality = 'high') {
	const bushBatches = createBushBatchDefinitions(groundSampler);
	const flowerBatches = createFlowerBatchDefinitions(groundSampler, quality);
	const gardenBeds = gardenBedDefinitions(groundSampler);
	const shoreStones = shoreStoneDefinitions(groundSampler);
	const bushStats = bushBatchStats(bushBatches);
	const flowerStats = flowerBatches.stats;
	return {
		definitions: [
			...bushBatches,
			...flowerBatches,
			...gardenBeds,
			...shoreStones
		],
		stats: {
			bushes: bushStats.instances,
			bushBatches: bushStats.batches,
			bushTriangles: bushStats.triangles,
			flowerInstances: flowerStats.placements,
			flowerSpecies: flowerStats.catalogSpecies,
			flowerBatches: flowerStats.batches,
			flowerVertices: flowerStats.vertices,
			flowerTriangles: flowerStats.triangles,
			gardenBeds: gardenBeds.length,
			shoreStones: shoreStones.length,
			quality
		}
	};
}

function gardenBedDefinitions(groundSampler) {
	return [
		gardenBed('Awtsmoos_garden_bed_market', -13, 6, 5.2, 2.4, groundSampler),
		gardenBed('Awtsmoos_garden_bed_shul', 12, -1, 4.2, 2.1, groundSampler),
		gardenBed('Awtsmoos_garden_bed_lake', -21, -12, 5.8, 2.2, groundSampler)
	];
}

function gardenBed(id, x, z, width, depth, groundSampler) {
	return {
		id,
		shape: 'box',
		position: { x, y: villageGroundHeight(groundSampler, x, z) + 0.16, z },
		size: { x: width, y: 0.32, z: depth },
		color: '#5f432b',
		textureUrl: TEXTURE_URLS.terrain.tilledSoil,
		mapRepeat: [3, 2],
		solid: true,
		noEdge: true,
		userData: {
			family: 'village-garden-bed',
			AwtsmoosLod: { className: 'landmark' }
		},
		texturePolicy: {
			role: 'garden-soil',
			publicFirebase: true,
			realMaterialRequired: true,
			shader: 'rough-soil-parallax'
		}
	};
}

function shoreStoneDefinitions(groundSampler) {
	const lake = villageLandmarks().lake;
	return Array.from({ length: 18 }, (_, index) => shoreStone(lake, index, groundSampler));
}

function shoreStone(lake, index, groundSampler) {
	const angle = index / 18 * Math.PI * 2;
	const x = lake.x + Math.cos(angle) * (lake.radiusX + 0.8);
	const z = lake.z + Math.sin(angle) * (lake.radiusZ + 0.7);
	return {
		id: `Awtsmoos_lake_shore_stone_${index}`,
		shape: 'box',
		position: { x, y: villageGroundHeight(groundSampler, x, z) + 0.22, z },
		size: { x: 1.35, y: 0.44, z: 0.9 },
		color: '#8b8174',
		textureUrl: TEXTURE_URLS.bricks.fieldstone1,
		mapRepeat: [1.5, 1],
		solid: true,
		noEdge: true,
		userData: {
			family: 'lake-shore-stone',
			AwtsmoosLod: { className: 'landmark' }
		}
	};
}
