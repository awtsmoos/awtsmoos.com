// B"H // Boruch Hashem // Blessed is He

/**
 * @file VillageShoreStoneGeometry.js
 * @description Wraps the canonical lake in asymmetric, partially buried river boulders.
 * The Awtsmoos does not repeat one cube eighteen times; Awtsmoos.com reveals a shoreline
 * where water, erosion, moss, and patient geological difference meet in one living border.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageLandmarks } from './VillageCurves.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const STONE_COUNT = 18;
const STONE_COLORS = Object.freeze(['#7d766c', '#8b8174', '#69685f']);
const RING_SEGMENTS = 7;

/** Creates the stable eighteen-stone shoreline contract with non-repeating silhouettes. */
export function createVillageShoreStoneDefinitions(groundSampler) {
	const lake = villageLandmarks().lake;
	return Array.from({ length: STONE_COUNT }, (_, index) => {
		return createShoreStoneDefinition(lake, index, groundSampler);
	});
}

/** Creates one low-poly boulder with a buried base, broad shoulder, and offset crown. */
export function createShoreStoneGeometry(width, height, depth, seed = 0) {
	const vertices = [];
	const faces = [];
	const bottomRing = [];
	const shoulderRing = [];

	for (let segment = 0; segment < RING_SEGMENTS; segment += 1) {
		const angle = segment / RING_SEGMENTS * Math.PI * 2;
		const irregularity = 1
			+ Math.sin(angle * 3 + seed * 0.71) * 0.11
			+ Math.cos(angle * 2 - seed * 0.43) * 0.06;
		const x = Math.cos(angle) * width * 0.5 * irregularity;
		const z = Math.sin(angle) * depth * 0.5 * irregularity;
		bottomRing.push(vertices.push([x * 0.76, -height * 0.38, z * 0.76]) - 1);
		shoulderRing.push(vertices.push([
			x,
			Math.sin(angle * 2 + seed) * height * 0.055,
			z
		]) - 1);
	}

	const crown = vertices.push([
		Math.sin(seed * 1.31) * width * 0.13,
		height * 0.54,
		Math.cos(seed * 0.93) * depth * 0.12
	]) - 1;

	faces.push([...bottomRing]);
	for (let segment = 0; segment < RING_SEGMENTS; segment += 1) {
		const next = (segment + 1) % RING_SEGMENTS;
		faces.push([
			bottomRing[segment],
			shoulderRing[segment],
			shoulderRing[next],
			bottomRing[next]
		]);
		faces.push([crown, shoulderRing[next], shoulderRing[segment]]);
	}

	return { faces, vertices };
}

function createShoreStoneDefinition(lake, index, groundSampler) {
	const angle = index / STONE_COUNT * Math.PI * 2;
	const shorelineOffset = 0.72 + Math.sin(index * 1.91) * 0.24;
	const x = lake.x + Math.cos(angle) * (lake.radiusX + shorelineOffset);
	const z = lake.z + Math.sin(angle) * (lake.radiusZ + shorelineOffset * 0.82);
	const width = 1.08 + index % 4 * 0.14;
	const height = 0.46 + index % 5 * 0.055;
	const depth = 0.72 + index % 3 * 0.11;
	const geometry = createShoreStoneGeometry(width, height, depth, index);
	return {
		...geometry,
		color: STONE_COLORS[index % STONE_COLORS.length],
		id: `Awtsmoos_lake_shore_stone_${index}`,
		mapRepeat: [1.5, 1],
		noEdge: true,
		position: {
			x,
			y: villageGroundHeight(groundSampler, x, z) + height * 0.22,
			z
		},
		rotation: { x: 0, y: angle + index * 0.37, z: 0 },
		shape: 'manual',
		solid: true,
		texturePolicy: {
			publicFirebase: true,
			realMaterialRequired: true,
			role: 'wet-shore-stone',
			shader: 'weathered-rock-moss'
		},
		textureUrl: TEXTURE_URLS.bricks.fieldstone1,
		userData: {
			AwtsmoosLod: { className: 'landmark' },
			family: 'lake-shore-stone'
		}
	};
}
