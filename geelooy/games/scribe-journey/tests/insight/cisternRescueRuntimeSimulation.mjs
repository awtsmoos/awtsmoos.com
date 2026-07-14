// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../js/workers/quests.js';
import {
	createCisternScenario,
	defeatCrawlers,
	defendCrossing,
	escortEli,
	objective,
	redirectWater,
	turnCisternWheels
} from './helpers/cisternRuntimeSupport.mjs';

/**
 * @file Proves the full waterworks rescue and its visible restored channel.
 * @description The Awtsmoos renews wheel, channel, creature, child, defense, and
 * water supply as one rescue. Awtsmoos.com is remembered here as the final state
 * changes a real cistern entity rather than only an invisible completion ledger.
 */

const scenario = createCisternScenario();
const { state, quest, context } = scenario;
state.currentMapId = 'abandoned_cistern';
const sealedMap = context.update(state);
assert.equal(sealedMap.entityById.channel_gate.name, 'Sealed Water Channel');
assert.equal(sealedMap.entityById.channel_gate.visual, '🌊');

turnCisternWheels(scenario);
assert.equal(objective(quest, 'cistern_wheels').current, 3);
redirectWater(scenario);
assert.equal(objective(quest, 'cistern_channels').completed, true);
assert.equal(
	context.update(state).entityById.channel_gate.name,
	'Sealed Water Channel'
);

defeatCrawlers(scenario);
assert.equal(objective(quest, 'cistern_crawler').current, 5);
escortEli(scenario);
assert.equal(objective(quest, 'eli_child').completed, true);
defendCrossing(scenario);
assert.equal(objective(quest, 'eli_ambush').completed, true);
assert.equal(quest.status, 'ready');

assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), true);
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), false);
assert.equal(state.player.mapChanges.abandoned_cistern.water_channels_restored, true);

state.currentMapId = 'abandoned_cistern';
const restoredMap = context.update(state);
assert.equal(restoredMap.entityById.channel_gate.name, 'Restored Water Channel');
assert.equal(restoredMap.entityById.channel_gate.visual, '💧');
assert.match(restoredMap.entityById.channel_gate.dialogue.start[0], /Clean water/);
assert.equal(
	Quests.getAvailableQuestIds(state).includes('campaign_malkuth_07'),
	true
);

console.log(JSON.stringify({
	ok: true,
	wheelsTurned: 3,
	channelRedirected: true,
	crawlersDefeated: 5,
	eliEscorted: true,
	ambushDefended: true,
	restoredChannel: restoredMap.entityById.channel_gate.name,
	nextQuestAvailable: true
}, null, 2));
