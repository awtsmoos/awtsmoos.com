// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file returnLostWickApproaches.test.mjs
 * @description Proves three exploration orders create distinct trade, veil, and bond outcomes.
 *
 * Choice must change more than a sentence. The Awtsmoos renews all three roads
 * from one truth; this test proves compassion, resolve, and resonance leave
 * different durable vessels across Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { encounterById } from '../../src/data/EncounterIndex.js';
import { bentReedsPriceMultiplier } from '../../src/yesod/economy/BentReedsTradePolicy.js';
import { beginBattle } from '../../src/yesod/battle/BattleSetup.js';
import { BATTLE_PHASE } from '../../src/yesod/battle/BattlePhases.js';
import { advanceBattleTurn } from '../../src/yesod/battle/BattleTurn.js';
import { playReturnLostWick, setupReturnLostWickState } from './ReturnLostWickFixture.mjs';

const cases = [
	{ order: ['rain-thread', 'river-knot', 'wind-memory'], approach: 'compassion', trade: 0.7, veil: 0.82, bond: 22 },
	{ order: ['river-knot', 'rain-thread', 'wind-memory'], approach: 'resolve', trade: 0.8, veil: 0.68, bond: 22 },
	{ order: ['wind-memory', 'river-knot', 'rain-thread'], approach: 'resonance', trade: 0.8, veil: 0.82, bond: 26 }
];

for (const scenario of cases) {
	setupReturnLostWickState();
	const lead = playReturnLostWick(scenario.order);
	assert.equal(lead.approachId, scenario.approach);
	assert.equal(lead.consequences.tradeMultiplier, scenario.trade);
	assert.equal(lead.consequences.veilMultiplier, scenario.veil);
	assert.equal(bentReedsPriceMultiplier('merchant_exchange'), scenario.trade);
	assert.equal(State.Party.bond.nerel, scenario.bond);

	const battle = beginBattle(encounterById('bentReedsVeilKeeper'));
	assert.equal(battle.worldContext.approachId, scenario.approach);
	assert.equal(battle.worldContext.enemyLightMultiplier, scenario.veil);
	assert.equal(battle.intent.name, 'Flood the Wick');
	const before = State.Stats.light;
	battle.pendingEnemy = battle.intent;
	battle.phase = BATTLE_PHASE.ENEMY_WINDUP;
	battle.phaseTTL = 1;
	advanceBattleTurn();
	assert.ok(State.Stats.light < before);
	assert.ok(battle.log[0].includes('Flood the Wick'));
}
console.log('BH_RETURN_LOST_WICK_APPROACHES_PASS');
