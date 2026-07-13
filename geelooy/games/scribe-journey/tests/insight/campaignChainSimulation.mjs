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
state.player.level = 100;
state.player.money.perutah = 0;

const completing = new Set();
let emittedObjectives = 0;
let duplicateRewardChecks = 0;

function activeQuest(questId) {
	return state.player.activeQuests.find(quest => quest.id === questId) || null;
}

function emitObjective(questId, objective) {
	Quests.emit(state, {
		type: objective.type,
		targetId: objective.targetId,
		quantity: objective.required,
		mapId: objective.mapIds?.[0],
		questId,
		objectiveId: objective.id
	});
	emittedObjectives += 1;
}

function completeQuest(questId) {
	if (state.player.completedQuests.includes(questId)) return;
	assert(!completing.has(questId), `Recursive completion loop at ${questId}.`);
	const definition = campaignQuests[questId];
	assert(definition, `Missing campaign quest ${questId}.`);
	completing.add(questId);

	for (const prerequisite of definition.prerequisites || []) {
		completeQuest(prerequisite);
	}

	assert(Quests.accept(state, questId), `Could not accept reachable quest ${questId}.`);

	while (true) {
		const quest = activeQuest(questId);
		assert(quest, `Accepted quest ${questId} disappeared before turn-in.`);
		const objective = quest.objectives.find(entry => !entry.completed);
		if (!objective) break;

		if (objective.type === 'complete_other_quest' && campaignQuests[objective.targetId]) {
			completeQuest(objective.targetId);
			const refreshed = activeQuest(questId);
			assert(
				refreshed?.objectives.find(entry => entry.id === objective.id)?.completed,
				`${questId}/${objective.id} did not observe ${objective.targetId} completion.`
			);
			continue;
		}

		emitObjective(questId, objective);
		const refreshedObjective = activeQuest(questId)?.objectives.find(entry => entry.id === objective.id);
		assert(refreshedObjective?.completed, `${questId}/${objective.id} did not consume its event.`);
	}

	assert(Quests.getStatus(state, questId) === 'ready', `${questId} did not become ready.`);
	assert(Quests.finalize(state, questId), `${questId} did not turn in.`);
	const moneyAfter = state.player.money.perutah;
	assert(!Quests.finalize(state, questId), `${questId} allowed duplicate turn-in.`);
	assert(state.player.money.perutah === moneyAfter, `${questId} duplicated rewards.`);
	duplicateRewardChecks += 1;
	completing.delete(questId);
}

for (const questId of Object.keys(campaignQuests)) {
	completeQuest(questId);
}

const completed = state.player.completedQuests.filter(questId => campaignQuests[questId]);
const mainCompleted = completed.filter(questId =>
	questId.startsWith('campaign_') && !questId.startsWith('campaign_postgame_')
);
const regionalCompleted = completed.filter(questId => questId.startsWith('side_'));
const contractCompleted = completed.filter(questId => questId.startsWith('postgame_contract_'));
const postgameCompleted = completed.filter(questId => questId.startsWith('campaign_postgame_'));

assert(completed.length === 198, `Expected 198 completed authored quests, received ${completed.length}.`);
assert(mainCompleted.length === 80, `Expected 80 main completions, received ${mainCompleted.length}.`);
assert(regionalCompleted.length === 100, `Expected 100 regional completions, received ${regionalCompleted.length}.`);
assert(contractCompleted.length === 10, `Expected 10 contract completions, received ${contractCompleted.length}.`);
assert(postgameCompleted.length === 8, `Expected 8 Cantor completions, received ${postgameCompleted.length}.`);
assert(state.player.rewardedQuests.length === 198, 'Every authored quest must have one reward guard.');
assert(state.player.activeQuests.length === 0, 'No authored quest may remain active after simulation.');
assert(state.player.completedQuests.includes('side_binah_research_04'), 'Binah evidence quest must complete through the cross-quest objective.');

console.log(JSON.stringify({
	ok: true,
	completed: completed.length,
	mainCompleted: mainCompleted.length,
	regionalCompleted: regionalCompleted.length,
	contractCompleted: contractCompleted.length,
	postgameCompleted: postgameCompleted.length,
	emittedObjectives,
	duplicateRewardChecks,
	finalMoney: state.player.money.perutah,
	finalXp: state.player.xp
}, null, 2));
