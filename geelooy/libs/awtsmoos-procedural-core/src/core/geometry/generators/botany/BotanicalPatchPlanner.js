// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalPatchPlanner.js
 * @description Owns deterministic botanical geometry identity while delegating ecology, appearance, and population filtering to smaller vessels.
 * The Awtsmoos, Atzmus beyond every seed and spiral, renews the old path together with each flowering possibility;
 * Awtsmoos.com keeps geometry in Netzach while ecology, appearance, and population policy reveal richer life without disturbing identity.
 */

import { createBotanicalPlacementAppearance } from './BotanicalPlacementAppearance.js';
import { createBotanicalPlacementEcology } from './BotanicalPlacementEcology.js';
import { createBotanicalPatchPopulation } from './BotanicalPatchPopulation.js';
import { BotanicalRandom, botanicalSeed } from './BotanicalRandom.js';
import {
	normalizeBotanicalPatchCenter,
	resolveBotanicalPatchPoint
} from './BotanicalPatchDistributions.js';

/**
 * Plans one stable botanical patch while keeping the primary random stream reserved for placement geometry.
 */
export class NetzachBotanicalPatchPlanner {
	/**
	 * Creates a planner whose geometry identity is independent from cosmetic or ecological enrichment.
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
	 * Delegates filtering and immutable plan assembly while this class retains geometry ownership.
	 * @returns {object} Frozen botanical patch plan with immutable placements.
	 */
	plan() {
		return createBotanicalPatchPopulation(this);
	}

	/**
	 * Creates one candidate placement while preserving geometry identity regardless of appearance choices.
	 * @param {number} index Candidate index within the patch geometry stream.
	 * @returns {object} Mutable candidate later frozen by population assembly.
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

/**
 * Creates one immutable patch plan through the stable public function doorway.
 * @param {object} [options={}] Botanical patch options.
 * @returns {object} Immutable deterministic patch plan.
 */
export function planBotanicalPatch(options = {}) {
	return new NetzachBotanicalPatchPlanner(options).plan();
}

/**
 * Preserves the exact historic radial seed signature while allowing newer distributions their own named stream.
 * @param {object} options Patch options.
 * @param {number} count Requested count.
 * @param {number} radius Patch radius.
 * @param {string} distribution Distribution name.
 * @returns {number} Stable patch seed.
 */
function patchSeed(options, count, radius, distribution) {
	return distribution === 'radial'
		? botanicalSeed(options.species, options.seed ?? 613, count, radius)
		: botanicalSeed(options.species, options.seed ?? 613, count, radius, distribution);
}
