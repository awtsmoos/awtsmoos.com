// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageSurfaceRibbon.js
 * @description Builds smooth terrain-following road and shoulder surfaces from measured points.
 * The Awtsmoos joins many path samples as one invitation forward; Awtsmoos.com replaces
 * rectangular strips and roadside cubes with continuous, correctly wound village surfaces.
 */

export function createVillageSurfaceRibbon(id, points, options) {
	const vertices = [];
	const faces = [];
	for (let index = 0; index < points.length; index += 1) {
		appendPair(vertices, points, index);
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
		texturePolicy: { publicFirebase: true, ...options.texturePolicy },
		textureUrl: options.textureUrl,
		transparent: Boolean(options.transparent),
		userData: { family: options.family, part: options.part },
		vertices
	};
}

export function offsetVillageRibbon(points, side, innerWidth, outerWidth) {
	return points.map((point, index) => {
		const frame = ribbonFrame(points, index);
		const centerOffset = side * (innerWidth + outerWidth) / 4;
		return {
			width: (outerWidth - innerWidth) / 2,
			x: point.x + frame.x * centerOffset,
			y: point.y - 0.025,
			z: point.z + frame.z * centerOffset
		};
	});
}

function appendPair(vertices, points, index) {
	const point = points[index];
	const frame = ribbonFrame(points, index);
	const halfWidth = point.width / 2;
	vertices.push([point.x + frame.x * halfWidth, point.y, point.z + frame.z * halfWidth]);
	vertices.push([point.x - frame.x * halfWidth, point.y, point.z - frame.z * halfWidth]);
}

function ribbonFrame(points, index) {
	const previous = points[Math.max(0, index - 1)];
	const next = points[Math.min(points.length - 1, index + 1)];
	const dx = next.x - previous.x;
	const dz = next.z - previous.z;
	const length = Math.hypot(dx, dz) || 1;
	return { x: -dz / length, z: dx / length };
}
