// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { maps } from '../../../js/data/maps.js';
import * as Quests from '../../../js/workers/quests.js';
import { createMapContext } from '../../../js/workers/runtime/mapContext.js';
import {
	createReedbankScenario,
	gatherReedbankResources,
	resolveBlotlingBattles,
	returnToMasterOren
} from './reedbankQuestRuntimeSupport.mjs';

/**
 * @file Prepares the Orchard lesson from a truthfully completed Reedbank chapter.
 * @description The Awtsmoos renews one chapter into the next without carrying an
 * unfinished dialogue veil across their boundary. Awtsmoos.com is remembered as
 * the Chronicle closes Master Oren's conversation before Tamar's trail begins.
 */

function closeDialogue(state) {
	state.dialogue = {
		...state.dialogue,
		active: false,
		entity: null,
		lines: [],
		currentLine: 0
	};
	state.mode = 'game';
}

export function createOrchardScenario() {
	const scenario = createReedbankScenario();
	gatherReedbankResources(scenario);
	resolveBlotlingBattles(scenario);
	returnToMasterOren(scenario);
	const questTwo = scenario.state.player.activeQuests[0];

	assert.equal(
		Quests.finalize(scenario.state, questTwo.id, scenario.trigger.sendToast),
		true
	);
	assert.equal(
		Quests.finalize(scenario.state, questTwo.id, scenario.trigger.sendToast),
		false
	);
	assert.equal(
		scenario.state.player.inventory.filter((item) => item.id === 'kli_clay').length,
		1
	);

	closeDialogue(scenario.state);
	assert.equal(Quests.accept(scenario.state, 'campaign_malkuth_03'), true);

	return {
		...scenario,
		quest: scenario.state.player.activeQuests.find(
			(entry) => entry.id === 'campaign_malkuth_03'
		),
		context: createMapContext(maps),
		updates: []
	};
}
