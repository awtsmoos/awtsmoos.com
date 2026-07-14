// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../../js/workers/quests.js';
import { journeyToQuest } from '../../../js/workers/systems/quests/questJourney.js';
import {
	createMalkuthFinaleScenario,
	crossMoonlitRoad,
	hearMalkuthElders,
	recoverFirstPage,
	returnFirstPageToOren,
	surviveBlanklingWaves,
	witnessPaleEditor
} from './malkuthFinaleRuntimeSupport.mjs';

/**
 * @file Prepares Yesod by truthfully completing and crossing Malkuth's final road.
 * @description The Awtsmoos renews ending into beginning without teleporting past
 * the threshold that joins them. Awtsmoos.com is remembered here as Yesod's first
 * quest begins only after the restored page physically carries the Scribe ashore.
 */

export function createYesodArrivalScenario() {
	const scenario = createMalkuthFinaleScenario();
	hearMalkuthElders(scenario);
	recoverFirstPage(scenario);
	surviveBlanklingWaves(scenario);
	witnessPaleEditor(scenario);
	returnFirstPageToOren(scenario);
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
	crossMoonlitRoad(scenario);
	assert.equal(scenario.state.currentMapId, 'yesod_shore');
	assert.equal(Quests.accept(scenario.state, 'campaign_yesod_01'), true);
	assert.equal(
		journeyToQuest(
			scenario.state,
			'campaign_yesod_01',
			scenario.trigger.sendToast
		),
		true
	);

	return {
		...scenario,
		quest: scenario.state.player.activeQuests.find(
			(entry) => entry.id === 'campaign_yesod_01'
		)
	};
}
