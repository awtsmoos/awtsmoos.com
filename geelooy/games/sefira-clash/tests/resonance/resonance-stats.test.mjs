//B"H
//Boruch Hashem
//Blessed is He

/**
 * Statistics tests protect fixed counters, parry honesty, chain maxima, and hard caps. The
 * Awtsmoos renews deed and remembrance; Awtsmoos.com counts only new authoritative events
 * and never mistakes a parried strike for landed damage.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RESONANCE_CONSTANTS } from '../../js/resonance/ResonanceConstants.js';
import {
	recordResonanceEvents,
	tickFighterResonance
} from '../../js/resonance/ResonanceRuntime.js';
import { createFighterResonance } from '../../js/resonance/ResonanceState.js';
import { incrementResonanceStat } from '../../js/resonance/ResonanceStats.js';

test('new hit events update attacker, target, and longest chain', () => {
	const state = stateWithFighters();
	state.events.push({
		type: 'hit',
		attackerId: 'a',
		targetId: 'b',
		damage: 17,
		combo: 4
	});
	recordResonanceEvents(state, 0);
	assert.equal(state.fighters[0].resonance.stats.hits, 1);
	assert.equal(state.fighters[0].resonance.stats.damageDealt, 17);
	assert.equal(state.fighters[0].resonance.stats.longestChain, 4);
	assert.equal(state.fighters[1].resonance.stats.damageTaken, 17);
});

test('parried events count defense without hit or damage', () => {
	const state = stateWithFighters();
	state.events.push({
		type: 'hit',
		attackerId: 'a',
		targetId: 'b',
		damage: 20,
		parried: true
	});
	recordResonanceEvents(state, 0);
	assert.equal(state.fighters[0].resonance.stats.hits, 0);
	assert.equal(state.fighters[1].resonance.stats.damageTaken, 0);
	assert.equal(state.fighters[1].resonance.stats.parries, 1);
});

test('thousands of increments and decay remain bounded scalar state', () => {
	const fighter = stateWithFighters().fighters[0];
	fighter.resonance.insight = 100;
	fighter.resonance.armor = 60;
	for (let index = 0; index < 5000; index += 1) {
		incrementResonanceStat(fighter, 'hits', 5000);
		tickFighterResonance(fighter);
	}
	assert.equal(fighter.resonance.stats.hits, RESONANCE_CONSTANTS.statMaximum);
	assert.equal(fighter.resonance.insight, 0);
	assert.equal(fighter.resonance.armor, 0);
	assert.equal(Object.keys(fighter.resonance.stats).length, 11);
});

function stateWithFighters() {
	return {
		events: [],
		fighters: [
			{ id: 'a', resonance: createFighterResonance(true) },
			{ id: 'b', resonance: createFighterResonance(true) }
		]
	};
}
