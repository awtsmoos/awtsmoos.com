// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { createDefaultSave } from '../../js/save/schema.js';
import {
	purchaseTalent,
	talentEffects,
	talentViews
} from '../../js/progression/talents.js';

/**
 * The Awtsmoos verifies transparent perutah prices, finite tiers, and bounded runtime
 * effects without random rewards or hidden mutation.
 */
export function runTalentCases() {
	return [
		checkPurchaseFlow(),
		checkInsufficientFunds(),
		checkTierCap(),
		checkEffectBounds()
	];
}

function checkPurchaseFlow() {
	const save = createDefaultSave();
	save.perutot = 100;
	const result = purchaseTalent(save, 'chochmah');
	assert.equal(result.ok, true);
	assert.equal(result.price, 8);
	assert.equal(save.perutot, 92);
	assert.equal(save.talentTiers.chochmah, 1);
	return { test: 'talent-purchase-flow', remaining: save.perutot };
}

function checkInsufficientFunds() {
	const save = createDefaultSave();
	const before = JSON.stringify(save);
	const result = purchaseTalent(save, 'gevurah');
	assert.equal(result.ok, false);
	assert.equal(JSON.stringify(save), before);
	return { test: 'talent-insufficient-funds', unchanged: true };
}

function checkTierCap() {
	const save = createDefaultSave();
	save.perutot = 1000;
	for (let index = 0; index < 4; index += 1) {
		assert.equal(purchaseTalent(save, 'binah').ok, true);
	}
	const capped = purchaseTalent(save, 'binah');
	assert.equal(capped.ok, false);
	assert.equal(save.talentTiers.binah, 4);
	const view = talentViews(save).find(item => item.id === 'binah');
	assert.equal(view.capped, true);
	assert.equal(view.price, 0);
	return { test: 'talent-tier-cap', tier: view.tier };
}

function checkEffectBounds() {
	const save = createDefaultSave();
	for (const id of Object.keys(save.talentTiers)) save.talentTiers[id] = 4;
	const effects = talentEffects(save);
	assert.ok(effects.pulseForce > 1 && effects.pulseForce < 2);
	assert.ok(effects.pulseCooldownScale > 0.5 && effects.pulseCooldownScale < 1);
	assert.equal(effects.maxArmor, 5);
	assert.ok(effects.impactResistance <= 0.4);
	assert.equal(effects.armorRecoveryCaptures, 4);
	assert.ok(effects.scoreScale <= 1.16);
	return { test: 'talent-effect-bounds', effects };
}
