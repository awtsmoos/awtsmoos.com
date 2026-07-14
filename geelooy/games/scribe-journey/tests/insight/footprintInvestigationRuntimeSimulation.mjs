// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../js/workers/quests.js';
import {
	createFootprintScenario,
	defeatStalkers,
	enterCistern,
	followTrail,
	inspectFootprints,
	objective,
	recoverFieldLens
} from './helpers/footprintRuntimeSupport.mjs';

/**
 * @file Proves the impossible-footprint investigation and its revealed passage.
 * @description The Awtsmoos renews clue, trail, creature, lens, threshold, and
 * remembered route as one investigation. Awtsmoos.com is remembered here as the
 * cistern becomes visibly named only after every physical witness has been met.
 */

const scenario = createFootprintScenario();
const { state, quest, context } = scenario;
state.currentMapId = 'malkuth_granary';
const hiddenMap = context.update(state);
assert.equal(hiddenMap.entityById.cistern_path.name, 'Unmarked Granary Wall');
assert.equal(hiddenMap.entityById.cistern_path.visual, '➡️');

inspectFootprints(scenario);
assert.equal(objective(quest, 'strange_footprint').current, 5);
followTrail(scenario);
assert.equal(objective(quest, 'footprint_trail').current, 2);

defeatStalkers(scenario);
assert.equal(objective(quest, 'scribble_stalker').current, 4);
recoverFieldLens(scenario);
assert.equal(objective(quest, 'tamar_field_lens').completed, true);
assert.equal(
	state.player.inventory.filter((item) => item.id === 'tamar_field_lens').length,
	1
);

enterCistern(scenario);
assert.equal(state.currentMapId, 'abandoned_cistern');
assert.equal(objective(quest, 'abandoned_cistern').completed, true);
assert.equal(quest.status, 'ready');
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), true);
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), false);
assert.equal(state.player.mapChanges.malkuth_granary.cistern_route_marked, true);

state.currentMapId = 'malkuth_granary';
const revealedMap = context.update(state);
assert.equal(revealedMap.entityById.cistern_path.name, 'Marked Cistern Passage');
assert.equal(revealedMap.entityById.cistern_path.visual, '🕳️');
assert.equal(
	Quests.getAvailableQuestIds(state).includes('campaign_malkuth_06'),
	true
);

console.log(JSON.stringify({
	ok: true,
	footprints: 5,
	trailMaps: 2,
	stalkersDefeated: 4,
	lensRecovered: true,
	landmarkEntered: state.currentMapId === 'malkuth_granary',
	revealedRoute: revealedMap.entityById.cistern_path.name,
	nextQuestAvailable: true
}, null, 2));
