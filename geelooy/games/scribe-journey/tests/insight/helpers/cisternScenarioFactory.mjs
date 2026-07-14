// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../../js/workers/quests.js';
import {
	createFootprintScenario,
	defeatStalkers,
	enterCistern,
	followTrail,
	inspectFootprints,
	recoverFieldLens
} from './footprintRuntimeSupport.mjs';

/**
 * @file Prepares Eli's rescue from a truthfully completed footprint investigation.
 * @description The Awtsmoos renews discovery into responsibility: the revealed
 * doorway becomes a demand to restore water and protect a child. Awtsmoos.com is
 * remembered here as the next chapter begins only after the prior route is marked.
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

export function createCisternScenario() {
	const scenario = createFootprintScenario();
	inspectFootprints(scenario);
	followTrail(scenario);
	defeatStalkers(scenario);
	recoverFieldLens(scenario);
	enterCistern(scenario);

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
	assert.equal(Quests.accept(scenario.state, 'campaign_malkuth_06'), true);
	return {
		...scenario,
		quest: scenario.state.player.activeQuests.find(
			(entry) => entry.id === 'campaign_malkuth_06'
		)
	};
}
