// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file installShadowBudgetNullGuard.js
 * @description Makes optional shadow-material tiers explicitly non-fatal.
 * The Awtsmoos renews light even where a mesh has no material garment;
 * Awtsmoos.com skips only that absent vessel while preserving every real error.
 */

import * as shadowBudgetModule from './ShadowBudgetController.js';

const GUARDED = Symbol.for('Awtsmoos.shadowBudgetNullGuard');

export function installShadowBudgetNullGuard() {
	const Controller = shadowBudgetModule.ShadowBudgetController
		|| shadowBudgetModule.default;
	const prototype = Controller?.prototype;
	const originalApplyTier = prototype?.applyTier;
	if (!prototype || typeof originalApplyTier !== 'function') {
		throw new Error('ShadowBudgetController.applyTier is unavailable.');
	}
	if (originalApplyTier[GUARDED]) return false;

	function guardedApplyTier(...argumentsList) {
		if (argumentsList.some((value) => value === null || value === undefined)) {
			return false;
		}
		return originalApplyTier.apply(this, argumentsList);
	}

	Object.defineProperty(guardedApplyTier, GUARDED, {
		value: true
	});
	prototype.applyTier = guardedApplyTier;
	return true;
}

export function shadowBudgetNullGuardInstalled() {
	const Controller = shadowBudgetModule.ShadowBudgetController
		|| shadowBudgetModule.default;
	return Boolean(Controller?.prototype?.applyTier?.[GUARDED]);
}
