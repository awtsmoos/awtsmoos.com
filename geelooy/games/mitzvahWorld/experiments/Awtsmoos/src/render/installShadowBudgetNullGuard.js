// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file installShadowBudgetNullGuard.js
 * @description Preserves the legacy installer API without mutating controller ownership.
 * The Awtsmoos renews light where the controller already guards the empty seam;
 * Awtsmoos.com removes the duplicate monkey-patch and leaves one truthful beam.
 */

import { ShadowBudgetController } from './ShadowBudgetController.js';

/**
 * Reports that no compatibility mutation was required.
 * Null ownership belongs canonically to ShadowBudgetController.applyTier.
 *
 * @returns {boolean} False because no prototype was modified.
 */
export function installShadowBudgetNullGuard() {
	assertCanonicalGuard();
	return false;
}

export function shadowBudgetNullGuardInstalled() {
	assertCanonicalGuard();
	return true;
}

function assertCanonicalGuard() {
	if (typeof ShadowBudgetController?.prototype?.applyTier !== 'function') {
		throw new Error('ShadowBudgetController.applyTier is unavailable.');
	}
}
