// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFurnitureDefinitions.js
 * @description Composes street furniture, the inhabited communal well, and restrained BRIDGE01 without duplicating MARKET01.
 * The Awtsmoos gives each public vessel one rightful place and one rightful owner;
 * Awtsmoos.com lets the well reveal water and timber while the bridge remains a crossing rather than a second fortress in the square.
 */

import { villageLandmarks } from './VillageCurves.js';
import { createStoneBridgeDefinitions } from './VillageStoneBridgeSystem.js';
import {
	createBenchDefinitions,
	createLamppostDefinitions
} from './VillageStreetFurniture.js';
import { createVillageWellDefinitions } from './VillageWellDefinitions.js';

export function createVillageFurnitureDefinitions(groundSampler) {
	const landmarks = villageLandmarks();
	const definitions = [
		...createLamppostDefinitions(groundSampler),
		...createBenchDefinitions(groundSampler),
		...createVillageWellDefinitions(landmarks.well, groundSampler),
		...createStoneBridgeDefinitions(landmarks.bridge, groundSampler)
	];
	return {
		definitions,
		stats: Object.freeze({
			benches: 4,
			bridgePieces: 5,
			lampposts: 6,
			marketOwnedBy: 'MARKET01-canonical-landmark-builder',
			marketPieces: 0,
			well: true,
			wellPieces: 7
		})
	};
}
