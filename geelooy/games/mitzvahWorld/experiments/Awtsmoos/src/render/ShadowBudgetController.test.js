// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowBudgetController.test.js
 * @description Proves the shadow budget controller applies named tiers to
 * optional materials, honors duck-typed setShadowTier, and degrades without
 * throwing on null/absent targets. Also proves the legacy null-guard
 * installer no longer mutates the prototype (canonical guard stays in applyTier).
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	ShadowBudgetController,
	default as ShadowBudgetControllerDefault
} from './ShadowBudgetController.js';
import {
	installShadowBudgetNullGuard,
	shadowBudgetNullGuardInstalled
} from './installShadowBudgetNullGuard.js';

test('two-argument form applies a named tier to a plain material', () => {
	const controller = new ShadowBudgetController();
	const material = {};
	assert.equal(controller.applyTier('near', material), true);
	assert.equal(material.shadowTier, 'near');
	assert.equal(controller.applyTier('far', material), true);
	assert.equal(material.shadowTier, 'far');
});

test('duck-typed materials with setShadowTier are honored', () => {
	const controller = new ShadowBudgetController();
	const seen = [];
	const material = { setShadowTier: tier => seen.push(tier) };
	assert.equal(controller.applyTier('near', material), true);
	assert.deepEqual(seen, ['near']);
	assert.equal(material.shadowTier, undefined);
});

test('one-argument form treats a lone material as the near tier', () => {
	const controller = new ShadowBudgetController();
	const material = {};
	assert.equal(controller.applyTier(material), true);
	assert.equal(material.shadowTier, 'near');
});

test('null and missing targets return false without throwing', () => {
	const controller = new ShadowBudgetController();
	assert.equal(controller.applyTier('near', null), false);
	assert.equal(controller.applyTier('near', undefined), false);
	assert.equal(controller.applyTier('near', 42), false);
	assert.equal(controller.applyTier('near'), false);
	assert.equal(controller.applyTier(), false);
});

test('onApply hook receives the tier and the target', () => {
	const calls = [];
	const controller = new ShadowBudgetController({
		onApply: (tier, material) => calls.push([tier, material])
	});
	const material = {};
	assert.equal(controller.applyTier('far', material), true);
	assert.deepEqual(calls, [['far', material]]);
});

test('legacy installer no longer monkey-patches the prototype', () => {
	const before = ShadowBudgetController.prototype.applyTier;
	assert.equal(installShadowBudgetNullGuard(), false);
	assert.equal(shadowBudgetNullGuardInstalled(), true);
	assert.equal(ShadowBudgetController.prototype.applyTier, before);
	// The canonical guard still rejects nothing at apply time: null stays non-fatal.
	const controller = new ShadowBudgetController();
	assert.equal(controller.applyTier('near', null), false);
	assert.equal(ShadowBudgetControllerDefault, ShadowBudgetController);
});
