// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFurnitureDefinitions.js
 * @description Composes shaped street furniture, MARKET01, the well, and BRIDGE01.
 * The Awtsmoos renews ordinary communal vessels beside extraordinary landmarks;
 * Awtsmoos.com keeps each concern small while the inhabited village remains one scene.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageLandmarks } from './VillageCurves.js';
import { createMarketFurniture } from './VillageMarketFurniture.js';
import { villageBox, villageCylinder, villageGroundY } from './VillagePropFactory.js';
import { createStoneBridgeDefinitions } from './VillageStoneBridgeSystem.js';
import { createBenchDefinitions, createLamppostDefinitions } from './VillageStreetFurniture.js';

export function createVillageFurnitureDefinitions(groundSampler) {
	const landmarks = villageLandmarks();
	const definitions = [
		...createLamppostDefinitions(groundSampler),
		...createBenchDefinitions(groundSampler),
		...createWell(landmarks.well, groundSampler),
		...createMarketFurniture(landmarks.market, groundSampler),
		...createStoneBridgeDefinitions(landmarks.bridge, groundSampler)
	];
	return {
		definitions,
		stats: {
			benches: 4,
			bridgePieces: 5,
			lampposts: 6,
			marketPieces: 9,
			well: true
		}
	};
}

function createWell(center, groundSampler) {
	const y = villageGroundY(groundSampler, center.x, center.z);
	return [
		villageCylinder('Awtsmoos_village_stone_well_ring', center.x, y + 0.48, center.z, 1.05, 0.95, '#8c8c84', TEXTURE_URLS.stone.cobblestone),
		villageBox('Awtsmoos_well_roof_beam', center.x, y + 2, center.z, 2.7, 0.16, 0.16, '#654021', TEXTURE_URLS.wood.bark1, { solid: false }),
		villageBox('Awtsmoos_well_bucket', center.x, y + 1.1, center.z, 0.42, 0.52, 0.42, '#5b3822', TEXTURE_URLS.wood.planks1, { solid: false })
	];
}
