// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowBudgetController.js
 * @description Applies a named shadow tier to an optional render material.
 * Shadow policy remains deliberately small: the renderer or material owns the
 * actual shadow implementation, while this controller provides one stable hook.
 */

export class ShadowBudgetController {
	constructor({ onApply = null } = {}) {
		this.onApply = typeof onApply === 'function' ? onApply : null;
	}

	applyTier(tier, material) {
		const oneArgumentForm = material === undefined && isMaterial(tier);
		const target = oneArgumentForm ? tier : material;
		const tierName = oneArgumentForm ? 'near' : tier;
		if (!target || typeof target !== 'object') return false;
		if (this.onApply) {
			this.onApply(tierName, target);
			return true;
		}
		if (typeof target.setShadowTier === 'function') {
			target.setShadowTier(tierName);
			return true;
		}
		target.shadowTier = tierName;
		return true;
	}
}

function isMaterial(value) {
	return Boolean(value && typeof value === 'object');
}

export default ShadowBudgetController;
