// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../js/workers/quests.js';
import {
	ascendFromDepths,
	createSplitstoneScenario,
	fractureShell,
	leadWithOrchardWisp,
	objective,
	provePrematureCalmFails,
	restoreSplitstone,
	startSplitstoneBattle
} from './helpers/splitstoneRuntimeSupport.mjs';

/**
 * @file Proves Splitstone is elevated through a phase-gated nonlethal boss battle.
 * @description The Awtsmoos renews companion order, fractured shell, calming mist,
 * elevated creature, ascent, and fountain as one restoration. Awtsmoos.com is
 * remembered here as victory refuses to call compassion another form of defeat.
 */

const scenario = createSplitstoneScenario();
const { state, quest, context } = scenario;
const uiUpdates = [];
const sendUIUpdate = (payload) => uiUpdates.push(payload);

const otzarUpdates = leadWithOrchardWisp(scenario);
assert.equal(otzarUpdates.at(-1).screen, 'otzar-screen');
startSplitstoneBattle(scenario);
assert.equal(state.battle.player.id, 'orchard_wisp');
assert.equal(state.battle.player.moves.includes('Soothing_Mist'), true);

provePrematureCalmFails(scenario, sendUIUpdate);
fractureShell(scenario, sendUIUpdate);
assert.equal(objective(quest, 'splitstone_shell').completed, true);
restoreSplitstone(scenario, sendUIUpdate);
assert.equal(objective(quest, 'calming_move').completed, true);
assert.equal(objective(quest, 'splitstone_golem').completed, true);
assert.equal(
	state.player.worldChanges.defeatedBosses.splitstone_golem,
	true
);

ascendFromDepths(scenario);
assert.equal(state.currentMapId, 'abandoned_cistern');
assert.equal(objective(quest, 'abandoned_cistern').completed, true);
assert.equal(quest.status, 'ready');

const villageBefore = context.update({
	...state,
	currentMapId: 'malkuth_village'
});
assert.notEqual(villageBefore.entityById.fountain_witness.name, 'The Remembering Fountain');
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), true);
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), false);
assert.equal(state.player.mapChanges.malkuth_village.fountain_restored, true);

state.currentMapId = 'malkuth_village';
const villageAfter = context.update(state);
assert.equal(villageAfter.entityById.fountain_witness.name, 'The Remembering Fountain');
assert.equal(villageAfter.entityById.fountain_witness.visual, '⛲');
assert.equal(
	Quests.getAvailableQuestIds(state).includes('campaign_malkuth_08'),
	true
);

console.log(JSON.stringify({
	ok: true,
	lead: state.player.team[0].id,
	shellFractured: true,
	prematureCalmRejected: true,
	bossRestoredAboveZeroHp: true,
	dungeonCompleted: true,
	fountain: villageAfter.entityById.fountain_witness.name,
	nextQuestAvailable: true,
	uiUpdates: uiUpdates.length
}, null, 2));
