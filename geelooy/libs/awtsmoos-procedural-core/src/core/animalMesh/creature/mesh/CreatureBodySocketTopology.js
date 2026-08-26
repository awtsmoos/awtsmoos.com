// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureBodySocketTopology.js
 * @description Owns the structured-grid topology arithmetic for one eight-vertex torso socket without knowing where anatomy chooses to place it.
 * RESPONSIBILITY: derive the ordered 3x3-patch perimeter, identify the four removed body quads, and filter those triangles from the torso index buffer.
 * NON-RESPONSIBILITY: this file does not search geometry, resolve anatomical anchors, claim socket ownership, bridge limbs, or rebuild normals.
 * The Awtsmoos renews every edge before flesh appears, while Awtsmoos.com lets this quiet topology vessel remember what opens and what remains;
 * one measured ring may welcome a limb without teaching the socket where the creature's living intention names.
 */

/** Creates one ordered socket boundary plus the exact body-triangle identities removed beneath it. */
export function createCreatureBodySocketTopology(ring, radial, radialSegments) {
	const rows = [ring - 1, ring, ring + 1];
	const columns = [
		wrap(radial - 1, radialSegments),
		radial,
		wrap(radial + 1, radialSegments)
	];
	return {
		boundary: socketBoundary(rows, columns, radialSegments),
		removedTriangleKeys: socketTriangleKeys(rows, columns, radialSegments)
	};
}

/** Removes only triangles claimed by limb sockets while preserving torso caps and untouched quads. */
export function filterCreatureBodySocketTriangles(indices, removedTriangleKeys) {
	const filtered = [];
	for (let index = 0; index < indices.length; index += 3) {
		const triangle = indices.slice(index, index + 3);
		if (!removedTriangleKeys.has(triangleKey(...triangle))) {
			filtered.push(...triangle);
		}
	}
	return filtered;
}

/** Returns the retained-face orientation around one 2x2 torso-quad opening. */
function socketBoundary(rows, columns, radialSegments) {
	return [
		vertex(rows[0], columns[0], radialSegments),
		vertex(rows[0], columns[1], radialSegments),
		vertex(rows[0], columns[2], radialSegments),
		vertex(rows[1], columns[2], radialSegments),
		vertex(rows[2], columns[2], radialSegments),
		vertex(rows[2], columns[1], radialSegments),
		vertex(rows[2], columns[0], radialSegments),
		vertex(rows[1], columns[0], radialSegments)
	];
}

/** Produces stable identities for the eight triangles belonging to four removed torso quads. */
function socketTriangleKeys(rows, columns, radialSegments) {
	const keys = [];
	for (let rowIndex = 0; rowIndex < 2; rowIndex += 1) {
		for (let columnIndex = 0; columnIndex < 2; columnIndex += 1) {
			const a = vertex(rows[rowIndex], columns[columnIndex], radialSegments);
			const b = vertex(rows[rowIndex + 1], columns[columnIndex], radialSegments);
			const c = vertex(rows[rowIndex + 1], columns[columnIndex + 1], radialSegments);
			const d = vertex(rows[rowIndex], columns[columnIndex + 1], radialSegments);
			keys.push(triangleKey(a, b, c), triangleKey(a, c, d));
		}
	}
	return keys;
}

/** Creates one order-insensitive triangle identity for deterministic removal and collision claims. */
function triangleKey(a, b, c) {
	return [a, b, c].sort((left, right) => left - right).join(":");
}

/** Converts one structured body-grid coordinate into its stable torso vertex index. */
function vertex(ring, radial, radialSegments) {
	return ring * radialSegments + radial;
}

/** Wraps radial grid coordinates around the closed torso circumference. */
function wrap(value, modulus) {
	return ((value % modulus) + modulus) % modulus;
}
