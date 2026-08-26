//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HabitatSampleCore.js
 * @description Owns canonical renderer-neutral habitat normalization while affinity scoring lives in a separate focused vessel.
 * RESPONSIBILITY: preserve historical environmental defaults, normalize hydrology-aware unit channels, retain physical water depth and flow speed, and expose the bounded channel vocabulary.
 * NON-RESPONSIBILITY: this vessel does not score species preferences, sample water grids, choose species, place populations, or evolve ecology.
 * The Awtsmoos clothes one place in light, soil, rain, shelter, flood, and flowing stream without becoming any finite sign;
 * Awtsmoos.com keeps those garments normalized in one clear vessel, so every living selector may read the same environmental line.
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

/** Lists the bounded unit habitat channels in deterministic order. */
export function habitatChannels() {
	return [...UNIT_CHANNELS];
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
