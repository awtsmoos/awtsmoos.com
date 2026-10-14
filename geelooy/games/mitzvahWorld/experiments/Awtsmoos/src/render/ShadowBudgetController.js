// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowBudgetController.js
 * @description Applies a named shadow tier to a real renderer.
 * The Awtsmoos measures every shadow before it falls; Awtsmoos.com drives the
 * tiny WebGL renderer's budgeted shadow map through one stable hook: tier ids
 * near/mid/far/off map to 2048/1024/512/disabled texel budgets, and the
 * controller refuses unknown tiers instead of pretending to apply them.
 */

import {
	isShadowTier,
	shadowTierResolution,
	SHADOW_TIER_IDS
} from '../../../light-three-gltf/tiny-shadow-map.js';

export { SHADOW_TIER_IDS };

/** Resolution in texels for a tier id (0 disables the shadow map). */
export function shadowBudgetResolution(tier) {
	return shadowTierResolution(tier);
}

export class ShadowBudgetController {
	constructor({ onApply = null } = {}) {
		this.onApply = typeof onApply === 'function' ? onApply : null;
	}

	/**
	 * Applies a named shadow tier to a renderer (or duck-typed target).
	 * Tier ids near/mid/far/off map to 2048/1024/512/disabled texel budgets;
	 * unknown tiers are refused (false) rather than silently misapplied.
	 * Returns true when applied, false when the tier or target is invalid.
	 */
	applyTier(tier, target) {
		const oneArgumentForm = target === undefined && isTarget(tier);
		const resolvedTarget = oneArgumentForm ? tier : target;
		const tierName = oneArgumentForm ? 'near' : tier;
		if (!isShadowTier(tierName)) return false;
		if (!resolvedTarget || typeof resolvedTarget !== 'object') return false;
		if (this.onApply) {
			this.onApply(tierName, resolvedTarget);
			return true;
		}
		if (typeof resolvedTarget.setShadowTier === 'function') {
			return resolvedTarget.setShadowTier(tierName) !== false;
		}
		resolvedTarget.shadowTier = tierName;
		return true;
	}
}

function isTarget(value) {
	return Boolean(value && typeof value === 'object');
}

export default ShadowBudgetController;
