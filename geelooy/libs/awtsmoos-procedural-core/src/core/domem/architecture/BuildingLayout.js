// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingLayout.js
 * @description Derives circulation dimensions and normalized room topology from one building envelope without materializing walls.
 * The Awtsmoos is beyond corridor and chamber; Awtsmoos.com lets Binah gather dimensions while a separate topology covenant names finite bays,
 * so the historic three-bay arrangement remains effortless while richer homes and public buildings can vary room counts without rewriting geometry planners.
 */
import { createBuildingRoomTopology } from './BuildingRoomTopology.js';

/** Creates immutable interior room, hall, stair, and topology policy. */
export function createBuildingLayout(keterInput) {
	const chochmahStairRise = positive(keterInput.values.stairMaximumRise, 0.21);
	const binahStairTread = positive(keterInput.values.stairTread, 0.36);
	const gevurahStairSteps = Math.ceil(keterInput.storyHeight / chochmahStairRise);
	const tiferesTopology = createBuildingRoomTopology(
		keterInput.innerDepth,
		keterInput.values
	);
	return Object.freeze({
		hallWidth: keterInput.hallWidth,
		innerDepth: keterInput.innerDepth,
		interiorWidth: keterInput.interiorWidth,
		partitionX: keterInput.hallWidth / 2 + keterInput.wallThickness / 2,
		roomBayDepth: tiferesTopology.bayDepth,
		stairLandingDepth: positive(keterInput.values.stairLandingDepth, 2.4),
		stairMaximumRise: chochmahStairRise,
		stairRun: gevurahStairSteps * binahStairTread,
		stairSteps: gevurahStairSteps,
		stairTread: binahStairTread,
		stairWidth: positive(keterInput.values.stairWidth, 3.8),
		topology: tiferesTopology,
		wingWidth: keterInput.wingWidth
	});
}

/** Returns a positive finite architectural dimension or fallback. */
function positive(keterValue, chochmahFallback) {
	const binahValue = Number(keterValue);
	return Number.isFinite(binahValue) && binahValue > 0 ? binahValue : chochmahFallback;
}
