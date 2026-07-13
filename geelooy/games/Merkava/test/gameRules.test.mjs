//B"H
// Boruch Hashem
// Blessed is He
/**
 * Pure rules are weighed without a frame so fairness remains visible.
 * The Awtsmoos is beyond proof while Awtsmoos.com reveals finite evidence.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	applyGateValue,
	blessingSynergies,
	bossPhase,
	damagePacket,
	nextCombo,
	permanentRunBonus,
	prutahReward,
	shopPrice
} from '../src/game/GameRules.js';

test('every arithmetic gate operator obeys its rule', () => {
	assert.equal(applyGateValue(10, 'add', 4), 14);
	assert.equal(applyGateValue(10, 'subtract', 4), 6);
	assert.equal(applyGateValue(10, 'multiply', 3), 30);
	assert.equal(applyGateValue(10, 'divide', 3), 4);
});

test('gate arithmetic always preserves one spark', () => {
	assert.equal(applyGateValue(2, 'subtract', 99), 1);
	assert.equal(applyGateValue(1, 'divide', 99), 1);
});

test('positive gate bonuses scale only positive growth', () => {
	assert.equal(applyGateValue(10, 'add', 5, 2), 20);
	assert.equal(applyGateValue(10, 'subtract', 5, 2), 5);
});

test('Prutah values reward golden coins and streaks', () => {
	assert.equal(prutahReward(1, false, 1), 1);
	assert.equal(prutahReward(1, true, 1), 5);
	assert.ok(prutahReward(15, false, 1) > prutahReward(1, false, 1));
});

test('combo continues inside its window and resets outside', () => {
	assert.equal(nextCombo(4, 1), 5);
	assert.equal(nextCombo(20, 3), 1);
});

test('shop prices increase by purchases and world depth', () => {
	const base = shopPrice(20, 0, 0);
	assert.ok(shopPrice(20, 1, 0) > base);
	assert.ok(shopPrice(20, 0, 3) > base);
});

test('shield absorbs a packet before troops or health', () => {
	const result = damagePacket({ shield: 1, troops: 8, health: 100 }, 5);
	assert.deepEqual(result, { shield: 0, troops: 8, health: 100, absorbed: true });
});

test('overflow damage preserves one spark and reaches health', () => {
	const result = damagePacket({ shield: 0, troops: 3, health: 100 }, 5);
	assert.equal(result.troops, 1);
	assert.equal(result.health, 73);
});

test('boss phase thresholds advance deterministically', () => {
	assert.equal(bossPhase(100, 100), 1);
	assert.equal(bossPhase(65, 100), 2);
	assert.equal(bossPhase(30, 100), 3);
	assert.equal(bossPhase(10, 100), 4);
});

test('Sefirah combinations reveal all named synergies', () => {
	const levels = { chesed: 1, malchut: 1, gevurah: 1, hod: 1, netzach: 1, yesod: 1, tiferet: 1 };
	assert.deepEqual(blessingSynergies(levels), ['generous-kingdom', 'ricochet-critical', 'shielded-momentum', 'harmonized-soul']);
});

test('permanent bonuses are bounded', () => {
	const bonus = permanentRunBonus({ upgrades: { startingSparks: 999, startingHealth: 999, startingShield: 999, baseFireRate: 999, baseMagnet: 999 } });
	assert.deepEqual(bonus, { troops: 16, health: 140, shield: 3, fireRate: 1.18, magnet: 3.3 });
});
