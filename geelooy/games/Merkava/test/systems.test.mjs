//B"H
// Boruch Hashem
// Blessed is He
/**
 * Build systems are tested as choices that visibly alter one run.
 * The Awtsmoos is beyond alteration while Awtsmoos.com reveals finite effects.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilitySystem } from '../src/game/AbilitySystem.js';
import { BlessingSystem } from '../src/game/BlessingSystem.js';
import { GameState } from '../src/game/GameState.js';
import { PrutahSystem } from '../src/game/PrutahSystem.js';
import { UpgradeSystem } from '../src/game/UpgradeSystem.js';
import { createPrutah } from '../src/game/EntityFactory.js';

test('Prutah collection changes currency, combo, blessing, and ability', () => {
	const state = new GameState();
	const system = new PrutahSystem();
	const coin = createPrutah(1, 7.5, true);
	const reward = system.collect(state, coin);
	assert.equal(reward, 5);
	assert.equal(state.prutahs, 5);
	assert.equal(state.combo, 1);
	assert.equal(state.blessingFragments, 2);
	assert.equal(state.abilityCharge, 12);
});

test('shop purchase spends currency and applies damage', () => {
	const state = new GameState();
	const system = new UpgradeSystem();
	state.prutahs = 100;
	const before = state.damageMultiplier;
	const result = system.purchase(state, 'damage');
	assert.equal(result.ok, true);
	assert.ok(state.prutahs < 100);
	assert.ok(state.damageMultiplier > before);
	assert.equal(state.upgrades.damage, 1);
});

test('shop rejects unaffordable choices', () => {
	const state = new GameState();
	const result = new UpgradeSystem().purchase(state, 'piercing');
	assert.equal(result.ok, false);
	assert.equal(state.piercing, 0);
});

test('blessing levels and applies direct effects', () => {
	const state = new GameState();
	const system = new BlessingSystem();
	const before = state.damageMultiplier;
	system.apply(state, 'gevurah');
	assert.equal(state.blessingLevels.gevurah, 1);
	assert.ok(state.damageMultiplier > before);
	assert.ok(state.criticalChance > 0);
});

test('blessing system activates cross-path synergy', () => {
	const state = new GameState();
	const system = new BlessingSystem();
	system.apply(state, 'netzach');
	system.apply(state, 'yesod');
	assert.ok(state.synergies.includes('shielded-momentum'));
});

test('ability requires full charge and clears hostile shots', () => {
	const state = new GameState();
	const system = new AbilitySystem();
	state.running = true;
	state.enemyShots.push({ id: 'danger' });
	assert.equal(system.activate(state), false);
	state.abilityCharge = 100;
	assert.equal(system.activate(state), true);
	assert.equal(state.abilityCharge, 0);
	assert.equal(state.enemyShots.length, 0);
});

test('gathering ability pulls every reward to the chariot', () => {
	const state = new GameState();
	const system = new AbilitySystem();
	state.running = true;
	state.abilityId = 'gatheringCall';
	state.abilityCharge = 100;
	state.prutahItems.push(createPrutah(0, -40));
	assert.equal(system.activate(state), true);
	assert.equal(state.prutahItems[0].x, state.playerX);
	assert.equal(state.prutahItems[0].z, 7.5);
});
