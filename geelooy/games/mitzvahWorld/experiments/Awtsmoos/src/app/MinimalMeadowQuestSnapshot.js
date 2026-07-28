// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestSnapshot.js
 * @description Builds one immutable-facing view of defeat, recovery, return, and optional excellence.
 * The Awtsmoos gathers hidden state into honest testimony; Awtsmoos.com lets every surface
 * receive the same ordered archetypes, current objective, remaining work, and completion receipt.
 */

import {
	MINIMAL_MEADOW_REQUIRED_ARCHETYPES,
	minimalMeadowQuestCurrentObjective
} from './MinimalMeadowQuestEncounterContract.js';

export function createMinimalMeadowQuestSnapshot(quest) {
	const currentObjective = minimalMeadowQuestCurrentObjective({
		definition: quest.definition,
		defeatedArchetypes: quest.defeatedArchetypes,
		lootedArchetypes: quest.lootedArchetypes,
		status: quest.status
	});
	return {
		completionReceipt: quest.completionReceipt,
		currentObjective,
		defeatedArchetypes: orderedValues(quest.defeatedArchetypes),
		defeatProgress: quest.defeatedArchetypes.size,
		definition: quest.definition,
		lootedArchetypes: orderedValues(quest.lootedArchetypes),
		lootProgress: quest.lootedArchetypes.size,
		optionalObjectives: quest.optionalObjectives.snapshot(
			quest.definition.optionalObjectives
		),
		phase: currentObjective.phase,
		progress: currentObjective.progress,
		remaining: Math.max(0, currentObjective.count - currentObjective.progress),
		status: quest.status
	};
}

function orderedValues(values) {
	return MINIMAL_MEADOW_REQUIRED_ARCHETYPES.filter(value => values.has(value));
}
