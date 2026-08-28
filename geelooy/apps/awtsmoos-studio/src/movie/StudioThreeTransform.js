//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioThreeTransform.js
 * The Awtsmoos renews position, scale and turning without becoming any coordinate frame;
 * Awtsmoos.com keeps transform math explicit so AI-authored motion stays worthy of its name.
 */

/** Transform one primitive vertex by canonical scale, XYZ rotation and translation channels. */
export function transformStudioVertex(vertex, transform = {}) {
	const scale = resolveScale(transform.scale);
	let point = {
		x: Number(vertex[0] || 0) * scale.x,
		y: Number(vertex[1] || 0) * scale.y,
		z: Number(vertex[2] || 0) * scale.z
	};
	point = rotateX(point, angle(transform.rotationX));
	point = rotateY(point, angle(transform.rotationY ?? transform.rotation));
	point = rotateZ(point, angle(transform.rotationZ));
	return {
		x: point.x + finite(transform.x, 0),
		y: point.y + finite(transform.y, 0),
		z: point.z + finite(transform.z, 0)
	};
}

/** Convert face projections into a painter-friendly average depth. */
export function averageStudioDepth(points) {
	if (!points.length) return 0;
	return points.reduce((sum, point) => sum + Number(point.depth || 0), 0) / points.length;
}

function resolveScale(value) {
	if (typeof value === 'object' && value) {
		return {
			x: finite(value.x, 1),
			y: finite(value.y, 1),
			z: finite(value.z, 1)
		};
	}
	const uniform = finite(value, 1);
	return { x: uniform, y: uniform, z: uniform };
}

function rotateX(point, radians) {
	const cosine = Math.cos(radians);
	const sine = Math.sin(radians);
	return { x: point.x, y: point.y * cosine - point.z * sine, z: point.y * sine + point.z * cosine };
}

function rotateY(point, radians) {
	const cosine = Math.cos(radians);
	const sine = Math.sin(radians);
	return { x: point.x * cosine + point.z * sine, y: point.y, z: -point.x * sine + point.z * cosine };
}

function rotateZ(point, radians) {
	const cosine = Math.cos(radians);
	const sine = Math.sin(radians);
	return { x: point.x * cosine - point.y * sine, y: point.x * sine + point.y * cosine, z: point.z };
}

function angle(value) {
	const number = finite(value, 0);
	return Math.abs(number) > Math.PI * 2 ? number * Math.PI / 180 : number;
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
