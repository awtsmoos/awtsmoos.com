//B"H
// Boruch Hashem
// Blessed is He
/**
 * Every checkpoint purchase must alter a visible rule rather than only a label.
 * The Awtsmoos is beyond exchange while Awtsmoos.com reveals each finite effect.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../src/game/GameState.js';
import { UpgradeSystem } from '../src/game/UpgradeSystem.js';

const CASES = Object.freeze([
	['sparks', state => state.troops, (before, after) => after > before],
	['damage', state => state.damageMultiplier, increased],
	['fireRate', state => state.fireRateMultiplier, increased],
	['sideShots', state => state.sideShots, increased],
	['piercing', state => state.piercing, increased],
	['shield', state => state.shield, increased],
	['magnet', state => state.magnetRadius, increased],
	['prutahValue', state => state.prutahValueMultiplier, increased],
	['positiveGate', state => state.positiveGateBoost, increased],
	['healing', state => state.upgrades.healing || 0, increased]
]);

for (const [upgradeId, readValue, compare] of CASES) {
	test(`${upgradeId} purchase changes its gameplay rule`, () => {
		const state = new GameState();
		const upgrades = new UpgradeSystem();
		state.prutahs = 1000;
		const before = readValue(state);
		const result = upgrades.purchase(state, upgradeId);
		assert.equal(result.ok, true);
		assert.ok(compare(before, readValue(state)));
	});
}

test('the same upgrade costs more after purchase', () => {
	const state = new GameState();
	const upgrades = new UpgradeSystem();
	state.prutahs = 1000;
	const before = upgrades.describe(state, findUpgrade(upgrades, state, 'damage')).price;
	upgrades.purchase(state, 'damage');
	const after = upgrades.describe(state, findUpgrade(upgrades, state, 'damage')).price;
	assert.ok(after > before);
});

function findUpgrade(upgrades, state, id) {
	return upgrades.offers(state).find(item => item.id === id) || {
		id,
		name: id,
		description: '',
		basePrice: 24,
		maximum: 6
	};
}

function increased(before, after) {
	return after > before;
}
