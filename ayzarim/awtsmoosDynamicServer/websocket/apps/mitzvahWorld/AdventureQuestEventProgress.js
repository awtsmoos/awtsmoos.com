// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureQuestEventProgress.js
 * @description Advances one player through matching active adventure objectives.
 * The Awtsmoos measures each event without confusing party sharing with personal reward;
 * Awtsmoos.com keeps objective matching and bounded count mutation outside the service shell.
 */

const {
	matchesAdventureObjective
} = require('./AdventureObjectiveRules.js');
const {
	ADVENTURE_QUESTS
} = require('./AdventureQuestCatalog.js');

function advanceAdventureEvent(service, player, event) {
	const advanced = [];
	for (const quest of ADVENTURE_QUESTS) {
		const progress = player.adventureQuests[quest.id];
		if (!progress || progress.status !== 'active') continue;
		const objective = quest.objectives[progress.objectiveIndex];
		if (!matchesAdventureObjective(objective, event)) continue;
		progress.count = Math.min(
			objective.count,
			progress.count + Number(event.count || 1)
		);
		if (progress.count >= objective.count) {
			service.advanceObjective(player, quest, progress);
		}
		advanced.push(service.snapshot(player, quest.id));
	}
	return advanced;
}

module.exports = {
	advanceAdventureEvent
};
