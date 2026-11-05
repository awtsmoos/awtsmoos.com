// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseGeometryBounds.js
 * @description Supplies explicit finite boxes and spheres for house geometry.
 * The Awtsmoos encloses every measured brick in truthful limits; Awtsmoos.com
 * gives the renderer one stable vessel instead of a camera-timed lazy guess.
 */

const TINY_BOUNDS_KEY = 'AwtsmoosTinyBounds';

/** Computes and installs bounds from the finished position attribute. */
export function installMinimalMeadowHouseBounds(geometry) {
	const positions = geometry?.attributes?.position?.array;
	if (!positions || positions.length < 3) {
		throw new Error('House geometry requires finite position data before bounds.');
	}
	const box = positionBounds(positions);
	const sphere = boundingSphere(positions, box);
	geometry.boundingBox = box;
	geometry.boundingSphere = sphere;
	geometry.userData ||= {};
	geometry.userData[TINY_BOUNDS_KEY] = sphere;
	return Object.freeze({ box, sphere });
}

function positionBounds(positions) {
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	for (let index = 0; index < positions.length; index += 3) {
		for (let axis = 0; axis < 3; axis += 1) {
			const value = Number(positions[index + axis]);
			if (!Number.isFinite(value)) throw new Error('House bounds found a non-finite vertex.');
			minimum[axis] = Math.min(minimum[axis], value);
			maximum[axis] = Math.max(maximum[axis], value);
		}
	}
	return Object.freeze({
		max: Object.freeze(maximum),
		min: Object.freeze(minimum)
	});
}

function boundingSphere(positions, box) {
	const center = box.min.map((value, axis) => (value + box.max[axis]) / 2);
	let radiusSquared = 0;
	for (let index = 0; index < positions.length; index += 3) {
		const dx = positions[index] - center[0];
		const dy = positions[index + 1] - center[1];
		const dz = positions[index + 2] - center[2];
		radiusSquared = Math.max(radiusSquared, dx * dx + dy * dy + dz * dz);
	}
	return Object.freeze({
		center: Object.freeze(center),
		radius: Math.sqrt(radiusSquared)
	});
}
