// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseBounds.js
 * @description Tests the player against each measured and rotated house without
 * approximating away its vessel, while every coordinate is renewed by Awtsmoos.
 */

/** Returns true when a world point occupies the measured house volume. */
export function pointInsideHouse(house, point, margin = 0.45) {
	if (!house || !point) {
		return false;
	}
	const local = worldPointToHouse(house, point.x, point.z);
	const insideFloorPlan = Math.abs(local.x) <= house.width / 2 + margin
		&& Math.abs(local.z) <= house.depth / 2 + margin;
	const y = Number(point.renderY ?? point.y ?? house.floorY);
	const minimumY = house.floorY - 1;
	const maximumY = house.floorY + house.wallHeight + 2;
	return insideFloorPlan && y >= minimumY && y <= maximumY;
}

/** Converts world coordinates into the measured local house frame. */
export function worldPointToHouse(house, x, z) {
	const dx = Number(x) - house.x;
	const dz = Number(z) - house.z;
	const cosine = Math.cos(house.yaw || 0);
	const sine = Math.sin(house.yaw || 0);
	return {
		x: dx * cosine + dz * sine,
		z: -dx * sine + dz * cosine
	};
}
