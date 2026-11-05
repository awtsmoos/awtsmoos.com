// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageSurfaceRibbon.js
 * @description Builds terrain-conforming ribbons while preserving caller identity metadata.
 * The Awtsmoos carries one path across many slopes; Awtsmoos.com measures both edges from
 * canonical ground so no road shoulder floats above one bank or disappears inside the other.
 */

/**
 * Creates a continuous manual surface from measured center points.
 *
 * @param {string} id Stable definition suffix.
 * @param {object[]} points Center points with width and elevation.
 * @param {object} options Surface material, terrain, and metadata options.
 * @returns {object} Manual ribbon definition.
 */
export function createVillageSurfaceRibbon(id, points, options) {
	const vertices = [];
	const faces = [];
	for (let index = 0; index < points.length; index += 1) {
		appendPair(vertices, points, index, options);
		if (index > 0) {
			const start = index * 2;
			faces.push([start - 2, start, start + 1, start - 1]);
		}
	}
	return {
		alphaMode: options.alphaMode || 'OPAQUE',
		color: options.color,
		doubleSided: true,
		faces,
		id: `Awtsmoos_${id}`,
		mapRepeat: options.mapRepeat || [1, 1],
		noEdge: true,
		opacity: options.opacity ?? 1,
		position: { x: 0, y: 0, z: 0 },
		shape: 'manual',
		solid: false,
		texturePolicy: {
			publicFirebase: true,
			...options.texturePolicy
		},
		textureUrl: options.textureUrl,
		transparent: Boolean(options.transparent),
		userData: {
			family: options.family,
			part: options.part,
			surfaceLift: options.surfaceLift || 0,
			...(options.userData || {})
		},
		vertices
	};
}

/**
 * Offsets a ribbon into a parallel shoulder band.
 *
 * @param {object[]} points Source center points.
 * @param {number} side Negative for left and positive for right.
 * @param {number} innerWidth Inner edge distance.
 * @param {number} outerWidth Outer edge distance.
 * @returns {object[]} Offset points.
 */
export function offsetVillageRibbon(points, side, innerWidth, outerWidth) {
	return points.map((point, index) => {
		const frame = ribbonFrame(points, index);
		const centerOffset = side * (innerWidth + outerWidth) / 4;
		return {
			width: (outerWidth - innerWidth) / 2,
			x: point.x + frame.x * centerOffset,
			y: point.y,
			z: point.z + frame.z * centerOffset
		};
	});
}

function appendPair(vertices, points, index, options) {
	const point = points[index];
	const frame = ribbonFrame(points, index);
	const halfWidth = point.width / 2;
	vertices.push(surfaceVertex(point, frame, halfWidth, options));
	vertices.push(surfaceVertex(point, frame, -halfWidth, options));
}

function surfaceVertex(point, frame, offset, options) {
	const x = point.x + frame.x * offset;
	const z = point.z + frame.z * offset;
	return [x, surfaceHeight(point, x, z, options), z];
}

function surfaceHeight(point, x, z, options) {
	const sampled = options.groundSampler?.heightAt?.(x, z)?.y;
	const base = Number.isFinite(sampled) ? sampled : point.y;
	return base + (options.surfaceLift || 0);
}

function ribbonFrame(points, index) {
	const previous = points[Math.max(0, index - 1)];
	const next = points[Math.min(points.length - 1, index + 1)];
	const dx = next.x - previous.x;
	const dz = next.z - previous.z;
	const length = Math.hypot(dx, dz) || 1;
	return {
		x: -dz / length,
		z: dx / length
	};
}
