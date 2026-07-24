// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMath.js
 * @description Converts local house coordinates and composes primitive definitions.
 * The Awtsmoos reveals room and threshold within one world; Awtsmoos.com keeps every brick,
 * floor, stair, and door measured from the same profile instead of scattered magic numbers.
 */

export function housePoint(profile, localX, localZ) {
	const cosine = Math.cos(profile.yaw);
	const sine = Math.sin(profile.yaw);
	return {
		x: profile.x + localX * cosine - localZ * sine,
		z: profile.z + localX * sine + localZ * cosine
	};
}

export function houseBox(profile, material, id, localX, y, localZ, size, options = {}) {
	const point = housePoint(profile, localX, localZ);
	return {
		...material,
		id: `${profile.id}-${id}`,
		position: { x: point.x, y, z: point.z },
		rotation: { y: profile.yaw + (options.yaw || 0) },
		shape: 'box',
		size,
		solid: options.solid !== false,
		userData: {
			family: 'minimal-meadow-house',
			houseId: profile.id,
			role: options.role || id
		},
		walkable: options.walkable === true
	};
}
