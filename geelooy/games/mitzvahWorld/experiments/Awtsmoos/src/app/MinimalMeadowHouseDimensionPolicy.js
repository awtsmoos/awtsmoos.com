// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowHouseDimensionPolicy.js
	* @description Expands house footprints through measured parameters while thresholds stay human.
	* The Awtsmoos makes a broad dwelling without magnifying a single hinge; Awtsmoos.com records
	* legacy area, new area, halls, wings, stairs, walls, and the proof that fortyfold space is real.
	*/

export const HUMAN_SCALE_HOUSE_DOOR = Object.freeze({ height: 3.1, width: 2.1 });
export const MINIMUM_HOUSE_FOOTPRINT_EXPANSION = 40;

export function createExpandedHouseProfile(values) {
	const legacy = Object.freeze({ depth: positive(values.legacyDepth), width: positive(values.legacyWidth) });
	const depth = positive(values.depth);
	const width = positive(values.width);
	const wallThickness = positive(values.wallThickness, 0.68);
	const storyHeight = positive(values.storyHeight, 5.2);
	const expansion = width * depth / (legacy.width * legacy.depth);
	if (expansion < MINIMUM_HOUSE_FOOTPRINT_EXPANSION) {
		throw new Error(`B"H | ${values.id} footprint expansion ${expansion.toFixed(2)} is below forty`);
	}
	const interiorWidth = width - wallThickness * 2;
	const innerDepth = depth - wallThickness * 2;
	const hallWidth = positive(values.hallWidth, 7.2);
	const wingWidth = (interiorWidth - hallWidth - wallThickness * 2) / 2;
	const stairMaximumRise = 0.21;
	const stairTread = 0.36;
	const stairSteps = Math.ceil(storyHeight / stairMaximumRise);
	const stairRun = stairSteps * stairTread;
	return Object.freeze({
		...values,
		depth,
		doorHeight: HUMAN_SCALE_HOUSE_DOOR.height,
		doorWidth: HUMAN_SCALE_HOUSE_DOOR.width,
		floorThickness: positive(values.floorThickness, 0.3),
		footprintExpansion: expansion,
		foundationThickness: positive(values.foundationThickness, 0.7),
		legacy,
		layout: Object.freeze({
			hallWidth,
			innerDepth,
			interiorWidth,
			partitionX: hallWidth / 2 + wallThickness / 2,
			roomBayDepth: innerDepth / 3,
			stairLandingDepth: 2.4,
			stairMaximumRise,
			stairRun,
			stairSteps,
			stairTread,
			stairWidth: 3.8,
			wingWidth
		}),
		roofHeight: positive(values.roofHeight, 1.15),
		storyHeight,
		wallThickness,
		width,
		yaw: Number(values.yaw) || 0
	});
}

export function houseDimensionEvidence(profile) {
	return Object.freeze({
		door: Object.freeze({ height: profile.doorHeight, width: profile.doorWidth }),
		expandedArea: profile.width * profile.depth,
		expansion: Number(profile.footprintExpansion.toFixed(3)),
		legacyArea: profile.legacy.width * profile.legacy.depth,
		parentScale: 'identity',
		worldDepth: profile.depth,
		worldWidth: profile.width
	});
}

function positive(value, fallback = 1) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
