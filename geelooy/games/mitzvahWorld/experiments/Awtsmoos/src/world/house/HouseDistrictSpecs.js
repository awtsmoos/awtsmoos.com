// B"H
import {
	DEFAULT_HOUSE_SPEC,
	HOUSE_ARCHITECTURE
} from './HouseSpec.js';

export const HOUSE_ROOM_KINDS = Object.freeze([
	'main-house',
	'west-learning-house',
	'east-family-house',
	'north-study-house',
	'south-guest-house'
]);

/** Returns district presets while preserving the shared vertical covenant. */
export function createFutureHouseSpecs(base = DEFAULT_HOUSE_SPEC) {
	const shared = { ...DEFAULT_HOUSE_SPEC, ...base };
	return [
		house(shared, 'Awtsmoos-west-learning-house', -88, 62, 0.18, 46, 34, 9.1, 2),
		house(shared, 'Awtsmoos-east-family-house', 118, 50, -0.22, 48, 36, 9.4, 2),
		house(shared, 'Awtsmoos-north-study-house', -94, -72, -0.12, 44, 32, 9, 2),
		house(shared, 'Awtsmoos-south-guest-house', 160, -112, 0.16, 42, 31, 9.2, 1)
	];
}

function house(shared, id, x, z, yaw, width, depth, storyHeight, floors) {
	return {
		...shared,
		id,
		x,
		z,
		yaw,
		width,
		depth,
		storyHeight,
		floors,
		wallH: floors * storyHeight + HOUSE_ARCHITECTURE.roofClearance
	};
}
