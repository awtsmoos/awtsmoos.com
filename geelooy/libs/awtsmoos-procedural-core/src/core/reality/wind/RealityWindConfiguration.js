// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindConfiguration.js
 * @description Resolves semantic profile defaults plus caller overrides into one immutable bounded wind-field configuration.
 * The Awtsmoos, Atzmus beyond force and limit, renews every possible current while Gevurah gives each finite field a truthful measure;
 * Awtsmoos.com lets direction, speed, gust, turbulence, lift, seed, and coherence become explicit data so no renderer or frame loop must guess their covenant.
 */

import { normalizeRealitySeed } from '../RealitySeed.js';
import { realityWindProfile } from './RealityWindProfiles.js';
import {
	clampRealityWindNumber,
	normalizeRealityWindDirection
} from './RealityWindVector.js';

/**
 * Creates one immutable wind configuration using SI-oriented units and bounded fractions.
 * @param {object} [optionsChesed={}] Profile name plus optional direction, speed, gustiness, turbulence, lift, seed, and coherence overrides.
 * @returns {Readonly<object>} Frozen configuration consumed by `RealityWindField` and universal diagnostics.
 */
export function createRealityWindConfiguration(optionsChesed = {}) {
	const profileBinah = realityWindProfile(optionsChesed.profile || 'meadow');
	const seedYesod = normalizeRealitySeed(optionsChesed.seed ?? 613);
	return Object.freeze({
		direction: normalizeRealityWindDirection(optionsChesed.direction ?? 0),
		gustiness: clampRealityWindNumber(
			optionsChesed.gustiness,
			0,
			1,
			profileBinah.gustiness
		),
		profile: profileBinah.id,
		seed: seedYesod,
		spatialScale: clampRealityWindNumber(
			optionsChesed.spatialScale,
			0.25,
			10000,
			profileBinah.spatialScale
		),
		speed: clampRealityWindNumber(
			optionsChesed.speed,
			0,
			90,
			profileBinah.speed
		),
		temporalScale: clampRealityWindNumber(
			optionsChesed.temporalScale,
			0.001,
			12,
			profileBinah.temporalScale
		),
		turbulence: clampRealityWindNumber(
			optionsChesed.turbulence,
			0,
			1,
			profileBinah.turbulence
		),
		verticalLift: clampRealityWindNumber(
			optionsChesed.verticalLift,
			-1,
			1,
			profileBinah.verticalLift
		)
	});
}
