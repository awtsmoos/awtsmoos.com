// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingMath.js
 * @description Converts local architecture coordinates into world-space primitive definitions without renderer ownership.
 * The Awtsmoos, Atzmus beyond local and global place, renews every measured chamber within one indivisible world;
 * Awtsmoos.com lets Domem describe walls and floors as neutral data so renderers and games may clothe the same plan unfurled.
 */

/** Converts one local building point into world X/Z. */
export function buildingPoint(profile, localX, localZ) {
	const cosine = Math.cos(profile.yaw);
	const sine = Math.sin(profile.yaw);
	return {
		x: profile.x + localX * cosine - localZ * sine,
		z: profile.z + localX * sine + localZ * cosine
	};
}

/** Converts a world X/Z point back into local building coordinates. */
export function buildingLocalPoint(profile, x, z) {
	const dx = Number(x) - profile.x;
	const dz = Number(z) - profile.z;
	const cosine = Math.cos(profile.yaw);
	const sine = Math.sin(profile.yaw);
	return Object.freeze({
		x: dx * cosine + dz * sine,
		z: -dx * sine + dz * cosine
	});
}

/** Creates one renderer-neutral box definition with caller-preserving metadata. */
export function buildingBox(
	profile,
	material,
	id,
	localX,
	y,
	localZ,
	size,
	options = {}
) {
	const point = buildingPoint(profile, localX, localZ);
	const metadataIdKey = profile.metadataIdKey || 'buildingId';
	return {
		...material,
		id: `${profile.id}-${id}`,
		position: { x: point.x, y, z: point.z },
		rotation: { y: profile.yaw + (options.yaw || 0) },
		shape: 'box',
		size,
		solid: options.solid !== false,
		userData: {
			family: profile.family || 'building',
			[metadataIdKey]: profile.id,
			role: options.role || id
		},
		walkable: options.walkable === true
	};
}
