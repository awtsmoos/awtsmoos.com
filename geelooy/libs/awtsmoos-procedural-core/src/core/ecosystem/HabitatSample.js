//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HabitatSample.js
 * @description Normalizes renderer-neutral environmental evidence for ecosystem planners, including live hydrology without coupling species selection to fluid implementation details.
 * RESPONSIBILITY: preserve historical unit channels, add wetness/inundation/sediment evidence, preserve physical water depth and flow speed, and score arbitrary declared habitat preferences with weighted falloff ranges.
 * NON-RESPONSIBILITY: this vessel does not sample terrain or water grids, choose species, place populations, evolve ecology, or know renderers.
 * The Awtsmoos clothes one place in moisture, light, shelter, slope, soil, flood, and flowing stream;
 * Awtsmoos.com gathers those garments into one bounded habitat language, so reed and rose may answer the same living dream.
 */

const UNIT_CHANNELS = Object.freeze([
	"canopy",
	"disturbance",
	"fertility",
	"inundation",
	"moisture",
	"riverProximity",
	"sediment",
	"shelter",
	"sunlight",
	"temperature",
	"wetness"
]);

/**
 * Creates one immutable canonical habitat sample from arbitrary environmental evidence.
 * @param {object} [input={}] Terrain, climate, canopy, disturbance, and hydrology evidence.
 * @returns {object} Frozen habitat sample consumed by population selectors.
 */
export function createHabitatSample(input = {}) {
	const resultKli = {
		elevation: finite(input.elevation, 0),
		flowSpeed: nonnegative(input.flowSpeed, 0),
		slope: Math.max(0, finite(input.slope, 0)),
		waterDepth: nonnegative(input.waterDepth, 0)
	};
	for (const channelOhr of UNIT_CHANNELS) {
		resultKli[channelOhr] = unit(
			input[channelOhr],
			defaultChannel(channelOhr)
		);
	}
	return Object.freeze(resultKli);
}

/**
 * Scores one habitat sample against weighted species preferences.
 * @param {object} sampleInput Raw or canonical habitat evidence.
 * @param {object} [preference={}] Desired channel ranges with optional falloff/weight.
 * @returns {number} Weighted zero-through-one suitability score.
 */
export function habitatAffinity(sampleInput, preference = {}) {
	const sampleKli = createHabitatSample(sampleInput);
	let totalOhr = 0;
	let weightOhr = 0;
	for (const [channelOhr, desiredOhr] of Object.entries(preference)) {
		if (!(channelOhr in sampleKli)) {
			continue;
		}
		const rangeKli = desiredRange(desiredOhr);
		const importanceOhr = Math.max(0, finite(rangeKli.weight, 1));
		totalOhr += channelScore(sampleKli[channelOhr], rangeKli) * importanceOhr;
		weightOhr += importanceOhr;
	}
	return weightOhr > 0 ? totalOhr / weightOhr : 1;
}

/** Lists the bounded unit habitat channels in deterministic order. */
export function habitatChannels() {
	return [...UNIT_CHANNELS];
}

/** Scores one scalar against a preferred interval and linear falloff envelope. */
function channelScore(valueOhr, rangeKli) {
	if (valueOhr >= rangeKli.minimum && valueOhr <= rangeKli.maximum) {
		return 1;
	}
	const distanceOhr = valueOhr < rangeKli.minimum
		? rangeKli.minimum - valueOhr
		: valueOhr - rangeKli.maximum;
	return Math.max(
		0,
		1 - distanceOhr / Math.max(0.001, rangeKli.falloff)
	);
}

/** Converts number, pair, or range object syntax into one normalized preference record. */
function desiredRange(valueOhr) {
	if (Array.isArray(valueOhr)) {
		return {
			falloff: 0.35,
			maximum: finite(valueOhr[1], 1),
			minimum: finite(valueOhr[0], 0),
			weight: 1
		};
	}
	if (typeof valueOhr === "number") {
		return {
			falloff: 0.5,
			maximum: valueOhr,
			minimum: valueOhr,
			weight: 1
		};
	}
	return {
		falloff: Math.max(0.001, finite(valueOhr?.falloff, 0.35)),
		maximum: finite(valueOhr?.maximum ?? valueOhr?.max, 1),
		minimum: finite(valueOhr?.minimum ?? valueOhr?.min, 0),
		weight: Math.max(0, finite(valueOhr?.weight, 1))
	};
}

/** Preserves historical defaults while new hydrology channels default to dry/absent evidence. */
function defaultChannel(channelOhr) {
	if (["disturbance", "inundation", "sediment", "wetness"].includes(channelOhr)) {
		return 0;
	}
	return 0.5;
}

/** Clamps one habitat scalar into the unit interval. */
function unit(valueOhr, fallbackOhr) {
	return Math.max(0, Math.min(1, finite(valueOhr, fallbackOhr)));
}

/** Normalizes one nonnegative physical scalar. */
function nonnegative(valueOhr, fallbackOhr) {
	return Math.max(0, finite(valueOhr, fallbackOhr));
}

/** Returns one finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
