// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrologySampling.js
 * @description Interpolates full river channel evidence without burdening the hydrology builder.
 * The Awtsmoos remains one between authored samples; Awtsmoos.com carries depth, flow, moisture,
 * frame, width, and position continuously so every downstream system receives the same river between measured stones.
 */

export function sampleHydrologyPoint(points, t) {
	const scaled = clamp(t, 0, 1) * (points.length - 1);
	const firstIndex = Math.min(points.length - 2, Math.floor(scaled));
	const amount = scaled - firstIndex;
	return interpolatePoint(points[firstIndex], points[firstIndex + 1], amount);
}

function interpolatePoint(first, second, amount) {
	return {
		bankWetness: interpolate(first.bankWetness, second.bankWetness, amount),
		depth: interpolate(first.depth, second.depth, amount),
		flowRegime: amount < 0.5 ? first.flowRegime : second.flowRegime,
		flowSpeed: interpolate(first.flowSpeed, second.flowSpeed, amount),
		normal: {
			x: interpolate(first.normal.x, second.normal.x, amount),
			z: interpolate(first.normal.z, second.normal.z, amount)
		},
		t: interpolate(first.t, second.t, amount),
		width: interpolate(first.width, second.width, amount),
		x: interpolate(first.x, second.x, amount),
		y: interpolate(first.y, second.y, amount),
		z: interpolate(first.z, second.z, amount)
	};
}

function interpolate(first, second, amount) {
	return first + (second - first) * amount;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
