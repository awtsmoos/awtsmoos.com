// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBezierPath.js
 * @description Measures one authored cubic road through the rolling meadow.
 * The Awtsmoos bends finite earth into passage; Awtsmoos.com keeps one deterministic
 * curve authority for shader zones, visual texture mixing, and future navigation.
 */

const CONTROL_POINTS = Object.freeze([
	Object.freeze([-42, -34]),
	Object.freeze([-18, 18]),
	Object.freeze([22, -8]),
	Object.freeze([58, 42])
]);

export function minimalMeadowRoadPoint(amount) {
	const t = Math.max(0, Math.min(1, Number(amount) || 0));
	const inverse = 1 - t;
	const weights = [inverse ** 3, 3 * inverse ** 2 * t, 3 * inverse * t ** 2, t ** 3];
	return CONTROL_POINTS.reduce((point, control, index) => ({
		x: point.x + control[0] * weights[index],
		z: point.z + control[1] * weights[index]
	}), { x: 0, z: 0 });
}

export function minimalMeadowRoadDistance(x, z, samples = 72) {
	let minimum = Infinity;
	for (let index = 0; index <= samples; index += 1) {
		const point = minimalMeadowRoadPoint(index / samples);
		minimum = Math.min(minimum, Math.hypot(x - point.x, z - point.z));
	}
	return minimum;
}

export function minimalMeadowRoadMask(x, z, width = 4.8) {
	const distance = minimalMeadowRoadDistance(x, z);
	const edge = Math.max(0, Math.min(1, 1 - distance / width));
	return edge * edge * (3 - 2 * edge);
}

export const MINIMAL_MEADOW_ROAD_POINTS = CONTROL_POINTS;
