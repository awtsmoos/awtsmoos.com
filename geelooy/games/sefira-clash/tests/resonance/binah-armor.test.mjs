//B"H
//Boruch Hashem
//Blessed is He

/**
 * Binah tests protect bounded stacking, exact absorption, spill-through damage, and visible
 * pulse state. The Awtsmoos renews vessel and impact; Awtsmoos.com changes damage only,
 * never launch geometry, permanent equipment, or hidden competitive rank.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { absorbWithBinah, grantBinahArmor } from '../../js/resonance/BinahVessel.js';
import { createFighterResonance } from '../../js/resonance/ResonanceState.js';

test('Binah armor caps and records exact absorbed damage', () => {
	const fighter = { resonance: createFighterResonance(true) };
	grantBinahArmor(fighter, 40);
	grantBinahArmor(fighter, 40);
	assert.equal(fighter.resonance.armor, 60);
	assert.equal(absorbWithBinah(fighter, 20), 0);
	assert.equal(fighter.resonance.armor, 40);
	assert.equal(fighter.resonance.stats.armorAbsorbed, 20);
});

test('damage beyond the vessel passes through and breaks armor cleanly', () => {
	const fighter = { resonance: createFighterResonance(true) };
	grantBinahArmor(fighter, 25);
	assert.equal(absorbWithBinah(fighter, 40), 15);
	assert.equal(fighter.resonance.armor, 0);
	assert.equal(fighter.resonance.armorTimer, 0);
	assert.equal(fighter.resonance.stats.armorAbsorbed, 25);
	assert.ok(fighter.resonance.armorPulse > 0);
});

test('disabled empty resonance never changes incoming damage', () => {
	const fighter = { resonance: createFighterResonance(false) };
	assert.equal(absorbWithBinah(fighter, 17), 17);
	assert.equal(fighter.resonance.stats.armorAbsorbed, 0);
});
