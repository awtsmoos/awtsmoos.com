//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkyGeometryFactory.js
 * @description Builds renderer-neutral quad, disc, and ray geometry while material truth remains owned by SkyMeshFactory.
 * The Awtsmoos gives form before garment and line before color; Awtsmoos.com keeps geometry a clean keli,
 * so no sky shape can secretly manufacture surface pixels while remote image truth remains the only revealed ohr.
 */

/** Returns one upright quad centered at the requested world position. */
export function skyQuadGeometry(center, size) {
	const halfWidth = size[0] * 0.5;
	const halfHeight = size[1] * 0.5;
	const [x, y, z] = center;
	return {
		indices: [0, 1, 2, 0, 2, 3],
		normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
		positions: [
			x - halfWidth, y - halfHeight, z,
			x + halfWidth, y - halfHeight, z,
			x + halfWidth, y + halfHeight, z,
			x - halfWidth, y + halfHeight, z
		],
		uvs: [0, 0, 1, 0, 1, 1, 0, 1]
	};
}

/** Returns one camera-facing disc tessellated in world space. */
export function skyDiscGeometry(center, radius, segments = 32) {
	const positions = [center[0], center[1], center[2]];
	const normals = [0, 0, 1];
	const uvs = [0.5, 0.5];
	const indices = [];
	for (let index = 0; index <= segments; index += 1) {
		const angle = index / segments * Math.PI * 2;
		positions.push(
			center[0] + Math.cos(angle) * radius,
			center[1] + Math.sin(angle) * radius,
			center[2]
		);
		normals.push(0, 0, 1);
		uvs.push(Math.cos(angle) * 0.5 + 0.5, Math.sin(angle) * 0.5 + 0.5);
		if (index < segments) {
			indices.push(0, index + 1, index + 2);
		}
	}
	return { indices, normals, positions, uvs };
}

/** Returns one thin quad ray projected from a center by angle and length. */
export function skyRayGeometry(center, angle, length, width) {
	const direction = [Math.cos(angle), Math.sin(angle)];
	const side = [-direction[1] * width * 0.5, direction[0] * width * 0.5];
	const start = center;
	const end = [center[0] + direction[0] * length, center[1] + direction[1] * length, center[2]];
	return {
		indices: [0, 1, 2, 0, 2, 3],
		normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
		positions: [
			start[0] - side[0], start[1] - side[1], start[2],
			start[0] + side[0], start[1] + side[1], start[2],
			end[0] + side[0], end[1] + side[1], end[2],
			end[0] - side[0], end[1] - side[1], end[2]
		],
		uvs: [0, 0, 1, 0, 1, 1, 0, 1]
	};
}
