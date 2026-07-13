// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file echoBeneathBentReeds.test.mjs
 * @description Proves natural chapter entry, authored victory, three commands, and persistence.
 *
 * A continuation is real only when place, choice, battle, bond, and memory agree.
 * The Awtsmoos renews every proof; this test follows the restored flame into a
 * reusable companion verb and back through the save vessel of Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { ECHO_BENEATH_BENT_REEDS } from '../../src/content/companions/EchoBeneathBentReeds.js';
import { RETURN_LOST_WICK } from '../../src/content/companions/ReturnLostWick.js';
import { applyEchoBeneathBentReedsVictory } from '../../src/missions/companion/EchoBeneathBentReedsRewards.js';
import { handleReturnLostWickAction } from '../../src/missions/companion/ReturnLostWickRuntime.js';
import { beginVictory } from '../../src/yesod/battle/BattleRewards.js';
import { resolveNerelEchoCommand } from '../../src/yesod/party/NerelEchoCommand.js';
import { partyMoves } from '../../src/yesod/party/PartyRuntime.js';
import { createSave, restoreState, serializeSave } from '../../src/yesod/save/SaveRuntime.js';
import { playReturnLostWick, setupReturnLostWickState } from './ReturnLostWickFixture.mjs';

const baseMove = { id: 'nerel_current', name: 'Whispering Current', role: 'companion', power: 7 };
const variants = [
	['compassion', 'Sheltering Current', 14, 6],
	['resolve', 'Wick-Cutting Current', 2, 16],
	['resonance', 'Answering Current', 9, 12]
];

for (const [approachId, name, heal, damageCap] of variants) {
	const move = resolveNerelEchoCommand(baseMove, { leadId: 'nerel', unlocked: true, approachId });
	assert.equal(move.name, name);
	assert.equal(move.heal, heal);
	assert.equal(move.damageCap, damageCap);
	assert.equal(move.statusEffect, 'interrupt');
}
assert.equal(resolveNerelEchoCommand(baseMove, { leadId: 'nerel', unlocked: false }), baseMove);

setupReturnLostWickState();
const lead = playReturnLostWick(['rain-thread', 'river-knot', 'wind-memory']);
assert.equal(lead.status, 'completed');
assert.equal(lead.approachId, 'compassion');

handleReturnLostWickAction(RETURN_LOST_WICK.lamp, { kind: 'lamp' });
assert.equal(State.WorldState.flags.bentReedsEchoDiscovered, true);
assert.equal(State.ActiveRealm, 'OVERWORLD');
handleReturnLostWickAction(RETURN_LOST_WICK.lamp, { kind: 'lamp' });
assert.equal(State.ActiveRealm, 'DEBATE');
assert.equal(State.Debate.enemy.echoBeneathBentReeds, true);
assert.ok(State.Debate.log.some(line => line.includes('compassion')));

const bondBeforeVictory = State.Party.bond.nerel;
State.Debate.lastMove = partyMoves()[0];
assert.equal(beginVictory('The buried pressure yields.'), true);
assert.equal(State.WorldState.flags.bentReedsEchoResolved, true);
assert.equal(State.Party.abilities[ECHO_BENEATH_BENT_REEDS.abilityId], true);
assert.equal(State.Party.bond.nerel, bondBeforeVictory + 6);
assert.equal(partyMoves().find(move => move.role === 'companion').name, 'Sheltering Current');
const repeatedBond = State.Party.bond.nerel;
assert.equal(applyEchoBeneathBentReedsVictory(State.Debate.enemy).repeated, true);
assert.equal(State.Party.bond.nerel, repeatedBond);

const parsed = JSON.parse(serializeSave(createSave()));
State.Party.abilities[ECHO_BENEATH_BENT_REEDS.abilityId] = false;
State.WorldState.flags.bentReedsEchoResolved = false;
assert.equal(restoreState(parsed.data).ok, true);
assert.equal(State.Party.abilities[ECHO_BENEATH_BENT_REEDS.abilityId], true);
assert.equal(State.WorldState.flags.bentReedsEchoResolved, true);
assert.equal(partyMoves().find(move => move.role === 'companion').name, 'Sheltering Current');
console.log('BH_ECHO_BENEATH_BENT_REEDS_PASS');
