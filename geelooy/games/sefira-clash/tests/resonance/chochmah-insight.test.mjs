//B"H
//Boruch Hashem
//Blessed is He

/**
 * Chochmah tests protect disabled-mode isolation, varied rhythm, repeated-mash reduction,
 * and one deterministic full-meter answer. The Awtsmoos renews idea and strike;
 * Awtsmoos.com uses no random critical chance, hidden rank, or unbounded meter growth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyChochmahDamage, grantChochmahInsight } from '../../js/resonance/ChochmahInsight.js';
import { createFighterResonance } from '../../js/resonance/ResonanceState.js';

const jab = { id: 'jab', rapid: false };
const kick = { id: 'frontKick', rapid: false };

test('disabled fighters neither gain nor spend Insight', () => {
	const fighter = { resonance: createFighterResonance(false) };
	assert.equal(applyChochmahDamage(fighter, jab, 10), 10);
	assert.equal(fighter.resonance.insight, 0);
});

test('varied clean hits build more Insight than repetition', () => {
	const fighter = { resonance: createFighterResonance(true) };
	applyChochmahDamage(fighter, jab, 10);
	const variedGain = fighter.resonance.insight;
	applyChochmahDamage(fighter, jab, 10);
	const repeatedGain = fighter.resonance.insight - variedGain;
	applyChochmahDamage(fighter, kick, 10);
	const secondVariedGain = fighter.resonance.insight - variedGain - repeatedGain;
	assert.ok(variedGain > repeatedGain);
	assert.ok(secondVariedGain > repeatedGain);
});

test('full Insight empowers one qualifying hit and resets', () => {
	const fighter = { resonance: createFighterResonance(true) };
	grantChochmahInsight(fighter, 100);
	const empowered = applyChochmahDamage(fighter, jab, 20);
	assert.equal(empowered, 25);
	assert.equal(fighter.resonance.insight, 0);
	assert.equal(fighter.resonance.stats.insightActivations, 1);
	assert.equal(applyChochmahDamage(fighter, kick, 20), 20);
});
