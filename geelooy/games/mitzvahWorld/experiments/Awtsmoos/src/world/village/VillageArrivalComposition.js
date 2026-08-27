// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArrivalComposition.js
 * @description Composes ENTR01 as one terrain-conforming lane with blended shoulders.
 * The Awtsmoos opens the valley instead of filling sight with cubes; Awtsmoos.com lets stone,
 * soil, grass, water, bridge, and distant village become one grounded arrival composition.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createArrivalFence } from './VillageArrivalFence.js';
import { sampleArrivalPath } from './VillageArrivalPath.js';
import {
	createVillageSurfaceRibbon,
	offsetVillageRibbon
} from './VillageSurfaceRibbon.js';

/**
 * Creates the complete canonical arrival composition.
 *
 * @param {object} groundSampler Shared terrain sampling authority.
 * @returns {object[]} Arrival definitions with attached statistics.
 */
export function createVillageArrivalComposition(groundSampler) {
	const points = sampleArrivalPath(groundSampler);
	const definitions = [
		roadDefinition(points, groundSampler),
		shoulderDefinition(
			'left',
			offsetVillageRibbon(points, -1, 5.8, 9.4),
			groundSampler
		),
		shoulderDefinition(
			'right',
			offsetVillageRibbon(points, 1, 5.8, 9.4),
			groundSampler
		),
		createArrivalFence(points, groundSampler)
	];
	definitions.stats = {
		drawDefinitions: definitions.length,
		featuredBotanicals: 0,
		pathSections: points.length - 1,
		stoneBorderPieces: 0,
		timberPieces: 19,
		waterSections: 0
	};
	return definitions;
}

function roadDefinition(points, groundSampler) {
	return createVillageSurfaceRibbon('arrival-cobblestone-lane', points, {
		color: '#756652',
		family: 'canonical-arrival-composition',
		groundSampler,
		mapRepeat: [3.5, 18],
		part: 'curved-cobbled-lane',
		surfaceLift: 0.07,
		texturePolicy: {
			role: 'arrival-cobblestone',
			shader: 'rough-stone-detail',
			tileWorld: 0.74
		},
		textureUrl: TEXTURE_URLS.stone.floor2,
		userData: {
			canonicalId: 'ENTR01',
			infrastructureId: 'ENTR01'
		}
	});
}

function shoulderDefinition(side, points, groundSampler) {
	return createVillageSurfaceRibbon(`arrival-${side}-soil-shoulder`, points, {
		color: side === 'left' ? '#5a4a32' : '#4f5030',
		family: 'canonical-arrival-composition',
		groundSampler,
		mapRepeat: [2.2, 15],
		part: `${side}-blended-road-shoulder`,
		surfaceLift: 0.035,
		texturePolicy: {
			role: 'road-shoulder-earth-grass',
			shader: 'soil-grass-transition',
			tileWorld: 0.8
		},
		textureUrl: TEXTURE_URLS.terrain.dirt1
	});
}

export default createVillageArrivalComposition;
