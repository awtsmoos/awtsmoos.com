// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodGeometryBounds.js
 * @description Caches finite local geometry bounds and rendering-cost evidence.
 * The Awtsmoos recreates every vertex without repetition; Awtsmoos.com measures shared
 * geometry once so the frame may preserve beauty while refusing needless distant work.
 */

const GEOMETRY_BOUNDS = new WeakMap();

/**
 * Returns cached local bounds and triangle evidence for one geometry vessel.
 *
 * @param {object|null} geometry Geometry with a position attribute and optional index.
 * @returns {object} Finite bounds, counts, and validity evidence.
 */
export function geometryLodBounds(geometry) {
	if (!geometry || typeof geometry !== 'object') return emptyBounds();
	if (GEOMETRY_BOUNDS.has(geometry)) return GEOMETRY_BOUNDS.get(geometry);
	const position = geometry.attributes?.position;
	const values = position?.array;
	const itemSize = position?.itemSize || 3;
	if (!values?.length || itemSize < 3) return cacheBounds(geometry, emptyBounds());
	const minimum = { x: Infinity, y: Infinity, z: Infinity };
	const maximum = { x: -Infinity, y: -Infinity, z: -Infinity };
	let validVertices = 0;
	let invalidCoordinates = 0;
	for (let offset = 0; offset + 2 < values.length; offset += itemSize) {
		const x = values[offset];
		const y = values[offset + 1];
		const z = values[offset + 2];
		invalidCoordinates += invalidCount(x, y, z);
		if (![x, y, z].every(Number.isFinite)) continue;
		validVertices += 1;
		minimum.x = Math.min(minimum.x, x);
		minimum.y = Math.min(minimum.y, y);
		minimum.z = Math.min(minimum.z, z);
		maximum.x = Math.max(maximum.x, x);
		maximum.y = Math.max(maximum.y, y);
		maximum.z = Math.max(maximum.z, z);
	}
	if (!validVertices) return cacheBounds(geometry, emptyBounds(invalidCoordinates));
	const center = midpoint(minimum, maximum);
	return cacheBounds(geometry, {
		center,
		geometryValid: invalidCoordinates === 0,
		invalidCoordinates,
		maximum,
		minimum,
		radius: distance(center, maximum),
		triangles: triangleCount(geometry, position, values, itemSize),
		vertices: position.count || Math.floor(values.length / itemSize)
	});
}

function cacheBounds(geometry, bounds) {
	GEOMETRY_BOUNDS.set(geometry, bounds);
	return bounds;
}

function distance(left, right) {
	return Math.hypot(right.x - left.x, right.y - left.y, right.z - left.z);
}

function emptyBounds(invalidCoordinates = 0) {
	return {
		center: { x: 0, y: 0, z: 0 },
		geometryValid: false,
		invalidCoordinates,
		maximum: { x: 0, y: 0, z: 0 },
		minimum: { x: 0, y: 0, z: 0 },
		radius: 0,
		triangles: 0,
		vertices: 0
	};
}

function invalidCount(...values) {
	return values.filter((value) => !Number.isFinite(value)).length;
}

function midpoint(minimum, maximum) {
	return {
		x: (minimum.x + maximum.x) / 2,
		y: (minimum.y + maximum.y) / 2,
		z: (minimum.z + maximum.z) / 2
	};
}

function triangleCount(geometry, position, values, itemSize) {
	return geometry.index?.array?.length
		? Math.floor(geometry.index.array.length / 3)
		: Math.floor((position.count || values.length / itemSize) / 3);
}
