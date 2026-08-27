// B"H
/**
 * @file MovieEasing.js
 * @description The small mathematical river beneath every actor and camera clip.
 */
const EASINGS = Object.freeze({
	linear: (value) => value,
	easeInQuad: (value) => value * value,
	easeOutQuad: (value) => 1 - (1 - value) * (1 - value),
	easeInOutQuad: (value) => value < .5
		? 2 * value * value
		: 1 - Math.pow(-2 * value + 2, 2) / 2,
	easeInOutCubic: (value) => value < .5
		? 4 * value * value * value
		: 1 - Math.pow(-2 * value + 2, 3) / 2,
	smoothstep: (value) => value * value * (3 - 2 * value),
	smootherstep: (value) => value * value * value * (value * (value * 6 - 15) + 10)
});

export function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

export function ease(name, value) {
	return (EASINGS[name] || EASINGS.linear)(clamp01(value));
}

export function lerp(first, second, amount) {
	return Number(first || 0) + (Number(second || 0) - Number(first || 0)) * amount;
}

export function lerpPoint(first = {}, second = {}, amount = 0) {
	return {
		x: lerp(first.x, second.x, amount),
		y: lerp(first.y, second.y, amount),
		z: lerp(first.z, second.z, amount)
	};
}

export const MOVIE_EASING_NAMES = Object.freeze(Object.keys(EASINGS));
