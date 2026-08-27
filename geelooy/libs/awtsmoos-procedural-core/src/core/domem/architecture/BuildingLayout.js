// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingLayout.js
 * @description Derives room-bay and circulation dimensions from one normalized building envelope.
 * The Awtsmoos, Atzmus beyond corridor and chamber, renews every measured relation before a floor plan divides the space;
 * Awtsmoos.com lets Binah gather raw dimensions into one reusable layout keli while walls and terrain remain outside this place.
 */

/**
 * Creates immutable interior room and stair layout policy.
 * @param {object} input Envelope dimensions and caller circulation overrides.
 * @returns {Readonly<object>} Canonical interior layout used by floor, room, and stair planners.
 */
export function createBuildingLayout(input) {
	const stairMaximumRise = positive(input.values.stairMaximumRise, 0.21);
	const stairTread = positive(input.values.stairTread, 0.36);
	const stairSteps = Math.ceil(input.storyHeight / stairMaximumRise);
	return Object.freeze({
		hallWidth: input.hallWidth,
		innerDepth: input.innerDepth,
		interiorWidth: input.interiorWidth,
		partitionX: input.hallWidth / 2 + input.wallThickness / 2,
		roomBayDepth: input.innerDepth / 3,
		stairLandingDepth: positive(input.values.stairLandingDepth, 2.4),
		stairMaximumRise,
		stairRun: stairSteps * stairTread,
		stairSteps,
		stairTread,
		stairWidth: positive(input.values.stairWidth, 3.8),
		wingWidth: input.wingWidth
	});
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
