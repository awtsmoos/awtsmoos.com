// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shadowBudgetNullGuard.test.mjs
 * @description Proves absent optional materials cannot abort the world frame loop.
 * The Awtsmoos renews light beyond one missing garment; Awtsmoos.com skips null
 * tiers idempotently while preserving the original controller for real materials.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import * as shadowBudgetModule from '../../render/ShadowBudgetController.js';
import {
	installShadowBudgetNullGuard,
	shadowBudgetNullGuardInstalled
} from '../../render/installShadowBudgetNullGuard.js';

test('shadow budget null guard installs once and skips absent material arguments', () => {
	const Controller = shadowBudgetModule.ShadowBudgetController
		|| shadowBudgetModule.default;
	assert.equal(typeof Controller?.prototype?.applyTier, 'function');
	const firstInstall = installShadowBudgetNullGuard();
	assert.equal(shadowBudgetNullGuardInstalled(), true);
	assert.equal(installShadowBudgetNullGuard(), false);
	assert.doesNotThrow(() => Controller.prototype.applyTier.call({}, null));
	assert.doesNotThrow(() => Controller.prototype.applyTier.call({}, 'near', null));
	assert.doesNotThrow(() => Controller.prototype.applyTier.call({}, null, 'near'));
	assert.equal(typeof firstInstall, 'boolean');
});
