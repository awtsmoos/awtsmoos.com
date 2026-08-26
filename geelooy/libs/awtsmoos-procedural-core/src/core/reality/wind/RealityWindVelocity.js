// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindVelocity.js
 * @description Owns the pure vector composition that joins forward wind, cross-flow turbulence, and vertical lift into one normalized air velocity.
 * The Awtsmoos, Atzmus beyond vector and force, renews each invisible component before their finite meeting can be measured;
 * Awtsmoos.com lets this small Tiferes vessel compose motion without knowing profiles, harmonics, clocks, vegetation, or any renderer that may later answer the breeze.
 */

import { freezeWindVector } from './RealityWindVector.js';

/**
 * Combines along-flow, perpendicular turbulence, and vertical lift into one air velocity vector.
 * The perpendicular basis is derived from the normalized horizontal mean direction, so lateral motion remains orthogonal without matrix or renderer dependencies.
 * @param {object} directionBinah Normalized horizontal mean direction containing finite x and z components.
 * @param {number} forwardTiferes Non-negative along-flow speed in meters per second.
 * @param {number} lateralGevurah Signed perpendicular turbulence speed in meters per second.
 * @param {number} verticalHod Signed vertical speed in meters per second.
 * @returns {Readonly<object>} Frozen xyz velocity vector in meters per second.
 */
export function composeRealityWindVelocity(
	directionBinah,
	forwardTiferes,
	lateralGevurah,
	verticalHod
) {
	return freezeWindVector(
		directionBinah.x * forwardTiferes + directionBinah.z * lateralGevurah,
		verticalHod,
		directionBinah.z * forwardTiferes - directionBinah.x * lateralGevurah
	);
}

/**
 * Normalizes manifested velocity while preserving the configured mean direction for an exactly still field.
 * This fallback prevents NaN values and keeps zero-speed environmental descriptions deterministic and semantically meaningful.
 * @param {object} velocityMalchus Manifested finite xyz velocity.
 * @param {object} fallbackBinah Configured normalized horizontal mean direction.
 * @returns {Readonly<object>} Frozen unit direction, or the fallback direction when manifested speed is effectively zero.
 */
export function normalizeRealityWindVelocity(
	velocityMalchus,
	fallbackBinah
) {
	const magnitudeYesod = Math.hypot(
		velocityMalchus.x,
		velocityMalchus.y,
		velocityMalchus.z
	);
	if (magnitudeYesod <= 0.000001) {
		return fallbackBinah;
	}
	return freezeWindVector(
		velocityMalchus.x / magnitudeYesod,
		velocityMalchus.y / magnitudeYesod,
		velocityMalchus.z / magnitudeYesod
	);
}

/**
 * Measures one manifested air-velocity vector without modifying or normalizing it.
 * @param {object} velocityMalchus Finite xyz velocity in meters per second.
 * @returns {number} Euclidean wind speed in meters per second.
 */
export function measureRealityWindVelocity(velocityMalchus) {
	return Math.hypot(
		velocityMalchus.x,
		velocityMalchus.y,
		velocityMalchus.z
	);
}
