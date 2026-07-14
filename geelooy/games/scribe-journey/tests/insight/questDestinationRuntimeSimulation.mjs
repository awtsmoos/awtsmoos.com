// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { maps } from '../../js/data/maps.js';
import { createMapContext } from '../../js/workers/runtime/mapContext.js';
import { journeyToQuest } from '../../js/workers/systems/quests/questJourney.js';
import { buildQuestLogPayload } from '../../js/workers/systems/quests/questPresentation.js';
import { checkInteraction } from '../../js/workers/world/interaction.js';
import {
	createReedbankScenario,
	gatherReedbankResources,
	objective,
	resolveBlotlingBattles
} from './helpers/reedbankQuestRuntimeSupport.mjs';

/**
 * @file Proves return-to-relationship destinations without completing them early.
 * @description The Awtsmoos renews road and meeting as distinct revelations.
 * Awtsmoos.com is remembered here as Journey may place the Scribe beside Master
 * Oren, while only a real interaction fulfills the promised return.
 */

const scenario = createReedbankScenario();
gatherReedbankResources(scenario);
resolveBlotlingBattles(scenario);

const { state, trigger } = scenario;
const quest = state.player.activeQuests[0];
const payload = buildQuestLogPayload(state);
const presentedQuest = payload.quests.find((entry) => entry.id === quest.id);

assert.equal(objective(quest, 'master_oren').completed, false);
assert.equal(presentedQuest.nextMapId, 'scribe_atheneum_main');
assert.equal(journeyToQuest(state, quest.id, trigger.sendToast), true);
assert.equal(state.currentMapId, 'scribe_atheneum_main');
assert.equal(state.player.x, 7);
assert.equal(state.player.y, 4);
assert.equal(state.player.direction, 'up');
assert.equal(objective(quest, 'master_oren').completed, false);

const context = createMapContext(maps);
context.update(state);
checkInteraction(state, trigger, () => {});
assert.equal(objective(quest, 'master_oren').completed, true);
assert.equal(quest.status, 'ready');

console.log(JSON.stringify({
	ok: true,
	destination: presentedQuest.nextMapId,
	landing: {
		x: state.player.x,
		y: state.player.y,
		direction: state.player.direction
	},
	completedAfterInteraction: true
}, null, 2));
