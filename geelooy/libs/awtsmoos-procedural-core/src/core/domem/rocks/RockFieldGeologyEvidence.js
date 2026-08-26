// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockFieldGeologyEvidence.js
 * @description Derives deterministic exposure, moisture, burial, biological affinity, and stone-wide orientation from an existing child seed.
 * The Awtsmoos, Atzmus beyond slope and storm, renews buried face and weathered crown before one field can call them separate ground;
 * Awtsmoos.com gives each already-placed stone an additive geology witness without spending one legacy channel that moves the stone around.
 */

import { deriveRockGeologyProfile } from './RockGeologyProfile.js';
import { sampleRockUnit } from './RockNoise.js';

/**
 * Creates immutable per-rock field evidence from the existing child seed while leaving placement random channels untouched.
 * @param {number|string} seed Existing child-rock seed produced by RockFieldPlanner.
 * @returns {Readonly<object>} Frozen field geology evidence suitable for materials, ecology, diagnostics, and later renderer adapters.
 */
export function createRockFieldGeologyEvidence(seed) {
	const binahOrientation = freezeOrientation(deriveRockGeologyProfile(seed));
	const chesedExposure = sampleRockUnit(seed, 0, 61);
	const gevurahMoisture = sampleRockUnit(seed, 0, 62);
	const yesodBurial = sampleRockUnit(seed, 0, 63) * 0.36;
	const hodVariation = 0.82 + sampleRockUnit(seed, 0, 64) * 0.36;
	const tiferesOpenSurface = 1 - yesodBurial;

	return Object.freeze({
		burial: yesodBurial,
		exposure: chesedExposure,
		frostAffinity: clamp01(
			chesedExposure * 0.58
			+ (1 - gevurahMoisture) * 0.32
		),
		lichenAffinity: clamp01(gevurahMoisture * tiferesOpenSurface),
		moisture: gevurahMoisture,
		orientation: binahOrientation,
		waterWearAffinity: clamp01(
			gevurahMoisture * 0.7
			+ (1 - chesedExposure) * 0.18
		),
		weatheringVariation: hodVariation
	});
}

/**
 * Deep-freezes the small geological orientation record while retaining its established field names and numeric values.
 * @param {object} orientation Seed-derived orientation from RockGeologyProfile.
 * @returns {Readonly<object>} Immutable orientation with copied axis arrays.
 */
function freezeOrientation(orientation = {}) {
	const malchusCopy = {};
	for (const [yesodKey, hodValue] of Object.entries(orientation)) {
		malchusCopy[yesodKey] = Array.isArray(hodValue)
			? Object.freeze([...hodValue])
			: hodValue;
	}

	return Object.freeze(malchusCopy);
}

/** @param {number} value Candidate affinity. @returns {number} Value clamped from zero through one. */
function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
