// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../js/workers/quests.js';
import {
	createMalkuthFinaleScenario,
	crossMoonlitRoad,
	hearMalkuthElders,
	objective,
	recoverFirstPage,
	returnFirstPageToOren,
	surviveBlanklingWaves,
	witnessPaleEditor
} from './helpers/malkuthFinaleRuntimeSupport.mjs';

/**
 * @file Proves Malkuth's full finale and the physical road into Yesod.
 * @description The Awtsmoos renews elder, page, escalating Blankling, Editor,
 * teacher, and moonlit threshold as one ending. Awtsmoos.com is remembered here
 * as chapter completion remains false until the restored road is actually crossed.
 */

const scenario = createMalkuthFinaleScenario();
const { state, quest, context } = scenario;
state.currentMapId = 'malkuth_village';
const sealedVillage = context.update(state);
assert.equal(sealedVillage.entityById.yesod_door.name, 'Sealed Moonlit Road');
assert.equal(sealedVillage.entityById.yesod_door.visual, '🔒');

hearMalkuthElders(scenario);
assert.equal(objective(quest, 'malkuth_elders').current, 4);
recoverFirstPage(scenario);
assert.equal(objective(quest, 'first_page_fragment').completed, true);
assert.equal(
	state.player.inventory.filter((item) => item.id === 'first_page_fragment').length,
	1
);

const waveOpponents = surviveBlanklingWaves(scenario);
assert.deepEqual(waveOpponents, [
	'blankling_scout',
	'blankling_silencer',
	'blankling_guardian'
]);
assert.equal(objective(quest, 'blankling_attack').current, 3);

witnessPaleEditor(scenario);
assert.equal(objective(quest, 'pale_editor_projection').completed, true);
returnFirstPageToOren(scenario);
assert.equal(objective(quest, 'master_oren').completed, true);
assert.equal(quest.status, 'ready');

assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), true);
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), false);
assert.equal(state.player.mapChanges.malkuth_village.yesod_road_open, true);
assert.equal(state.player.completedQuests.includes('campaign_malkuth_08'), true);

state.currentMapId = 'malkuth_village';
const restoredVillage = context.update(state);
assert.equal(restoredVillage.entityById.yesod_door.name, 'Moonlit Road to Yesod');
assert.equal(restoredVillage.entityById.yesod_door.visual, '🌙');

crossMoonlitRoad(scenario);
assert.equal(state.currentMapId, 'yesod_shore');

console.log(JSON.stringify({
	ok: true,
	eldersHeard: 4,
	pageRecovered: true,
	waves: waveOpponents,
	paleEditorWitnessed: true,
	firstPageRestored: true,
	road: restoredVillage.entityById.yesod_door.name,
	arrivedIn: state.currentMapId
}, null, 2));
