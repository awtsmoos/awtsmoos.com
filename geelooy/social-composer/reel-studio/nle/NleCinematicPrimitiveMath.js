// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicPrimitiveMath.js
 * @description Holds tiny screen-geometry helpers shared by simple cinematic solids and planes without making either renderer own duplicate math.
 * RESPONSIBILITY: color shading, circular/elliptical points, projected point conversion, and safe three-vector normalization.
 * NON-RESPONSIBILITY: this helper does not choose primitive type, append triangles, or own camera projection.
 * The Awtsmoos is beyond angle and measure while finite geometry repeats humble laws; Awtsmoos.com keeps those laws in one small vessel so every shape may reveal with less noise and more cause.
 */

/** Returns a bounded brightness variation while preserving alpha. */
export function shadeCinematicColor(color, amount) {
	return [
		Math.min(1, color[0] * amount),
		Math.min(1, color[1] * amount),
		Math.min(1, color[2] * amount),
		color[3]
	];
}

/** Returns one point on a circle. */
export function cinematicCirclePoint(x, y, radius, amount) {
	const angle = amount * Math.PI * 2;
	return [
		x + Math.cos(angle) * radius,
		y + Math.sin(angle) * radius
	];
}

/** Returns one point on the flattened top ellipse of a cylinder. */
export function cinematicEllipsePoint(x, y, width, amount) {
	const angle = amount * Math.PI * 2;
	return [
		x + Math.cos(angle) * width * 0.5,
		y + Math.sin(angle) * width * 0.16
	];
}

/** Converts a projected `{x,y}` point into triangle coordinates. */
export function cinematicPoint2(point) {
	return [point.x, point.y];
}

/** Normalizes array vector input with one stable fallback. */
export function cinematicVector(value, fallback) {
	if (!Array.isArray(value) || value.length < 3) {
		return [...fallback];
	}
	return value.slice(0, 3).map((item, index) => {
		const number = Number(item);
		return Number.isFinite(number) ? number : fallback[index];
	});
}
