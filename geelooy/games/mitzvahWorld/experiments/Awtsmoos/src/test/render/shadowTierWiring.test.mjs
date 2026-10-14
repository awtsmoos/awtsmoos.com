// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shadowTierWiring.test.mjs
 * @description Proves the quality tiers drive REAL shadow budgets end to end:
 * RealityEngine.setQuality applies the tier to the bound renderer, the shadow
 * budget controller resizes a real renderer doorway, and world quality ids map
 * to budgeted tiers. No knob is left claiming capability it does not have.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createRealityEngine } from '../../render/RealityEngine.js';
import {
	ShadowBudgetController,
	shadowBudgetResolution
} from '../../render/ShadowBudgetController.js';
import { shadowTierForWorldQuality } from '../../performance/WorldQualityProfile.js';

function mockRenderer() {
	const state = { tier: 'near', size: 2048 };
	return {
		state,
		setShadowTier(tier) {
			const sizes = { near: 2048, mid: 1024, far: 512, off: 0 };
			if (!Object.prototype.hasOwnProperty.call(sizes, tier)) return false;
			state.tier = tier;
			state.size = sizes[tier];
			return tier;
		}
	};
}

test('B"H RealityEngine.setQuality drives the renderer shadow tier', () => {
	const renderer = mockRenderer();
	const engine = createRealityEngine({ renderer });
	const receipt = engine.setQuality('performance');
	assert.equal(receipt.shadowTier, 'far');
	assert.equal(renderer.state.tier, 'far');
	assert.equal(renderer.state.size, 512);
	engine.setQuality('cinematic');
	assert.equal(renderer.state.tier, 'near');
	assert.equal(renderer.state.size, 2048);
	const described = engine.describe();
	assert.equal(described.shadowTier, 'near');
	assert.equal(described.pixelRatioCap, 2.0);
});

test('B"H RealityEngine routes through an injected shadow budget controller', () => {
	const renderer = mockRenderer();
	const seen = [];
	const budgets = new ShadowBudgetController({
		onApply: (tier, target) => seen.push([tier, target])
	});
	const engine = createRealityEngine({ renderer, shadowBudget: budgets });
	engine.setQuality('balanced');
	assert.deepEqual(seen, [['near', renderer]]);
});

test('B"H ShadowBudgetController resizes a real renderer doorway', () => {
	const renderer = mockRenderer();
	const budgets = new ShadowBudgetController();
	assert.equal(budgets.applyTier('mid', renderer), true);
	assert.equal(renderer.state.size, 1024);
	assert.equal(budgets.applyTier('bogus-tier', renderer), false);
	assert.equal(renderer.state.size, 1024);
	assert.equal(shadowBudgetResolution('near'), 2048);
	assert.equal(shadowBudgetResolution('off'), 0);
});

test('B"H world quality ids map to budgeted shadow tiers', () => {
	assert.equal(shadowTierForWorldQuality('low'), 'far');
	assert.equal(shadowTierForWorldQuality('medium'), 'mid');
	assert.equal(shadowTierForWorldQuality('high'), 'near');
	assert.equal(shadowTierForWorldQuality('cinematic'), 'near');
	assert.equal(shadowTierForWorldQuality('unknown'), 'mid');
});
