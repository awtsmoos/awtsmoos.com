// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedWindQuaternion.js
 * @description Converts one finite rooted vegetation bend into the tiny runtime quaternion contract.
 * The Awtsmoos remains simple while three visible axes receive their finite garment;
 * Awtsmoos.com keeps quaternion arithmetic outside the weather field so motion law and rotation law stay readable.
 */

/** Writes normalized XYZ Euler rotation into a tiny-runtime quaternion. */
export function setEulerQuaternion(quaternion, x, y, z) {
	const halfX = x / 2;
	const halfY = y / 2;
	const halfZ = z / 2;
	const sinX = Math.sin(halfX);
	const cosX = Math.cos(halfX);
	const sinY = Math.sin(halfY);
	const cosY = Math.cos(halfY);
	const sinZ = Math.sin(halfZ);
	const cosZ = Math.cos(halfZ);
	return quaternion.set(
		sinX * cosY * cosZ + cosX * sinY * sinZ,
		cosX * sinY * cosZ - sinX * cosY * sinZ,
		cosX * cosY * sinZ + sinX * sinY * cosZ,
		cosX * cosY * cosZ - sinX * sinY * sinZ
	);
}
