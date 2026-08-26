// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindComponents.js
 * @description Samples coherent gust, turbulence, and lift harmonics and converts their dimensionless waves into signed physical speed components.
 * The Awtsmoos, Atzmus beyond hidden wave and revealed force, renews every modulation before air can carry it through the finite world;
 * Awtsmoos.com lets this Gevurah vessel translate bounded harmonics into meters-per-second evidence while velocity composition and public sample shape remain separate lights.
 */

import { sampleRealityWindHarmonics } from './RealityWindHarmonics.js';

/**
 * Samples smooth modulation channels and converts them into physical wind-speed components.
 * Gust modulates the configured along-flow speed, turbulence yields signed perpendicular speed, and lift combines configured vertical bias with a smaller turbulent vertical term.
 * @param {Readonly<object>} configurationBinah Immutable wind configuration containing speed and modulation fractions.
 * @param {Readonly<object>} harmonicsOros Named `gust`, `turbulence`, and `lift` harmonic collections.
 * @param {Readonly<object>} positionYesod Normalized xyz position in meters.
 * @param {number} timeTiferes Explicit time in seconds.
 * @param {number} phaseHod Optional per-instance phase offset.
 * @returns {Readonly<object>} Frozen forward, gust, lateral, and vertical speed components in meters per second.
 */
export function sampleRealityWindComponents(
	configurationBinah,
	harmonicsOros,
	positionYesod,
	timeTiferes,
	phaseHod
) {
	const gustOhr = channelSample(
		harmonicsOros.gust,
		positionYesod,
		timeTiferes,
		phaseHod
	);
	const turbulenceOhr = channelSample(
		harmonicsOros.turbulence,
		positionYesod,
		timeTiferes,
		phaseHod + 1.618
	);
	const liftOhr = channelSample(
		harmonicsOros.lift,
		positionYesod,
		timeTiferes,
		phaseHod + 3.142
	);
	const gustChesed = configurationBinah.speed
		* configurationBinah.gustiness
		* gustOhr;
	return Object.freeze({
		forward: Math.max(0, configurationBinah.speed + gustChesed),
		gust: gustChesed,
		lateral: configurationBinah.speed
			* configurationBinah.turbulence
			* turbulenceOhr,
		vertical: configurationBinah.speed
			* (
				configurationBinah.verticalLift
				+ configurationBinah.turbulence * 0.25 * liftOhr
			)
	});
}

/**
 * Delegates one named harmonic collection to the shared continuous field sampler.
 * @param {Readonly<Array<object>>} harmonicOros Harmonic descriptors for one environmental channel.
 * @param {Readonly<object>} positionYesod Normalized xyz position in meters.
 * @param {number} timeTiferes Explicit time in seconds.
 * @param {number} phaseHod Per-instance phase offset in radians.
 * @returns {number} Continuous bounded modulation scalar approximately within [-1, 1].
 */
function channelSample(harmonicOros, positionYesod, timeTiferes, phaseHod) {
	return sampleRealityWindHarmonics(
		harmonicOros,
		positionYesod,
		timeTiferes,
		phaseHod
	);
}
