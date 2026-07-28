// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCinematicProjection
 * @description
 * A deterministic moving camera projects the editable village plane into cinematic
 * screen coordinates shared by WebGL and the truthful two-dimensional fallback.
 */

export function createVillageProjection(width, height, time, duration) {
	const progress = clamp(time / Math.max(.001, duration), 0, 1);
	const cameraX = -22 + progress * 30;
	const cameraZ = 18 - progress * 24;
	return (x, z) => {
		const depth = z - cameraZ;
		const scale = clamp(.82 + depth / 95, .42, 1.42);
		return {
			scale,
			x: width * .5 + (x - cameraX) * 11 * scale,
			y: height * .61 + depth * 5.2 * scale
		};
	};
}

export function characterAt(path, progress) {
	if (!Array.isArray(path) || !path.length) return { x: 0, z: 0 };
	const value = clamp(progress, 0, 1);
	const nextIndex = path.findIndex(point => Number(point.t) >= value);
	if (nextIndex <= 0) return { x: Number(path[0].x), z: Number(path[0].z) };
	const previous = path[nextIndex - 1];
	const next = path[nextIndex];
	const span = Math.max(.001, Number(next.t) - Number(previous.t));
	const local = (value - Number(previous.t)) / span;
	return {
		x: Number(previous.x) + (Number(next.x) - Number(previous.x)) * local,
		z: Number(previous.z) + (Number(next.z) - Number(previous.z)) * local
	};
}

export function rectangle(x, y, width, height, color) {
	return [triangle([x, y], [x + width, y], [x + width, y + height], color), triangle([x, y], [x + width, y + height], [x, y + height], color)];
}

export function triangle(first, second, third, color) {
	return { color, points: [first, second, third] };
}

export function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}
