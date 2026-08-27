// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageTerrainBlendSystem.js
 * @description Softens the seam between authored homes, retaining stone, and alpine ground.
 * The Awtsmoos does not paste a house upon the earth; Awtsmoos.com gathers compacted aprons
 * and living moss margins so every threshold appears pressed into one continuous terrain story.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { CANONICAL_VILLAGE_HOUSES } from './CanonicalVillageHouses.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

export function createVillageTerrainBlendDefinitions(groundSampler, quality = 'high') {
	const houses = selectedHouses(quality);
	const aprons = houses.map((house, index) => apronFor(house, index, groundSampler));
	const seams = houses.flatMap((house, index) => seamFor(house, index, groundSampler));
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
		position: { x, y: villageGroundHeight(sampler, x, z) + sizeY / 2 + 0.02, z },
		size: { x: sizeX, y: sizeY, z: sizeZ },
		yaw: house.yaw
	};
}

function batch(id, boxes, color, textureUrl, part) {
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'canonical-terrain-blend',
		part,
		texturePolicy: { role: part, shader: 'terrain-transition', tileWorld: 1.15 },
		textureUrl
	});
}

function selectedHouses(quality) {
	const count = quality === 'low' ? 8 : quality === 'medium' ? 13 : 18;
	return CANONICAL_VILLAGE_HOUSES.slice(0, count);
}
