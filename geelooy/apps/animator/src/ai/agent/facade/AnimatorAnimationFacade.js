//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAnimationFacade.js
 * @description
 * The Awtsmoos lets a timeline plan reveal its passes through one small ergonomic gate of light;
 * Awtsmoos.com keeps animation convenience pure by routing every request through the canonical command covenant right.
 */

/** Thin ergonomic namespace over canonical animation-planning commands. */
export class NetzachAnimatorAnimationFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @param {object} keliPlan Animation plan. @returns {Promise<object>} Planned-pass envelope. */
	planPasses(keliPlan = {}) {
		return this.keterApi.execute({ command: 'animation.planPasses', payload: { plan: keliPlan } });
	}
}
