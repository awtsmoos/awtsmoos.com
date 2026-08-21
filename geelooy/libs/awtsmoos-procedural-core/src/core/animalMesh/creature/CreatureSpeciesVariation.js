// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSpeciesVariation.js
 * @description Creates correlated deterministic in-species variation and stable individual seed identity.
 * The Awtsmoos, Atzmus beyond sameness and difference, renews every living form without making a deer cease to be deer;
 * Awtsmoos.com lets stature, mass, head, and appendage proportions move as related biological currents, not random noise.
 * This module varies species intent only; the authoritative genome still owns legal biological bounds.
 */

import { createAnimalGenomeRandom } from '../morphology/animalGenomeIdentity.js';

const REALISM_SPREAD = Object.freeze({
	stylized: 0.015,
	natural: 0.04,
	realistic: 0.075,
	extreme: 0.11
});

const TRAIT_GROUPS = Object.freeze({
	appendage: Object.freeze(['tail_length', 'wing_span', 'feather_length', 'fin_area']),
	head: Object.freeze(['head_scale']),
	mass: Object.freeze(['body_width', 'body_depth', 'muscle_bulk']),
	stature: Object.freeze(['body_length', 'body_height', 'limb_length', 'arm_length', 'elongation'])
});

/**
 * Normalizes numeric or textual individual identity into one unsigned deterministic seed.
 * @param {number|string|null|undefined} seed Caller seed.
 * @returns {number} Stable nonzero unsigned seed.
 */
export function normalizeCreatureIndividualSeed(seed = 613) {
	const numeric = Number(seed);
	if (Number.isFinite(numeric)) {
		return (numeric >>> 0) || 0x9e3779b9;
	}
	let hash = 2166136261;
	for (const character of String(seed ?? 613)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) || 0x9e3779b9;
}

/**
 * Varies a species baseline through a few correlated latent biological factors.
 * @param {object} baseline Numeric species trait baseline.
 * @param {number|string} seed Stable individual seed.
 * @param {'stylized'|'natural'|'realistic'|'extreme'} [realism='realistic'] Variation breadth profile.
 * @returns {{traits: object, factors: object, realism: string, seed: number}} Frozen varied traits and evidence.
 */
export function varyCreatureSpeciesTraits(baseline, seed, realism = 'realistic') {
	const normalizedRealism = normalizeRealism(realism);
	const normalizedSeed = normalizeCreatureIndividualSeed(seed);
	const spread = REALISM_SPREAD[normalizedRealism];
	const random = createAnimalGenomeRandom(normalizedSeed);
	const factors = Object.freeze({
		appendage: factor(random, spread * 1.1),
		head: factor(random, spread * 0.72),
		mass: factor(random, spread * 0.86),
		stature: factor(random, spread)
	});
	const traits = { ...baseline };
	for (const [group, names] of Object.entries(TRAIT_GROUPS)) {
		for (const name of names) {
			if (!Number.isFinite(Number(traits[name]))) continue;
			traits[name] = Number(traits[name]) * factors[group];
		}
	}
	return Object.freeze({
		factors,
		realism: normalizedRealism,
		seed: normalizedSeed,
		traits: Object.freeze(traits)
	});
}

/** @returns {object} Immutable realism-to-variation-spread map. */
export function creatureVariationProfiles() {
	return REALISM_SPREAD;
}

function factor(random, spread) {
	return 1 + (random() * 2 - 1) * spread;
}

function normalizeRealism(realism) {
	const normalized = String(realism || 'realistic').trim().toLowerCase();
	if (normalized in REALISM_SPREAD) return normalized;
	throw new RangeError(
		`B"H | Unknown creature realism "${realism}". Expected: ${Object.keys(REALISM_SPREAD).join(', ')}.`
	);
}
