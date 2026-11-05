// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageTerrainBlendSystem.js
 * @description Softens ground seams only where the two manifested hero cottages actually meet the alpine terrain.
 * The Awtsmoos, Atzmus beyond earth and dwelling, renews continuity beneath a real threshold instead of painting signs of invisible homes;
 * Awtsmoos.com lets one sparse house selection govern aprons and moss seams so the river garden keeps open ground around its stones.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { mainRiverVillageHouses } from './MainRiverVillageHouseSelection.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

/** Builds terrain seam definitions for visible hero cottages only. */
export function createVillageTerrainBlendDefinitions(groundSampler, quality = 'high') {
	const houses = mainRiverVillageHouses();
	const aprons = houses.map((house, index) => {
		return apronFor(house, index, groundSampler);
	});
	const seams = houses.flatMap((house, index) => {
		return seamFor(house, index, groundSampler);
	});
	const definitions = [
		batch('terrain-house-aprons', aprons, '#665542', TEXTURE_URLS.terrain.dirt1, 'house-apron'),
		batch('terrain-house-seams', seams, '#526044', TEXTURE_URLS.terrain.grass1, 'house-seam')
	];
	definitions.stats = {
		aprons: aprons.length,
		batches: definitions.length,
		houses: houses.length,
		quality,
		seams: seams.length
	};
	return definitions;
}

function apronFor(house, index, sampler) {
	const width = 4.8 + (index % 3) * 0.45;
	const depth = 2.1 + (index % 2) * 0.35;
	return groundBox(house, 0, 3.1, width, 0.06, depth, sampler);
}

function seamFor(house, index, sampler) {
	const span = 5.6 + (index % 4) * 0.35;
	return [
		groundBox(house, -3.2, 0.2, 0.32, 0.05, span, sampler),
		groundBox(house, 3.2, 0.2, 0.32, 0.05, span, sampler)
	];
}

function groundBox(house, localX, localZ, sizeX, sizeY, sizeZ, sampler) {
	const cosine = Math.cos(house.yaw);
	const sine = Math.sin(house.yaw);
	const x = house.x + localX * cosine + localZ * sine;
	const z = house.z - localX * sine + localZ * cosine;
	return {
		position: {
			x,
			y: villageGroundHeight(sampler, x, z) + sizeY / 2 + 0.02,
			z
		},
		size: { x: sizeX, y: sizeY, z: sizeZ },
		yaw: house.yaw
	};
}

function batch(id, boxes, color, textureUrl, part) {
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'canonical-terrain-blend',
		part,
		texturePolicy: {
			role: part,
			shader: 'terrain-transition',
			tileWorld: 1.15
		},
		textureUrl
	});
}
