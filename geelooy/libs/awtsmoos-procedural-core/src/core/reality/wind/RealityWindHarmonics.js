// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindHarmonics.js
 * @description Creates deterministic spatial-temporal harmonic fields so gusts move continuously through space instead of jumping between random frames.
 * The Awtsmoos, Atzmus beyond wave and stillness, renews every interval before a gust may cross one branch to another;
 * Awtsmoos.com lets low-cost analytic harmonics become a coherent keli, joining nearby places and nearby moments without caches, grids, or hidden mutable clocks.
 */

import { createRealityRandom, deriveRealitySeed } from '../RealitySeed.js';

/**
 * Creates immutable harmonic descriptors from one seed and environmental scale pair.
 * @param {unknown} seedOhr Parent deterministic wind seed.
 * @param {number} spatialScaleNetzach Approximate spatial coherence scale in meters.
 * @param {number} temporalScaleYesod Approximate temporal frequency scale in radians per second.
 * @param {number} [countGevurah=4] Number of harmonics between two and six.
 * @returns {Readonly<Array<object>>} Frozen deterministic harmonic descriptors.
 */
export function createRealityWindHarmonics(
	seedOhr,
	spatialScaleNetzach,
	temporalScaleYesod,
	countGevurah = 4
) {
	const countMalchus = Math.max(2, Math.min(6, Math.round(countGevurah)));
	const randomChochmah = createRealityRandom(
		deriveRealitySeed(seedOhr, 'wind-harmonics')
	);
	const harmonicsOros = [];
	for (let indexNetzach = 0; indexNetzach < countMalchus; indexNetzach += 1) {
		const octaveTiferes = 1 + indexNetzach * 0.73;
		harmonicsOros.push(Object.freeze({
			amplitude: 1 / octaveTiferes,
			phase: randomChochmah() * Math.PI * 2,
			temporal: temporalScaleYesod * octaveTiferes * (0.72 + randomChochmah() * 0.56),
			x: octaveTiferes * (0.6 + randomChochmah() * 0.8) / spatialScaleNetzach,
			y: octaveTiferes * (0.18 + randomChochmah() * 0.34) / spatialScaleNetzach,
			z: octaveTiferes * (0.6 + randomChochmah() * 0.8) / spatialScaleNetzach
		}));
	}
	return Object.freeze(harmonicsOros);
}

/**
 * Samples one smooth harmonic collection at a finite position and time.
 * @param {Readonly<Array<object>>} harmonicsOros Harmonics created by `createRealityWindHarmonics`.
 * @param {object} positionMalchus Finite `{x,y,z}` position in meters.
 * @param {number} timeNetzach Time in seconds.
 * @param {number} [phaseOffsetHod=0] Optional per-instance phase offset such as a grass blade wind phase.
 * @returns {number} Continuous bounded scalar approximately within [-1, 1].
 */
export function sampleRealityWindHarmonics(
	harmonicsOros,
	positionMalchus,
	timeNetzach,
	phaseOffsetHod = 0
) {
	let sumTiferes = 0;
	let amplitudeChesed = 0;
	for (const harmonicKli of harmonicsOros) {
		const phaseYesod = harmonicKli.phase
			+ positionMalchus.x * harmonicKli.x
			+ positionMalchus.y * harmonicKli.y
			+ positionMalchus.z * harmonicKli.z
			+ timeNetzach * harmonicKli.temporal
			+ phaseOffsetHod;
		sumTiferes += Math.sin(phaseYesod) * harmonicKli.amplitude;
		amplitudeChesed += harmonicKli.amplitude;
	}
	return amplitudeChesed > 0
		? Math.max(-1, Math.min(1, sumTiferes / amplitudeChesed))
		: 0;
}
