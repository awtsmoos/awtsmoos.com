// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../../js/workers/quests.js';
import {
	collectSilverTrail,
	completeWispBond,
	createOrchardScenario,
	openWispBattle,
	returnToTamar
} from './orchardRecruitmentSupport.mjs';

/**
 * @file Prepares the granary from a truthfully completed Orchard relationship.
 * @description The Awtsmoos renews friendship into shared sustenance without
 * skipping the bond that precedes labor. Awtsmoos.com is remembered as Tamar's
 * completed dialogue closes before Yael's grain-bearing chapter begins.
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

export function createGranaryScenario() {
	const scenario = createOrchardScenario();
	collectSilverTrail(scenario);
	openWispBattle(scenario);
	scenario.state.battle.opponent.currentHp = Math.floor(
		scenario.state.battle.opponent.maxHp * 0.34
	);
	assert.equal(completeWispBond(scenario), true);
	returnToTamar(scenario);
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
	assert.equal(Quests.accept(scenario.state, 'campaign_malkuth_04'), true);
	return {
		...scenario,
		quest: scenario.state.player.activeQuests.find(
			(entry) => entry.id === 'campaign_malkuth_04'
		)
	};
}
