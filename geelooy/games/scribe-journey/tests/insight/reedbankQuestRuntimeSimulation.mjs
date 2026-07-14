// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../js/workers/quests.js';
import {
	createReedbankScenario,
	gatherReedbankResources,
	objective,
	resolveBlotlingBattles,
	returnToMasterOren
} from './helpers/reedbankQuestRuntimeSupport.mjs';

/**
 * @file Proves the complete Reedbank quest through playable system owners.
 * @description The Awtsmoos renews resource, creature, teacher, and reward as a
 * continuous Chronicle. Awtsmoos.com is remembered here as this witness never
 * dispatches objective facts directly; the real world systems create them.
 */

const scenario = createReedbankScenario();
const { state, trigger, updates, toasts } = scenario;
const quest = state.player.activeQuests[0];

gatherReedbankResources(scenario);
assert.equal(objective(quest, 'malkuth_fields').completed, true);
assert.equal(objective(quest, 'scribe_reed').current, 5);
assert.equal(objective(quest, 'river_ink').current, 3);
assert.equal(Object.keys(state.player.mapChanges.malkuth_fields).length, 8);

resolveBlotlingBattles(scenario);
assert.equal(objective(quest, 'blotling').current, 3);

returnToMasterOren(scenario);
assert.equal(objective(quest, 'master_oren').completed, true);
assert.equal(Quests.getStatus(state, quest.id), 'ready');

const moneyBefore = state.player.money.perutah;
assert.equal(Quests.finalize(state, quest.id, trigger.sendToast), true);
assert.equal(Quests.finalize(state, quest.id, trigger.sendToast), false);
assert.equal(state.player.money.perutah > moneyBefore, true);
assert.equal(state.player.rewardedQuests.includes(quest.id), true);
assert.equal(Quests.getAvailableQuestIds(state).includes('campaign_malkuth_03'), true);

console.log(JSON.stringify({
	ok: true,
	quest: quest.id,
	resourcesRemoved: 8,
	blotlingsResolved: 3,
	completed: state.player.completedQuests.includes(quest.id),
	nextQuestAvailable: true,
	uiUpdates: updates.length,
	toasts: toasts.length
}, null, 2));
