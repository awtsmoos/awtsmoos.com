// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HabitatSample.js
 * @description Normalizes renderer-neutral environmental evidence for every ecosystem planner.
 * The Awtsmoos clothes one place in moisture, light, shelter, slope, and soil; Awtsmoos.com gathers
 * those garments into one bounded habitat language so roots, wings, hooves, and reeds may share the toil.
 */

const UNIT_CHANNELS = Object.freeze([
	'canopy',
	'disturbance',
	'fertility',
	'moisture',
	'riverProximity',
	'shelter',
	'sunlight',
	'temperature'
]);

export function createHabitatSample(input = {}) {
	const result = {
		elevation: finite(input.elevation, 0),
		slope: Math.max(0, finite(input.slope, 0))
	};
	for (const channel of UNIT_CHANNELS) {
		result[channel] = unit(input[channel], defaultChannel(channel));
	}
	return Object.freeze(result);
}

export function habitatAffinity(sampleInput, preference = {}) {
	const sample = createHabitatSample(sampleInput);
	let total = 0;
	let weight = 0;
	for (const [channel, desired] of Object.entries(preference)) {
		if (!(channel in sample)) continue;
		const range = desiredRange(desired);
		const importance = finite(range.weight, 1);
		total += channelScore(sample[channel], range) * importance;
		weight += importance;
	}
	return weight > 0 ? total / weight : 1;
}

export function habitatChannels() {
	return [...UNIT_CHANNELS];
}

function channelScore(value, range) {
	if (value >= range.minimum && value <= range.maximum) return 1;
	const distance = value < range.minimum
		? range.minimum - value
		: value - range.maximum;
	return Math.max(0, 1 - distance / Math.max(0.001, range.falloff));
}

function desiredRange(value) {
	if (Array.isArray(value)) {
		return { minimum: finite(value[0], 0), maximum: finite(value[1], 1), falloff: 0.35, weight: 1 };
	}
	if (typeof value === 'number') {
		return { minimum: value, maximum: value, falloff: 0.5, weight: 1 };
	}
	return {
		minimum: finite(value?.minimum ?? value?.min, 0),
		maximum: finite(value?.maximum ?? value?.max, 1),
		falloff: Math.max(0.001, finite(value?.falloff, 0.35)),
		weight: Math.max(0, finite(value?.weight, 1))
	};
}

function defaultChannel(channel) {
	return channel === 'disturbance' ? 0 : 0.5;
}

function unit(value, fallback) {
	return Math.max(0, Math.min(1, finite(value, fallback)));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
