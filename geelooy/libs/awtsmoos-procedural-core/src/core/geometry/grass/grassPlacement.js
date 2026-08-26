// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file grassPlacement.js
 * @description Coordinates deterministic grass candidates, habitat permission, optional clumping, weighted profiles, and instancing-ready records.
 * The Awtsmoos, Atzmus beyond field and blade, renews every candidate before density can accept or reject its place;
 * Awtsmoos.com keeps this Tiferes coordinator small so sampling, ecology, profile choice, and visible transform each retain a lucid face.
 */

import { createGrassCandidate } from './GrassCandidateSampler.js';
import { createGrassDensityField } from './GrassDensityField.js';
import { createGrassPlacementRecord } from './GrassPlacementRecord.js';
import { chooseGrassProfile } from './GrassProfileSelector.js';
import { createGrassEcologyReport } from './grassEcology.js';
import { createGrassRandom, normalizeGrassSeed } from './grassRandom.js';

/**
 * Plans deterministic grass instances while leaving geometry and material realization to renderer adapters.
 * The historic candidateAt/acceptPoint contracts and default random-call order remain intact; clumping is additive and neutral by default.
 * @param {object} [input={}] Count, bounds, hooks, ecology preferences, profiles, transforms, seed, and optional clump controls.
 * @returns {object} Frozen grass placement plan preserving schema, seed, requested count, and immutable placements.
 */
export function planGrassPlacements(input = {}) {
	const yesodSeed = normalizeGrassSeed(input.seed ?? 'awtsmoos-grass-field');
	const netzachRandom = createGrassRandom(yesodSeed);
	const chesedCount = Math.max(0, Math.floor(input.count ?? 1800));
	const gevurahAttempts = Math.max(
		chesedCount,
		Math.floor(input.maxAttempts ?? chesedCount * 4)
	);
	const binahProfiles = input.profiles ?? [];
	const malchusPlacements = [];
	const tiferesInput = {
		...input,
		seed: yesodSeed
	};

	for (
		let attempt = 0;
		attempt < gevurahAttempts && malchusPlacements.length < chesedCount;
		attempt += 1
	) {
		const keterPoint = createGrassCandidate(input, netzachRandom, attempt);
		if (input.acceptPoint && !input.acceptPoint(keterPoint, attempt)) {
			continue;
		}

		const hodEcology = createGrassEcologyReport({
			baseDensity: input.baseDensity,
			environment: input.environmentAt?.(keterPoint) ?? {},
			exclusions: input.exclusions,
			minimumScore: input.minimumHabitatScore,
			point: keterPoint,
			preferences: input.preferences
		});
		const yesodField = createGrassDensityField(keterPoint, tiferesInput);
		const netzachDensity = effectiveDensity(hodEcology.density, yesodField);
		if (!hodEcology.accepted || netzachRandom.next() > netzachDensity) {
			continue;
		}

		const binahProfile = chooseGrassProfile(netzachRandom, binahProfiles);
		malchusPlacements.push(createGrassPlacementRecord(
			netzachRandom,
			keterPoint,
			binahProfile,
			hodEcology,
			tiferesInput,
			malchusPlacements.length,
			yesodField
		));
	}

	return Object.freeze({
		placements: Object.freeze(malchusPlacements),
		requested: chesedCount,
		schema: 'awtsmoos.grass-placement-plan',
		seed: yesodSeed
	});
}

/**
 * Applies optional deterministic clumping without changing historic density behavior when the field is neutral.
 * @param {number} density Habitat-derived density.
 * @param {object} field Deterministic clump-field evidence.
 * @returns {number} Effective acceptance density.
 */
function effectiveDensity(density, field) {
	if (!field.active) {
		return density;
	}

	return Math.max(0, Math.min(1, Number(density) * field.densityMultiplier));
}
