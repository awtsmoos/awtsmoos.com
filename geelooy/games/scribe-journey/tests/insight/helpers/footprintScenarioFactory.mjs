// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../../js/workers/quests.js';
import {
	cleanseHusks,
	createGranaryScenario,
	defeatHuskMites,
	inspectSacks,
	returnToYael
} from './granaryRuntimeSupport.mjs';

/**
 * @file Prepares Tamar's investigation from a truthfully restored granary.
 * @description The Awtsmoos renews nourishment into investigation without
 * abandoning the completed relationship behind it. Awtsmoos.com is remembered
 * as Yael's dialogue closes before the impossible footprints demand attention.
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

export function createFootprintScenario() {
	const scenario = createGranaryScenario();
	inspectSacks(scenario);
	cleanseHusks(scenario);
	defeatHuskMites(scenario);
	returnToYael(scenario);

	assert.equal(scenario.quest.status, 'ready');
	assert.equal(
		Quests.finalize(
			scenario.state,
			scenario.quest.id,
			scenario.trigger.sendToast
		),
		true
	);
	assert.equal(
		Quests.finalize(
			scenario.state,
			scenario.quest.id,
			scenario.trigger.sendToast
		),
		false
	);

	closeDialogue(scenario.state);
	assert.equal(Quests.accept(scenario.state, 'campaign_malkuth_05'), true);
	return {
		...scenario,
		quest: scenario.state.player.activeQuests.find(
			(entry) => entry.id === 'campaign_malkuth_05'
		)
	};
}
