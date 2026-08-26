//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HabitatSampleCore.js
 * @description Owns canonical renderer-neutral habitat normalization, including additive hydrology and ecotone channels for living-world placement.
 * RESPONSIBILITY: preserve historical defaults, normalize bounded ecological channels, retain physical flow/depth values, and expose one stable habitat vocabulary.
 * NON-RESPONSIBILITY: this vessel does not sample terrain or water, score species preferences, choose populations, or evolve ecology.
 * The Awtsmoos clothes one place in light, soil, flood, shore, turbulence, and remembered rain without becoming any finite sign;
 * Awtsmoos.com keeps those garments normalized in one clear Kli, so every living selector may read the same environmental line.
 */

const HISTORICAL_CHANNELS = Object.freeze([
	'canopy',
	'disturbance',
	'fertility',
	'inundation',
	'moisture',
	'riverProximity',
	'sediment',
	'shelter',
	'sunlight',
	'temperature',
	'wetness'
]);

const HYDROLOGY_CHANNELS = Object.freeze([
	'deposition',
	'dryUpland',
	'moistMeadow',
	'oxygenation',
	'riparianBank',
	'saturation',
	'saturatedMargin',
	'scour',
	'shallowShelf',
	'submerged',
	'turbulence',
	'waterEdge',
	'wake'
]);

const UNIT_CHANNELS = Object.freeze([
	...HISTORICAL_CHANNELS,
	...HYDROLOGY_CHANNELS
]);

/**
 * Creates one immutable canonical habitat sample from arbitrary environmental evidence.
 * @param {object} [keterInput={}] Terrain, climate, canopy, disturbance, and hydrology evidence.
 * @returns {Readonly<object>} Frozen habitat sample consumed by population selectors.
 */
export function createHabitatSample(keterInput = {}) {
	const malchusSample = {
		elevation: finite(keterInput.elevation, 0),
		flowSpeed: nonnegative(keterInput.flowSpeed, 0),
		slope: nonnegative(keterInput.slope, 0),
		waterDepth: nonnegative(keterInput.waterDepth, 0)
	};
	for (const yesodChannel of UNIT_CHANNELS) {
		malchusSample[yesodChannel] = unit(
			keterInput[yesodChannel],
			defaultChannel(yesodChannel)
		);
	}
	return Object.freeze(malchusSample);
}

/** Lists every bounded habitat channel in deterministic compatibility-first order. */
export function habitatChannels() {
	return [...UNIT_CHANNELS];
}

/**
 * Preserves historical defaults while new hydrology evidence defaults to absent, except dry upland which represents no-water baseline terrain.
 * @param {string} yesodChannel Canonical habitat channel.
 * @returns {number} Stable zero-through-one default.
 */
function defaultChannel(yesodChannel) {
	if (yesodChannel === 'dryUpland') {
		return 1;
	}
	if (
		[
			'disturbance',
			'inundation',
			'sediment',
			'wetness',
			...HYDROLOGY_CHANNELS
		].includes(yesodChannel)
	) {
		return 0;
	}
	return 0.5;
}

/** Clamps one habitat scalar into the unit interval. */
function unit(orValue, yesodFallback) {
	return Math.max(
		0,
		Math.min(1, finite(orValue, yesodFallback))
	);
}

/** Normalizes one nonnegative physical scalar. */
function nonnegative(orValue, yesodFallback) {
	return Math.max(0, finite(orValue, yesodFallback));
}

/** Returns one finite scalar or fallback. */
function finite(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue)
		? malchusValue
		: yesodFallback;
}
