//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherMath.js
 * @description Small deterministic numeric helpers shared by the renderer-neutral weather simulation.
 * Weather sampling must remain reproducible, bounded, allocation-light, and independent of browser or renderer APIs.
 */

/** Clamps one finite value into an inclusive interval. */
export function clampWeather(value, minimum, maximum) {
	const finite = Number.isFinite(Number(value)) ? Number(value) : minimum;
	return Math.min(maximum, Math.max(minimum, finite));
}

/** Linearly interpolates two finite scalar values. */
export function lerpWeather(left, right, alpha) {
	return left + (right - left) * clampWeather(alpha, 0, 1);
}

/** Produces a smooth Hermite transition within an interval. */
export function smoothWeather(edge0, edge1, value) {
	if (edge1 === edge0) return value >= edge1 ? 1 : 0;
	const t = clampWeather((value - edge0) / (edge1 - edge0), 0, 1);
	return t * t * (3 - 2 * t);
}

/** Wraps an angle in radians into the [0, 2π) interval. */
export function wrapWeatherAngle(angle) {
	const tau = Math.PI * 2;
	return ((Number(angle) || 0) % tau + tau) % tau;
}

/** Converts an angle into a normalized horizontal X/Z direction. */
export function weatherDirection(angle) {
	const wrapped = wrapWeatherAngle(angle);
	return Object.freeze([Math.cos(wrapped), Math.sin(wrapped)]);
}

/** Returns squared horizontal distance without allocating temporary vectors. */
export function weatherDistanceSquared(left, right) {
	const dx = Number(left?.x || 0) - Number(right?.x || 0);
	const dz = Number(left?.z || 0) - Number(right?.z || 0);
	return dx * dx + dz * dz;
}

/** Stable integer hash used only for deterministic weather variation. */
export function weatherHash(seed, x, z) {
	let value = (Number(seed) | 0) ^ Math.imul(Number(x) | 0, 374761393);
	value ^= Math.imul(Number(z) | 0, 668265263);
	value = Math.imul(value ^ (value >>> 13), 1274126177);
	return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}
