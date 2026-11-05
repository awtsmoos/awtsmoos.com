// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictTransitionBuilder.js
 * @description Grounds ordinary districts with retaining walls, stairs, drainage, and garden edges.
 * The Awtsmoos joins built vessel to living earth without a seam; Awtsmoos.com makes every
 * terrace disclose why its house can stand, drain, and welcome a traveler on an alpine slope.
 */

import { createVillageBoxBatch } from './VillageBoxBatch.js';

export function createDistrictTransitionDefinitions(options) {
	const { district, base, materials } = options;
	const x = district.center[0];
	const z = district.center[1];
	return [
		retainingWall(district.id, x, base, z, materials),
		stoneStairs(district.id, x, base, z, materials),
		drainageChannel(district.id, x, base, z, materials)
	];
}

function retainingWall(id, x, base, z, materials) {
	const boxes = [-1, 0, 1].map((offset) => ({
		position: {
			x: x + offset * 4.2,
			y: base + 0.75,
			z: z - 5.4
		},
		size: { x: 4.4, y: 1.5, z: 0.9 },
		yaw: 0
	}));
	return createVillageBoxBatch(`${id}-retaining-wall`, boxes, {
		color: '#9a9185',
		family: 'canonical-terrace-transition',
		part: 'retaining-wall',
		texturePolicy: materials.texturePolicy,
		textureUrl: materials.stone
	});
}

function stoneStairs(id, x, base, z, materials) {
	const boxes = Array.from({ length: 6 }, (_, index) => ({
		position: {
			x,
			y: base + 0.12 + index * 0.16,
			z: z - 7.4 + index * 0.48
		},
		size: { x: 2.2, y: 0.24, z: 0.72 },
		yaw: 0
	}));
	return createVillageBoxBatch(`${id}-stone-stairs`, boxes, {
		color: '#827a70',
		family: 'canonical-terrace-transition',
		part: 'stone-stairs',
		texturePolicy: materials.texturePolicy,
		textureUrl: materials.stone
	});
}

function drainageChannel(id, x, base, z, materials) {
	const boxes = [-1, 1].map((side) => ({
		position: { x: x + side * 1.55, y: base + 0.08, z: z - 5.9 },
		size: { x: 0.35, y: 0.16, z: 4.2 },
		yaw: 0
	}));
	return createVillageBoxBatch(`${id}-drainage`, boxes, {
		color: '#6f685f',
		family: 'canonical-terrace-transition',
		part: 'drainage-channel',
		texturePolicy: materials.texturePolicy,
		textureUrl: materials.stone
	});
}
