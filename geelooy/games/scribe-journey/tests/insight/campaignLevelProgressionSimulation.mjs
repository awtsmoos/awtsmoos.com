// B"H
// Boruch Hashem
// Blessed is He

import { createDefaultGameState } from '../../js/data/database.js';
import { campaignQuests } from '../../js/data/quests/campaign/index.js';
import * as Quests from '../../js/workers/quests.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const state = createDefaultGameState();
state.db.quests = campaignQuests;
state.player.level = 1;
state.player.xp = 0;

function activeQuest(questId) {
	return state.player.activeQuests.find(quest => quest.id === questId) || null;
}

function completeObjective(questId, objective) {
	Quests.emit(state, {
		type: objective.type,
		targetId: objective.targetId,
		quantity: objective.required,
		mapId: objective.mapIds?.[0],
		questId,
		objectiveId: objective.id
	});
}

function completeQuest(questId) {
	if (state.player.completedQuests.includes(questId)) return;
	const definition = campaignQuests[questId];
	assert(definition, `Missing quest ${questId}.`);
	for (const prerequisite of definition.prerequisites || []) {
		completeQuest(prerequisite);
	}
	assert(
		state.player.level >= definition.level,
		`${questId} requires level ${definition.level}, player is ${state.player.level}.`
	);
	assert(Quests.accept(state, questId), `Could not accept ${questId} at level ${state.player.level}.`);
	while (true) {
		const quest = activeQuest(questId);
		const objective = quest?.objectives.find(entry => !entry.completed);
		if (!objective) break;
		if (objective.type === 'complete_other_quest' && campaignQuests[objective.targetId]) {
			completeQuest(objective.targetId);
		} else {
			completeObjective(questId, objective);
		}
	}
	assert(Quests.getStatus(state, questId) === 'ready', `${questId} did not become ready.`);
	assert(Quests.finalize(state, questId), `${questId} could not turn in.`);
}

const mainQuestIds = Object.keys(campaignQuests).filter(questId =>
	questId.startsWith('campaign_') &&
	!questId.startsWith('campaign_postgame_')
);

for (const questId of mainQuestIds) completeQuest(questId);

assert(mainQuestIds.length === 80, `Expected 80 main quests, received ${mainQuestIds.length}.`);
assert(state.player.level >= 81, `Main campaign ended at level ${state.player.level}, below postgame gate 81.`);
assert(Quests.getStatus(state, 'campaign_postgame_01') === 'available', 'Postgame did not unlock after the ending.');

for (let sequence = 1; sequence <= 8; sequence += 1) {
	completeQuest(`campaign_postgame_${String(sequence).padStart(2, '0')}`);
}

assert(state.player.level >= 89, `Postgame ended at level ${state.player.level}.`);
assert(state.player.completedQuests.includes('campaign_keter_08'), 'The Great Erasure was not completed.');
assert(state.player.completedQuests.includes('campaign_postgame_08'), 'The Ragged Cantor chain was not completed.');

console.log(JSON.stringify({
	ok: true,
	mainQuests: mainQuestIds.length,
	finalLevel: state.player.level,
	remainingXp: state.player.xp,
	completed: state.player.completedQuests.length
}, null, 2));
