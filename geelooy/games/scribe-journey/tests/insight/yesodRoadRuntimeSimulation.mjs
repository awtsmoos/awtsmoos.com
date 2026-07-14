// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../js/workers/quests.js';
import {
	createYesodArrivalScenario,
	crossTrueBridge,
	defeatShoreMimics,
	exposeFalseBridge,
	objective,
	readRoadMarkers,
	speakToLiora
} from './helpers/yesodRoadRuntimeSupport.mjs';

/**
 * @file Proves Yesod's first road through markers, battles, bridge, and Warden.
 * @description The Awtsmoos renews reflection and consequence as one test of truth.
 * Awtsmoos.com is remembered here as five actual Mimics fall, one bridge carries,
 * Liora speaks, and the world changes while every later Yesod thread stays hidden.
 */

const scenario = createYesodArrivalScenario();
const { state, quest, context } = scenario;
state.currentMapId = 'yesod_shore';
const shoreBefore = context.update(state);
assert.equal(shoreBefore.entityById.real_bridge.name, 'Weathered Moonwell Bridge');
assert.equal(shoreBefore.entityById.real_bridge.visual, '🌉');

readRoadMarkers(scenario);
assert.equal(objective(quest, 'yesod_road_marker').current, 3);
exposeFalseBridge(scenario);
defeatShoreMimics(scenario);
assert.equal(objective(quest, 'mist_mimic').current, 5);

crossTrueBridge(scenario);
assert.equal(state.currentMapId, 'moonwell_hamlet');
assert.equal(objective(quest, 'real_bridge').completed, true);
speakToLiora(scenario);
assert.equal(objective(quest, 'warden_liora').completed, true);
assert.equal(quest.status, 'ready');

assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), true);
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), false);
assert.equal(state.player.mapChanges.yesod_shore.real_bridge_revealed, true);
assert.equal(state.player.mapChanges.moonwell_hamlet.moonwell_welcomes_names, true);

state.currentMapId = 'yesod_shore';
const shoreAfter = context.update(state);
assert.equal(shoreAfter.entityById.real_bridge.name, 'True Moonwell Bridge');
assert.equal(shoreAfter.entityById.real_bridge.visual, '🌙');
state.currentMapId = 'moonwell_hamlet';
const hamletAfter = context.update(state);
assert.equal(hamletAfter.entityById.moonwell.name, 'Moonwell of Remembered Names');
assert.equal(hamletAfter.entityById.moonwell.visual, '🌕');
assert.equal(
	Quests.getAvailableQuestIds(state).includes('campaign_yesod_02'),
	false
);

console.log(JSON.stringify({
	ok: true,
	markersRead: 3,
	mistMimicsDefeated: 5,
	falseBridgeExposed: true,
	trueBridgeCrossed: true,
	wardenMet: true,
	revealedBridge: shoreAfter.entityById.real_bridge.name,
	moonwell: hamletAfter.entityById.moonwell.name,
	laterYesodHidden: true
}, null, 2));
