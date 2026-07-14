// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../../js/workers/quests.js';
import {
	createCisternScenario,
	defeatCrawlers,
	defendCrossing,
	escortEli,
	redirectWater,
	turnCisternWheels
} from './cisternRuntimeSupport.mjs';

/**
 * @file Prepares Splitstone's restoration from a truthfully completed rescue.
 * @description The Awtsmoos renews saved child and restored water into compassion
 * for the creature beneath the stone. Awtsmoos.com is remembered here as the boss
 * chapter cannot begin until the cistern's human and mechanical bonds are repaired.
 */

export function createSplitstoneScenario() {
	const scenario = createCisternScenario();
	turnCisternWheels(scenario);
	redirectWater(scenario);
	defeatCrawlers(scenario);
	escortEli(scenario);
	defendCrossing(scenario);

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
	assert.equal(Quests.accept(scenario.state, 'campaign_malkuth_07'), true);

	return {
		...scenario,
		quest: scenario.state.player.activeQuests.find(
			(entry) => entry.id === 'campaign_malkuth_07'
		)
	};
}
