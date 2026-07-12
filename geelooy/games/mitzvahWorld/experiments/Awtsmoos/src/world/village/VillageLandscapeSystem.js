// B"H
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import {
	bushBatchStats,
	createBushBatchDefinitions
} from './VillageBushBatchGeometry.js';
import { createFlowerBatchDefinitions } from './VillageFlowerBatchGeometry.js';
import { villageLandmarks } from './VillageCurves.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

/**
 * Builds the living village edge from finite batched plants, grounded garden
 * beds, and collision-bearing shore stones. Beauty arrives in a few measured
 * vessels instead of many broken submissions.
 */
export function createVillageLandscapeDefinitions(groundSampler) {
	const bushBatches = createBushBatchDefinitions(groundSampler);
	const flowerBatches = createFlowerBatchDefinitions(groundSampler);
	const gardenBeds = gardenBedDefinitions(groundSampler);
	const shoreStones = shoreStoneDefinitions(groundSampler);
	const bushStats = bushBatchStats(bushBatches);
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
			flowerInstances: 72,
			flowerBatches: flowerBatches.length,
			gardenBeds: gardenBeds.length,
			shoreStones: shoreStones.length
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
		position: {
			x,
			y: villageGroundHeight(groundSampler, x, z) + 0.16,
			z
		},
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
	return Array.from({ length: 18 }, (_, index) => {
		const angle = index / 18 * Math.PI * 2;
		const x = lake.x + Math.cos(angle) * (lake.radiusX + 0.8);
		const z = lake.z + Math.sin(angle) * (lake.radiusZ + 0.7);
		return {
			id: `Awtsmoos_lake_shore_stone_${index}`,
			shape: 'box',
			position: {
				x,
				y: villageGroundHeight(groundSampler, x, z) + 0.22,
				z
			},
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
	});
}
