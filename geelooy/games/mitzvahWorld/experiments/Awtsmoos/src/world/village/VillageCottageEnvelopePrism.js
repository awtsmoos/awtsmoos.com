// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageEnvelopePrism.js
 * @description Provides pure prism and ring geometry for the one canonical cottage envelope.
 * The Awtsmoos shapes stone through measured points without becoming another house authority;
 * Awtsmoos.com keeps these equations stateless while the envelope remains the sole owner.
 */

/**
 * Appends one transformed prism into a caller-owned manual geometry accumulator.
 *
 * @param {{faces: number[][], vertices: number[][]}} mesh - Shared envelope geometry.
 * @param {number[][]} ring - Ordered local X/Z perimeter.
 * @param {number} bottom - Local bottom elevation.
 * @param {number} top - Local top elevation.
 * @param {object} options - Canonical cottage transform.
 * @param {number} [skippedSide=-1] - Optional open side index.
 * @param {boolean} [includeBottom=true] - Whether to cap the bottom.
 * @returns {void}
 */
export function appendPrism(
	mesh,
	ring,
	bottom,
	top,
	options,
	skippedSide = -1,
	includeBottom = true
) {
	const first = mesh.vertices.length;
	for (const [x, z] of ring) {
		mesh.vertices.push(worldPoint(x, bottom, z, options));
	}
	for (const [x, z] of ring) {
		mesh.vertices.push(worldPoint(x, top, z, options));
	}
	const count = ring.length;
	if (includeBottom) {
		mesh.faces.push(Array.from(
			{ length: count },
			(_value, index) => first + count - index - 1
		));
	}
	mesh.faces.push(Array.from(
		{ length: count },
		(_value, index) => first + count + index
	));
	for (let index = 0; index < count; index += 1) {
		if (index === skippedSide) {
			continue;
		}
		const next = (index + 1) % count;
		mesh.faces.push([
			first + index,
			first + next,
			first + count + next,
			first + count + index
		]);
	}
}

/**
 * Creates a rectangular perimeter.
 *
 * @returns {number[][]} Ordered local perimeter.
 */
export function rectangle(startX, endX, backZ, frontZ) {
	return [
		[startX, backZ],
		[endX, backZ],
		[endX, frontZ],
		[startX, frontZ]
	];
}

/**
 * Creates an eight-point chamfered perimeter.
 *
 * @returns {number[][]} Ordered local perimeter.
 */
export function chamferedRing(width, depth, chamfer) {
	return [
		[-width + chamfer, -depth],
		[width - chamfer, -depth],
		[width, -depth + chamfer],
		[width, depth - chamfer],
		[width - chamfer, depth],
		[-width + chamfer, depth],
		[-width, depth - chamfer],
		[-width, -depth + chamfer]
	];
}

function worldPoint(localX, localY, localZ, options) {
	const cosine = Math.cos(options.yaw);
	const sine = Math.sin(options.yaw);
	return [
		options.x + localX * cosine + localZ * sine,
		options.base + localY,
		options.z - localX * sine + localZ * cosine
	];
}
