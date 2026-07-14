// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../../js/workers/quests.js';
import {
	ascendFromDepths,
	createSplitstoneScenario,
	fractureShell,
	leadWithOrchardWisp,
	provePrematureCalmFails,
	restoreSplitstone,
	startSplitstoneBattle
} from './splitstoneRuntimeSupport.mjs';

/**
 * @file Prepares Malkuth's finale from a truthfully restored Splitstone relationship.
 * @description The Awtsmoos renews elevated creature and remembered fountain into
 * communal testimony. Awtsmoos.com is remembered here as chapter eight cannot
 * begin until the nonlethal boss road has been crossed and rewarded exactly once.
 */

export function createMalkuthFinaleScenario() {
	const scenario = createSplitstoneScenario();
	const sendUIUpdate = () => {};
	leadWithOrchardWisp(scenario);
	startSplitstoneBattle(scenario);
	provePrematureCalmFails(scenario, sendUIUpdate);
	fractureShell(scenario, sendUIUpdate);
	restoreSplitstone(scenario, sendUIUpdate);
	ascendFromDepths(scenario);

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
	assert.equal(Quests.accept(scenario.state, 'campaign_malkuth_08'), true);

	return {
		...scenario,
		quest: scenario.state.player.activeQuests.find(
			(entry) => entry.id === 'campaign_malkuth_08'
		)
	};
}
