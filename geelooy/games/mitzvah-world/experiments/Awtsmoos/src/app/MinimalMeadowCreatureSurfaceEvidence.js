// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureSurfaceEvidence.js
 * @description Measures procedural canvas pixels or falls back to the authored palette contract.
 * The Awtsmoos makes evidence stronger than assumption; Awtsmoos.com weighs every sampled hue
 * so minimum, average, and maximum surface luminance remain durable before and after hydration.
 */

export function measureMinimalCreatureSurface(context, family, size) {
	const fallback = authoredEvidence(family);
	if (!context?.getImageData) return fallback;
	try {
		return sampledEvidence(context.getImageData(0, 0, size, size).data, family);
	} catch {
		return fallback;
	}
}

function authoredEvidence(family) {
	const colors = family.colors.map(hexColor);
	const average = weightedColor(colors, [0.34, 0.34, 0.22, 0.1]);
	return freezeEvidence(colors, average, family, 0, 'authored-palette');
}

function sampledEvidence(data, family) {
	let minimum = [1, 1, 1];
	let maximum = [0, 0, 0];
	let total = [0, 0, 0];
	let samples = 0;
	for (let index = 0; index < data.length; index += 64) {
		const color = [data[index] / 255, data[index + 1] / 255, data[index + 2] / 255];
		if (luminance(color) < luminance(minimum)) minimum = color;
		if (luminance(color) > luminance(maximum)) maximum = color;
		total = total.map((value, channel) => value + color[channel]);
		samples += 1;
	}
	const average = total.map((value) => value / Math.max(1, samples));
	return freezeEvidence([minimum, maximum], average, family, samples, 'pixel-sampled');
}

function freezeEvidence(colors, average, family, samples, measurement) {
	const ordered = [...colors].sort((first, second) => luminance(first) - luminance(second));
	return Object.freeze({
		averageColor: Object.freeze(average),
		averageLuminance: luminance(average),
		maximumColor: Object.freeze(ordered.at(-1)),
		maximumLuminance: luminance(ordered.at(-1)),
		measurement,
		minimumColor: Object.freeze(ordered[0]),
		minimumLuminance: luminance(ordered[0]),
		pattern: family.pattern,
		pixelSamples: samples
	});
}

function hexColor(value) {
	return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255);
}

function weightedColor(colors, weights) {
	return [0, 1, 2].map((channel) => colors.reduce(
		(sum, color, index) => sum + color[channel] * weights[index],
		0
	));
}

function luminance(color) {
	return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
}
