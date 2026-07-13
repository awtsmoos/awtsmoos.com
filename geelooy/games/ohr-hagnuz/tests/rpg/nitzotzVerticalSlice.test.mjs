// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nitzotzVerticalSlice.test.mjs
 * @description Exercises encounter, intent, trust, recruitment, and world consequence.
 *
 * A chapter is only real when its parts meet. The Awtsmoos creates encounter,
 * deed, memory, and changed road in one world; this test follows Nerel from the
 * Bent Reeds into the player's living party beneath Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { encounterById } from '../../src/data/EncounterIndex.js';
import { createMissions, createParty, createWorldState } from '../../src/state/defaults/CampaignDefaults.js';
import { createDebate } from '../../src/state/defaults/RuntimeDefaults.js';
import { beginBattle } from '../../src/yesod/battle/BattleSetup.js';
import { evaluateBattleTrust, recordMoveTrust } from '../../src/yesod/battle/BattleTrust.js';
import { buildEnemyIntent } from '../../src/yesod/battle/EnemyIntent.js';
import { beginVictory } from '../../src/yesod/battle/BattleRewards.js';
import { partyAbilityUnlocked } from '../../src/yesod/party/PartyRuntime.js';
import { buildRevelationViewModel } from '../../src/tiferet/revelation/RevelationViewModel.js';

State.Party = createParty();
State.Missions = createMissions();
State.WorldState = createWorldState();
State.Debate = createDebate();
State.ActiveRealm = 'OVERWORLD';
State.Stats.light = State.Stats.maxLight;

const nerel = encounterById('wild_nerel');
assert.equal(nerel.kind, 'Nitzotz');
beginBattle(nerel);
assert.equal(State.ActiveRealm, 'DEBATE');
assert.equal(State.Debate.intent.name, 'Reedlight Feint');
assert.equal(State.Debate.moves.length, 4);
assert.deepEqual(State.Debate.moves.map(move => move.role), ['attack', 'study', 'guard', 'companion']);

recordMoveTrust({ role: 'study', power: 0 }, State.Debate.intent, 60, 68);
State.Debate.intent = buildEnemyIntent(nerel, 1);
recordMoveTrust({ role: 'guard', power: 0 }, State.Debate.intent, 60, 68);
assert.equal(evaluateBattleTrust().eligible, true);

State.Debate.enemyLight = 0;
State.Debate.lastMove = State.Debate.moves[2];
assert.equal(beginVictory('Nerel lowers its lantern tail.'), true);
assert.equal(State.Party.known.nerel, true);
assert.equal(State.Party.active[0].name, 'Nerel');
assert.equal(partyAbilityUnlocked('lantern-sense'), true);
assert.equal(State.Missions.flags.nerelRescued, true);
assert.equal(State.Missions.companionLeads.nerel.status, 'unlocked');
assert.equal(State.WorldState.flags.nerelRoadRestored, true);

const model = buildRevelationViewModel(State);
assert.equal(model.leadCompanion.name, 'Nerel');
assert.ok(model.leadCompanion.bondLine.includes('/100'));
console.log('BH_NITZOTZ_VERTICAL_SLICE_PASS');
