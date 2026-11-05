// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWellDefinitions.js
 * @description Builds WELL01 as an open fieldstone ring with visible water, timber supports, rope, and a round bucket.
 * The Awtsmoos renews vessel, water, wood, and stone before any primitive can pretend to be the whole;
 * Awtsmoos.com gathers small truthful forms so the communal well reads as an inhabited place instead of a stone drum with a cube.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import {
	villageBox,
	villageCylinder,
	villageGroundY
} from './VillagePropFactory.js';

export function createVillageWellDefinitions(center, groundSampler) {
	const y = villageGroundY(groundSampler, center.x, center.z);
	return [
		wellRing(center, y),
		wellWater(center, y),
		post(center, y, -0.96),
		post(center, y, 0.96),
		crossbeam(center, y),
		rope(center, y),
		bucket(center, y)
	];
}

function wellRing(center, y) {
	const pieces = Array.from({ length: 14 }, (_, index) => {
		const angle = index / 14 * Math.PI * 2;
		return {
			position: {
				x: center.x + Math.cos(angle) * 1.02,
				y: y + 0.42,
				z: center.z + Math.sin(angle) * 1.02
			},
			size: { x: 0.58, y: 0.58, z: 0.4 },
			yaw: -angle
		};
	});
	return createVillageBoxBatch('village_stone_well_ring', pieces, {
		color: '#8e887d',
		family: 'canonical-village-well',
		part: 'open-masonry-ring',
		texturePolicy: { role: 'well-fieldstone', tileWorld: 0.7 },
		textureUrl: TEXTURE_URLS.bricks.fieldstone1
	});
}

function wellWater(center, y) {
	return villageCylinder(
		'Awtsmoos_village_well_water', center.x, y + 0.5, center.z,
		0.76, 0.05, '#3f96a7', TEXTURE_URLS.water.still,
		{ mapRepeat: [2, 2], segments: 28, solid: false, texturePolicy: { role: 'well-water-surface' } }
	);
}

function post(center, y, offset) {
	return villageBox(
		`Awtsmoos_well_post_${offset < 0 ? 'west' : 'east'}`,
		center.x + offset, y + 1.62, center.z,
		0.18, 2.2, 0.18, '#6a4326', TEXTURE_URLS.wood.bark1,
		{ mapRepeat: [1, 3], solid: false }
	);
}

function crossbeam(center, y) {
	return villageBox(
		'Awtsmoos_well_crossbeam', center.x, y + 2.7, center.z,
		2.35, 0.16, 0.16, '#755032', TEXTURE_URLS.wood.oak2,
		{ mapRepeat: [3, 1], solid: false }
	);
}

function rope(center, y) {
	return villageBox(
		'Awtsmoos_well_rope', center.x, y + 1.96, center.z,
		0.035, 1.28, 0.035, '#5a432e', TEXTURE_URLS.wood.bark1,
		{ solid: false }
	);
}

function bucket(center, y) {
	return villageCylinder(
		'Awtsmoos_well_bucket', center.x, y + 1.18, center.z,
		0.25, 0.42, '#68452d', TEXTURE_URLS.wood.planks1,
		{ mapRepeat: [2, 1], segments: 18, solid: false }
	);
}
