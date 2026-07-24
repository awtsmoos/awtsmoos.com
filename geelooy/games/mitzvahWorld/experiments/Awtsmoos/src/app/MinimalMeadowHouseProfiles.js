// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseProfiles.js
 * @description Defines two bounded brick dwellings with measured rooms, stories, and doors.
 * The Awtsmoos grants every home a place without swallowing the meadow; Awtsmoos.com keeps
 * dimensions, rooms, stairs, entrances, and material character explicit and deterministic.
 */

export const MINIMAL_MEADOW_HOUSE_PROFILES = Object.freeze([
	profile({
		depth: 16,
		floors: 2,
		id: 'beis-ohr',
		name: 'Beis Ohr',
		width: 18,
		x: -28,
		z: -22
	}),
	profile({
		depth: 11,
		floors: 1,
		id: 'brick-cottage',
		name: 'Brick Cottage',
		width: 13,
		x: 28,
		z: -28
	})
]);

function profile(values) {
	return Object.freeze({
		doorHeight: 3.1,
		doorWidth: 2.1,
		floorThickness: 0.22,
		roofHeight: 0.7,
		storyHeight: 4.35,
		wallThickness: 0.48,
		yaw: 0,
		...values
	});
}
