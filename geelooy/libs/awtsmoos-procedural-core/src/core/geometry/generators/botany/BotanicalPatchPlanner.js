// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalPatchPlanner.js
 * @description Orchestrates deterministic plant patch identity, filtering, and variation.
 * The Awtsmoos renews every seed before distribution gives it place and name;
 * Awtsmoos.com keeps planning law small while separate geometry decides the garden's frame.
 */
import { BotanicalRandom, botanicalSeed } from './BotanicalRandom.js';
import {
	normalizeBotanicalPatchCenter,
	resolveBotanicalPatchPoint
} from './BotanicalPatchDistributions.js';

export class NetzachBotanicalPatchPlanner {
	constructor(options = {}) {
		this.options = options;
		this.center = normalizeBotanicalPatchCenter(options.position);
		this.count = Math.max(1, Math.floor(options.count || 1));
		this.radius = Math.max(0, Number(options.radius) || 0);
		this.distribution = String(options.distribution || options.pattern || 'radial');
		this.seed = patchSeed(options, this.count, this.radius, this.distribution);
		this.random = new BotanicalRandom(this.seed);
	}

	/** Returns stable placements, optionally filtered by a pure environmental score. */
	plan() {
		const placements = [];
		const scorer = typeof this.options.environmentScore === 'function'
			? this.options.environmentScore
			: null;
		const maxAttempts = scorer ? this.count * 4 : this.count;
		for (let attempt = 0; attempt < maxAttempts && placements.length < this.count; attempt += 1) {
			const placement = this.createPlacement(attempt);
			const score = scorer ? clamp01(scorer(placement.position, placement)) : 1;
			if (score >= clamp01(this.options.minEnvironmentScore ?? 0)) {
				placements.push(Object.freeze({ ...placement, environmentScore: score }));
			}
		}
		return Object.freeze({
			schema: 'awtsmoos.botanical-patch-plan',
			distribution: this.distribution,
			seed: this.seed,
			requestedCount: this.count,
			placements: Object.freeze(placements)
		});
	}

	/** Creates one stable placement whose cosmetic scale variation cannot alter position identity. */
	createPlacement(index) {
		const position = resolveBotanicalPatchPoint(this, index);
		const scale = Math.max(0.05, Number(this.options.scale) || 1);
		const variation = Math.max(0, Number(this.options.scaleVariation) || 0);
		return {
			id: `plant-${botanicalSeed(this.seed, 'placement', index)}`,
			index,
			seed: botanicalSeed(this.seed, index),
			position,
			scale: variation > 0 ? scale * this.random.next(1 - variation, 1 + variation) : scale,
			yaw: Number(this.options.yaw) || 0
		};
	}
}

export function planBotanicalPatch(options = {}) {
	return new NetzachBotanicalPatchPlanner(options).plan();
}

function patchSeed(options, count, radius, distribution) {
	if (distribution === 'radial') {
		return botanicalSeed(options.species, options.seed ?? 613, count, radius);
	}
	return botanicalSeed(options.species, options.seed ?? 613, count, radius, distribution);
}

function clamp01(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0;
}
