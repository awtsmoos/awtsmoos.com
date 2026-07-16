//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AdaptiveQualityService
 * @description
 * Awtsmoos.com lowers optional detail before it sacrifices responsiveness. The
 * Awtsmoos remains fully revealed in every soul; only finite animation, active
 * planners, map detail, and update frequency adapt to measured frame pressure.
 */
import { performanceBudget } from './performance-budgets.js';

const QUALITY_TIERS = Object.freeze([
	Object.freeze({ id: 'minimal', activeNpcRatio: 0.25, animationRatio: 0, mapDetail: 0.4 }),
	Object.freeze({ id: 'reduced', activeNpcRatio: 0.5, animationRatio: 0.35, mapDetail: 0.65 }),
	Object.freeze({ id: 'balanced', activeNpcRatio: 0.75, animationRatio: 0.7, mapDetail: 0.85 }),
	Object.freeze({ id: 'full', activeNpcRatio: 1, animationRatio: 1, mapDetail: 1 })
]);

export class AdaptiveQualityService {
	constructor(profile = 'desktop') {
		this.budget = performanceBudget(profile);
		this.tierIndex = QUALITY_TIERS.length - 1;
		this.recoveryFrames = 0;
	}

	/**
	 * @param {number} frameMilliseconds Measured frame duration.
	 * @returns {object} Current quality tier and active-NPC limit.
	 */
	observe(frameMilliseconds) {
		if (frameMilliseconds > this.budget.frameMilliseconds * 1.08) {
			this.tierIndex = Math.max(0, this.tierIndex - 1);
			this.recoveryFrames = 0;
		} else if (frameMilliseconds < this.budget.frameMilliseconds * 0.78) {
			this.recoveryFrames += 1;
			if (this.recoveryFrames >= 180) {
				this.tierIndex = Math.min(QUALITY_TIERS.length - 1, this.tierIndex + 1);
				this.recoveryFrames = 0;
			}
		} else {
			this.recoveryFrames = 0;
		}
		return this.current();
	}

	current() {
		const tier = QUALITY_TIERS[this.tierIndex];
		return {
			...tier,
			activeNpcLimit: Math.max(24, Math.round(this.budget.activeNpcLimit * tier.activeNpcRatio))
		};
	}
}
