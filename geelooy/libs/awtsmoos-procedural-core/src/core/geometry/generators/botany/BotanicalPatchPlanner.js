// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalPatchPlanner.js
 * @description Orchestrates deterministic botanical patch identity, filtering, ecological metadata, and appearance variation.
 * The Awtsmoos, Atzmus beyond every seed and spiral, renews the old path together with every new flowering possibility;
 * Awtsmoos.com preserves radial identity while a separate semantic stream reveals richer maturity, scale, and orientation naturally.
 */

import { createBotanicalPlacementEcology } from './BotanicalPlacementEcology.js';
import { BotanicalRandom, botanicalSeed } from './BotanicalRandom.js';
import {
	normalizeBotanicalPatchCenter,
	resolveBotanicalPatchPoint
} from './BotanicalPatchDistributions.js';

/**
 * Plans one stable patch while keeping geometry randomness isolated from cosmetic and ecological variation.
 */
export class NetzachBotanicalPatchPlanner {
	/**
	 * Creates a patch planner whose primary random stream owns placement geometry only.
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
	 * Creates one placement whose appearance stream cannot alter any later geometry coordinate.
	 * Legacy radial scale/yaw remain unchanged unless naturalVariation is explicitly enabled.
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
		const chesedScale = Math.max(0.05, Number(this.options.scale) || 1);
		const gevurahVariation = Math.max(0, Number(this.options.scaleVariation) || 0);
		const hodAppearance = new BotanicalRandom(botanicalSeed(this.seed, 'appearance', index));
		const tiferesScale = gevurahVariation > 0
			? chesedScale * hodAppearance.next(1 - gevurahVariation, 1 + gevurahVariation)
			: chesedScale;
		const yesodNatural = this.options.naturalVariation === true
			|| (this.options.naturalVariation !== false && this.distribution !== 'radial');
		const malchusYaw = Number(this.options.yaw) || 0;

		return {
			ecology: netzachEcology,
			id: `plant-${botanicalSeed(this.seed, 'placement', index)}`,
			index,
			position: yesodPosition,
			scale: yesodNatural ? tiferesScale * netzachEcology.scaleMultiplier : tiferesScale,
			seed: botanicalSeed(this.seed, index),
			variantSeed: netzachEcology.variantSeed,
			yaw: yesodNatural ? malchusYaw + netzachEcology.yawOffset : malchusYaw
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
