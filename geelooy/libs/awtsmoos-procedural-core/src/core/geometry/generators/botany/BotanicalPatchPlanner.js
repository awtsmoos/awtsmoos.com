// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalPatchPlanner.js
 * @description Orchestrates deterministic botanical patch identity, filtering, ecology, and isolated appearance.
 * The Awtsmoos, Atzmus beyond every seed and spiral, renews the ancient path together with each flowering possibility;
 * Awtsmoos.com keeps geometry in Netzach while ecology and appearance receive smaller vessels that enrich without moving identity.
 */

import { createBotanicalPlacementAppearance } from './BotanicalPlacementAppearance.js';
import { createBotanicalPlacementEcology } from './BotanicalPlacementEcology.js';
import { BotanicalRandom, botanicalSeed } from './BotanicalRandom.js';
import {
	normalizeBotanicalPatchCenter,
	resolveBotanicalPatchPoint
} from './BotanicalPatchDistributions.js';

/**
 * Plans one stable botanical patch while keeping geometry randomness isolated from cosmetic and ecological variation.
 */
export class NetzachBotanicalPatchPlanner {
	/**
	 * Creates a planner whose primary random stream owns placement geometry only.
	 * @param {object} [options={}] Species, count, radius, center, distribution, filtering, and appearance controls.
	 */
	constructor(options = {}) {
		this.options = options;
		this.center = normalizeBotanicalPatchCenter(options.position);
		this.count = Math.max(1, Math.floor(options.count || 1));
		this.radius = Math.max(0, Number(options.radius) || 0);
		this.distribution = String(options.distribution || options.pattern || 'radial');
		this.seed = patchSeed(options, this.count, this.radius, this.distribution);
		this.random = new BotanicalRandom(this.seed);
	}

	/**
	 * Returns stable placements and optional environmental filtering without mutating caller data.
	 * @returns {object} Frozen botanical patch plan with immutable placements.
	 */
	plan() {
		const malchusPlacements = [];
		const binahScorer = typeof this.options.environmentScore === 'function'
			? this.options.environmentScore
			: null;
		const gevurahAttempts = binahScorer ? this.count * 4 : this.count;

		for (let attempt = 0; attempt < gevurahAttempts && malchusPlacements.length < this.count; attempt += 1) {
			const tiferesPlacement = this.createPlacement(attempt);
			const hodScore = binahScorer
				? clamp01(binahScorer(tiferesPlacement.position, tiferesPlacement))
				: 1;
			if (hodScore < clamp01(this.options.minEnvironmentScore ?? 0)) {
				continue;
			}

			malchusPlacements.push(Object.freeze({
				...tiferesPlacement,
				environmentScore: hodScore
			}));
		}

		return Object.freeze({
			distribution: this.distribution,
			placements: Object.freeze(malchusPlacements),
			requestedCount: this.count,
			schema: 'awtsmoos.botanical-patch-plan',
			seed: this.seed
		});
	}

	/**
	 * Creates one placement while preserving geometry identity regardless of later appearance choices.
	 * @param {number} index Candidate index within the patch geometry stream.
	 * @returns {object} Mutable intermediate placement later frozen by plan().
	 */
	createPlacement(index) {
		const yesodPosition = resolveBotanicalPatchPoint(this, index);
		const netzachEcology = createBotanicalPlacementEcology({
			center: this.center,
			count: this.count,
			index,
			position: yesodPosition,
			radius: this.radius,
			seed: this.seed,
			species: this.options.species
		});
		const tiferesNaturalVariation = this.options.naturalVariation === true
			|| (this.options.naturalVariation !== false && this.distribution !== 'radial');
		const hodAppearance = createBotanicalPlacementAppearance({
			ecology: netzachEcology,
			index,
			naturalVariation: tiferesNaturalVariation,
			scale: this.options.scale,
			scaleVariation: this.options.scaleVariation,
			seed: this.seed,
			yaw: this.options.yaw
		});

		return {
			ecology: netzachEcology,
			id: `plant-${botanicalSeed(this.seed, 'placement', index)}`,
			index,
			position: yesodPosition,
			scale: hodAppearance.scale,
			seed: botanicalSeed(this.seed, index),
			variantSeed: netzachEcology.variantSeed,
			yaw: hodAppearance.yaw
		};
	}
}

/** @param {object} options Patch options. @returns {object} Immutable deterministic patch plan. */
export function planBotanicalPatch(options = {}) {
	return new NetzachBotanicalPatchPlanner(options).plan();
}

/** @param {object} options Options. @param {number} count Count. @param {number} radius Radius. @param {string} distribution Distribution. @returns {number} Stable seed. */
function patchSeed(options, count, radius, distribution) {
	return distribution === 'radial'
		? botanicalSeed(options.species, options.seed ?? 613, count, radius)
		: botanicalSeed(options.species, options.seed ?? 613, count, radius, distribution);
}

/** @param {unknown} value Candidate score. @returns {number} Score clamped between zero and one. */
function clamp01(value) {
	const gevurahValue = Number(value);
	return Number.isFinite(gevurahValue) ? Math.min(1, Math.max(0, gevurahValue)) : 0;
}
