// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file echoChannel.test.mjs
 * @description Proves traversal, clue gating, concealed material, boss consequence, armor, return, and persistence.
 *
 * A concealed road is only real when old choice, new movement, battle, equipment,
 * world memory, and save restoration agree. The Awtsmoos renews every proof while
 * this test keeps the browser RPG honest before the roads of Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { ECHO_CHANNEL, echoChannelApproachLine } from '../../src/content/companions/EchoChannel.js';
import { RETURN_LOST_WICK } from '../../src/content/companions/ReturnLostWick.js';
import { applyEchoChannelVictory } from '../../src/missions/companion/EchoChannelRewards.js';
import { restoreAnsweringWatersMantle } from '../../src/missions/companion/EchoChannelCrafting.js';
import { handleEchoChannelAction } from '../../src/missions/companion/EchoChannelRuntime.js';
import { handleReturnLostWickAction } from '../../src/missions/companion/ReturnLostWickRuntime.js';
import { enterReturnLostWickRoad } from '../../src/missions/companion/ReturnLostWickTravel.js';
import { beginVictory, closeBattle } from '../../src/yesod/battle/BattleRewards.js';
import { resolveNerelEchoCommand } from '../../src/yesod/party/NerelEchoCommand.js';
import { createSave, restoreState, serializeSave } from '../../src/yesod/save/SaveRuntime.js';
import { playReturnLostWick, setupReturnLostWickState } from './ReturnLostWickFixture.mjs';

const approachLines = ['compassion', 'resolve', 'resonance'].map(echoChannelApproachLine);
assert.equal(new Set(approachLines).size, 3);

setupReturnLostWickState();
const lead = playReturnLostWick(['rain-thread', 'river-knot', 'wind-memory']);
handleReturnLostWickAction(RETURN_LOST_WICK.lamp, { kind: 'lamp' });
handleReturnLostWickAction(RETURN_LOST_WICK.lamp, { kind: 'lamp' });
assert.equal(State.ActiveRealm, 'DEBATE');
assert.equal(beginVictory('The buried echo yields.'), true);
closeBattle('The echo becomes a command.', true);

handleReturnLostWickAction(RETURN_LOST_WICK.lamp, { kind: 'lamp' });
assert.equal(State.MapId, ECHO_CHANNEL.maps.threshold);
handleEchoChannelAction(ECHO_CHANNEL.points.thresholdGate);
assert.equal(State.WorldState.flags[ECHO_CHANNEL.flags.discovered], true);
assert.equal(State.MapId, ECHO_CHANNEL.maps.threshold);
handleEchoChannelAction(ECHO_CHANNEL.points.thresholdGate);
assert.equal(State.MapId, ECHO_CHANNEL.maps.depths);

handleEchoChannelAction(ECHO_CHANNEL.points.concealedGate);
assert.equal(State.MapId, ECHO_CHANNEL.maps.depths);
handleEchoChannelAction(ECHO_CHANNEL.points.inscription);
assert.equal(State.WorldState.flags[ECHO_CHANNEL.flags.inscriptionRead], true);
handleEchoChannelAction(ECHO_CHANNEL.points.concealedGate);
assert.equal(State.MapId, ECHO_CHANNEL.maps.concealed);

handleEchoChannelAction(ECHO_CHANNEL.points.thread);
assert.equal(State.Inventory.items[ECHO_CHANNEL.items.thread], 1);
handleEchoChannelAction(ECHO_CHANNEL.points.thread);
assert.equal(State.Inventory.items[ECHO_CHANNEL.items.thread], 1);
handleEchoChannelAction(ECHO_CHANNEL.points.concealedReturn);
assert.equal(State.MapId, ECHO_CHANNEL.maps.depths);

handleEchoChannelAction(ECHO_CHANNEL.points.guardian);
assert.equal(State.ActiveRealm, 'DEBATE');
assert.equal(State.Debate.enemy[ECHO_CHANNEL.encounterMarker], true);
const bondBefore = State.Party.bond.nerel;
assert.equal(beginVictory('The gathering current is interrupted.'), true);
assert.equal(State.WorldState.flags[ECHO_CHANNEL.flags.bossResolved], true);
assert.equal(State.Inventory.items[ECHO_CHANNEL.items.relic], 1);
assert.equal(State.Party.bond.nerel, bondBefore + 6);
const rewardEnemy = State.Debate.enemy;
closeBattle('The channel opens upward.', true);

handleEchoChannelAction(ECHO_CHANNEL.points.guardian);
assert.equal(State.MapId, ECHO_CHANNEL.maps.restored);
handleEchoChannelAction(ECHO_CHANNEL.points.restoredLamp);
assert.equal(State.WorldState.flags[ECHO_CHANNEL.flags.mantleRestored], true);
assert.equal(State.Equipment.garment, ECHO_CHANNEL.garmentId);
assert.equal(State.Inventory.garments.filter(id => id === ECHO_CHANNEL.garmentId).length, 1);
assert.equal(State.Inventory.items[ECHO_CHANNEL.items.thread], 0);
handleEchoChannelAction(ECHO_CHANNEL.points.afterword);
assert.equal(State.WorldState.flags[ECHO_CHANNEL.flags.afterwordRead], true);

const strengthened = resolveNerelEchoCommand(
	{ id: 'nerel_current', power: 7 },
	{ leadId: 'nerel', unlocked: true, approachId: lead.approachId }
);
assert.equal(strengthened.mantleResonance, true);
assert.equal(strengthened.heal, 18);
assert.equal(strengthened.damageCap, 10);

const repeatedBond = State.Party.bond.nerel;
assert.equal(applyEchoChannelVictory(rewardEnemy).repeated, true);
assert.equal(State.Party.bond.nerel, repeatedBond);
assert.equal(restoreAnsweringWatersMantle().repeated, true);

const parsed = JSON.parse(serializeSave(createSave()));
State.WorldState.flags[ECHO_CHANNEL.flags.mantleRestored] = false;
State.Equipment.garment = 'WHITE_LINEN';
State.MapId = 'Overworld_Main';
assert.equal(restoreState(parsed.data).ok, true);
assert.equal(State.WorldState.flags[ECHO_CHANNEL.flags.mantleRestored], true);
assert.equal(State.Equipment.garment, ECHO_CHANNEL.garmentId);
assert.equal(State.MapId, ECHO_CHANNEL.maps.restored);

State.MapId = 'Overworld_Main';
enterReturnLostWickRoad();
assert.equal(State.MapId, ECHO_CHANNEL.maps.restored);
console.log('BH_ECHO_CHANNEL_PASS');
