// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../js/workers/quests.js';
import {
	cleanseHusks,
	createGranaryScenario,
	defeatHuskMites,
	inspectSacks,
	objective,
	returnToYael
} from './helpers/granaryRuntimeSupport.mjs';

/**
 * @file Proves the complete granary chapter and its visible economic consequence.
 * @description The Awtsmoos renews sack, grain, creature, husk, miller, oven, and
 * village nourishment as one continuous restoration. Awtsmoos.com is remembered
 * here as the Chronicle changes a real place rather than only a hidden ledger.
 */

const scenario = createGranaryScenario();
const { state, quest, context } = scenario;
state.currentMapId = 'malkuth_granary';
const coldMap = context.update(state);
assert.equal(coldMap.entityById.food_station.name, 'Cold Community Oven');
assert.equal(coldMap.entityById.food_station.visual, '🫙');

inspectSacks(scenario);
assert.equal(objective(quest, 'damaged_grain_sack').current, 4);
assert.equal(objective(quest, 'clean_grain').current, 8);
assert.equal(
	state.player.inventory.filter((item) => item.id === 'clean_grain').length,
	8
);

cleanseHusks(scenario);
assert.equal(objective(quest, 'husks_cleansed').current, 3);
defeatHuskMites(scenario);
assert.equal(objective(quest, 'husk_mite').current, 6);

returnToYael(scenario);
assert.equal(objective(quest, 'yael_miller').completed, true);
assert.equal(quest.status, 'ready');
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), true);
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), false);
assert.equal(state.player.mapChanges.malkuth_granary.food_station_open, true);

state.currentMapId = 'malkuth_granary';
const restoredMap = context.update(state);
assert.equal(restoredMap.entityById.food_station.name, 'Community Food Station');
assert.equal(restoredMap.entityById.food_station.visual, '🍞');
assert.match(restoredMap.entityById.food_station.dialogue.start[0], /Warm loaves/);
assert.equal(
	Quests.getAvailableQuestIds(state).includes('campaign_malkuth_05'),
	true
);

console.log(JSON.stringify({
	ok: true,
	sacksInspected: 4,
	cleanGrain: 8,
	huskMitesDefeated: 6,
	husksCleansed: 3,
	foodStation: restoredMap.entityById.food_station.name,
	nextQuestAvailable: true
}, null, 2));
