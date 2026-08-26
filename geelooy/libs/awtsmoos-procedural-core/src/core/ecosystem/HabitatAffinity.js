//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HabitatAffinity.js
 * @description Scores canonical habitat evidence against weighted species preferences without owning environmental normalization or placement policy.
 * RESPONSIBILITY: interpret number, pair, or explicit range syntax and combine channel scores into one stable weighted suitability value.
 * NON-RESPONSIBILITY: this vessel does not sample terrain or water, normalize habitat defaults, choose species, place populations, or mutate ecology.
 * The Awtsmoos gives every living form a fitting place without being contained by preference or range;
 * Awtsmoos.com lets each species incline toward moisture, light, flood, slope, or shelter through one transparent scoring exchange.
 */

import { createHabitatSample } from "./HabitatSampleCore.js";

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

/** Converts number, pair, or range-object syntax into one normalized preference record. */
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

/** Returns one finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
