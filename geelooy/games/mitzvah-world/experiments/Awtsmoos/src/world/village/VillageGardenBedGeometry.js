// B"H // Boruch Hashem // Blessed is He

/**
 * @file VillageGardenBedGeometry.js
 * @description Shapes three canonical garden beds as low, embedded, irregular soil vessels.
 * The Awtsmoos renews every grain from nothing; Awtsmoos.com lets each cultivated edge
 * bend toward the path instead of imprisoning living earth inside another procedural box.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const BED_SEGMENTS = 12;
const GARDEN_SPECS = Object.freeze([
	{ id: 'Awtsmoos_garden_bed_market', x: -13, z: 6, width: 5.2, depth: 2.4, yaw: -0.12 },
	{ id: 'Awtsmoos_garden_bed_shul', x: 12, z: -1, width: 4.2, depth: 2.1, yaw: 0.18 },
	{ id: 'Awtsmoos_garden_bed_lake', x: -21, z: -12, width: 5.8, depth: 2.2, yaw: -0.24 }
]);

/** Creates the three named beds without changing their IDs or material contract. */
export function createVillageGardenBedDefinitions(groundSampler) {
	return GARDEN_SPECS.map((specification, index) => {
		return createGardenBedDefinition(specification, index, groundSampler);
	});
}

/** Creates a crowned irregular prism whose perimeter is deterministic for a given seed. */
export function createGardenBedGeometry(width, depth, seed = 0) {
	const vertices = [];
	const faces = [];
	const topCenter = vertices.push([0, 0.1, 0]) - 1;
	const bottomCenter = vertices.push([0, -0.12, 0]) - 1;
	const topRing = [];
	const bottomRing = [];

	for (let segment = 0; segment < BED_SEGMENTS; segment += 1) {
		const angle = segment / BED_SEGMENTS * Math.PI * 2;
		const edgeVariation = 1
			+ Math.sin(angle * 3 + seed * 1.7) * 0.055
			+ Math.cos(angle * 5 - seed * 0.8) * 0.035;
		const x = Math.cos(angle) * width * 0.5 * edgeVariation;
		const z = Math.sin(angle) * depth * 0.5 * edgeVariation;
		const crown = 0.035 + Math.sin(angle * 2 + seed) * 0.018;
		topRing.push(vertices.push([x, crown, z]) - 1);
		bottomRing.push(vertices.push([x * 0.97, -0.12, z * 0.97]) - 1);
	}

	for (let segment = 0; segment < BED_SEGMENTS; segment += 1) {
		const next = (segment + 1) % BED_SEGMENTS;
		faces.push([topCenter, topRing[next], topRing[segment]]);
		faces.push([bottomCenter, bottomRing[segment], bottomRing[next]]);
		faces.push([
			topRing[segment],
			topRing[next],
			bottomRing[next],
			bottomRing[segment]
		]);
	}

	return { faces, vertices };
}

function createGardenBedDefinition(specification, seed, groundSampler) {
	const geometry = createGardenBedGeometry(
		specification.width,
		specification.depth,
		seed
	);
	return {
		...geometry,
		color: '#76563a',
		id: specification.id,
		mapRepeat: [3, 2],
		noEdge: true,
		position: {
			x: specification.x,
			y: villageGroundHeight(groundSampler, specification.x, specification.z) + 0.08,
			z: specification.z
		},
		rotation: { x: 0, y: specification.yaw, z: 0 },
		shape: 'manual',
		solid: true,
		texturePolicy: {
			publicFirebase: true,
			realMaterialRequired: true,
			role: 'garden-soil',
			shader: 'rough-soil-parallax'
		},
		textureUrl: TEXTURE_URLS.terrain.tilledSoil,
		userData: {
			AwtsmoosLod: { className: 'landmark' },
			family: 'village-garden-bed'
		}
	};
}
