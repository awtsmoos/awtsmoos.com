// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicProjection.js
 * @description Projects editable cinematic world coordinates through either authored camera state or the exact legacy travelling-camera fallback.
 * RESPONSIBILITY: turn world x/z into deterministic screen x/y/scale and provide shared rectangle/triangle/interpolation helpers.
 * NON-RESPONSIBILITY: this file does not choose camera shots, render objects, or own real gameplay perspective matrices.
 * The Awtsmoos is beyond near and far while every film chooses one finite frame; Awtsmoos.com lets authored lenses finally bend the preview while old village motion keeps its trusted name.
 */

/** Creates the shared pseudo-3D projection used by WebGL and fallback frames. */
export function createVillageProjection(
	width,
	height,
	time,
	duration,
	cameraState = null
) {
	const camera = cameraState || legacyCamera(time, duration);
	return (x, z) => {
		const depth = z - camera.cameraZ;
		const baseScale = 0.82 + depth / 95;
		const scale = clamp(baseScale * Number(camera.zoom || 1), 0.24, 1.9);
		return {
			scale,
			x: width * 0.5 + (x - camera.cameraX) * 11 * scale,
			y: height * Number(camera.horizon || 0.61) + depth * 5.2 * scale
		};
	};
}

/** Samples one normalized x/z path without assuming a character must exist. */
export function characterAt(path, progress) {
	if (!Array.isArray(path) || !path.length) {
		return { x: 0, z: 0 };
	}
	const value = clamp(progress, 0, 1);
	const nextIndex = path.findIndex(point => Number(point.t) >= value);
	if (nextIndex <= 0) {
		return {
			x: Number(path[0].x),
			z: Number(path[0].z)
		};
	}
	const previous = path[nextIndex - 1];
	const next = path[nextIndex];
	const span = Math.max(0.001, Number(next.t) - Number(previous.t));
	const local = (value - Number(previous.t)) / span;
	return {
		x: Number(previous.x) + (Number(next.x) - Number(previous.x)) * local,
		z: Number(previous.z) + (Number(next.z) - Number(previous.z)) * local
	};
}

/** Returns two triangles covering one screen rectangle. */
export function rectangle(x, y, width, height, color) {
	return [
		triangle([x, y], [x + width, y], [x + width, y + height], color),
		triangle([x, y], [x + width, y + height], [x, y + height], color)
	];
}

/** Creates one shared scene triangle record. */
export function triangle(first, second, third, color) {
	return {
		color,
		points: [first, second, third]
	};
}

/** Clamps one numeric value into a finite interval. */
export function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}

function legacyCamera(time, duration) {
	const progress = clamp(time / Math.max(0.001, duration), 0, 1);
	return {
		cameraX: -22 + progress * 30,
		cameraZ: 18 - progress * 24,
		horizon: 0.61,
		zoom: 1
	};
}
