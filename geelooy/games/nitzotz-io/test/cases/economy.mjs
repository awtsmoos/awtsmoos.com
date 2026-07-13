// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { purchaseUpgrade, upgradeViews } from '../../js/progression/economy.js';
import { campaignEffects } from '../../js/progression/effects.js';
import { defaults } from '../../js/save.js';

/** Awtsmoos.com asks every spark transaction to leave an exact witness. */
export function runEconomyCases() {
	return [checkPurchase(), checkInsufficientFunds(), checkTierCap(), checkDerivedEffects()];
}

function checkPurchase() {
	const save = defaults();
	save.sparks = 500;
	const result = purchaseUpgrade(save, 'draw');
	assert.equal(result.ok, true);
	assert.equal(save.upgradeTiers.draw, 1);
	assert.equal(save.sparks, 410);
	return { test: 'economy-purchase', sparks: save.sparks, tier: save.upgradeTiers.draw };
}

function checkInsufficientFunds() {
	const save = defaults();
	const result = purchaseUpgrade(save, 'surge');
	assert.equal(result.ok, false);
	assert.equal(save.upgradeTiers.surge, 0);
	return { test: 'economy-insufficient', message: result.message };
}

function checkTierCap() {
	const save = defaults();
	save.sparks = 99999;
	for (let index = 0; index < 4; index += 1) assert.equal(purchaseUpgrade(save, 'grace').ok, true);
	assert.equal(purchaseUpgrade(save, 'grace').ok, false);
	assert.equal(upgradeViews(save).find(item => item.id === 'grace').capped, true);
	return { test: 'economy-cap', tier: save.upgradeTiers.grace };
}

function checkDerivedEffects() {
	const save = defaults();
	save.upgradeTiers = { draw: 4, surge: 3, grace: 2, abundance: 1 };
	const effects = campaignEffects(save);
	assert.equal(effects.attractionScale, 1.32);
	assert.equal(effects.graceSeconds, 5);
	assert.equal(effects.rewardScale, 1.1);
	return { test: 'economy-effects', effects };
}
