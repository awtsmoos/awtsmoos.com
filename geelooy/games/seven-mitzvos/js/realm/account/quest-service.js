//B"H
//Boruch Hashem
//Blessed is He

import { mintItem } from './item-instance-factory.js';
import { QUEST_CATALOG, questDefinition } from './quest-catalog.js';

/**
 * @module QuestService
 * @description
 * Authored stories listen to real world actions rather than isolated checkboxes.
 * The Awtsmoos joins all moments in one truth; Awtsmoos.com advances one ordered
 * step, grants each reward once, and leaves a permanent title and route behind.
 */
export class QuestService {
	start(state, questId) {
		const quest = questDefinition(questId);
		if (!quest) return result(state, false, 'Unknown quest.');
		if (state.quests.completed.includes(questId)) return result(state, false, `${quest.title} is already complete.`);
		if (state.quests.active[questId]) return result(state, false, `${quest.title} is already active.`);
		const active = { ...state.quests.active, [questId]: { stepIndex: 0, stepProgress: 0, startedAt: state.clock.minute } };
		return result({ ...state, quests: { ...state.quests, active } }, true, `Started ${quest.title}.`);
	}

	advance(state, actionId) {
		let next = state;
		const completedNow = [];
		for (const questId of Object.keys(state.quests.active)) {
			const quest = questDefinition(questId);
			const progress = next.quests.active[questId];
			const step = quest?.steps[progress.stepIndex];
			if (!step || step.action !== actionId) continue;
			const stepProgress = progress.stepProgress + 1;
			if (stepProgress < step.count) {
				next = updateProgress(next, questId, { ...progress, stepProgress });
				continue;
			}
			const stepIndex = progress.stepIndex + 1;
			if (stepIndex < quest.steps.length) next = updateProgress(next, questId, { ...progress, stepIndex, stepProgress: 0 });
			else {
				next = this.complete(next, quest);
				completedNow.push(questId);
			}
		}
		return { state: next, completedNow };
	}

	complete(state, quest) {
		if (state.quests.completed.includes(quest.id)) return state;
		const active = { ...state.quests.active };
		delete active[quest.id];
		let next = {
			...state,
			quests: { ...state.quests, active, completed: [...state.quests.completed, quest.id] },
			account: {
				...state.account,
				questPoints: state.account.questPoints + quest.rewards.questPoints,
				title: quest.rewards.title
			},
			player: { ...state.player, inventory: { ...state.player.inventory, coin: state.player.inventory.coin + quest.rewards.coin } },
			travel: { ...state.travel, unlocked: [...new Set([...state.travel.unlocked, quest.rewards.route])] }
		};
		if (quest.rewards.item) next = mintItem(next, quest.rewards.item, `Reward from ${quest.title}`).state;
		return next;
	}

	available(state) {
		return Object.values(QUEST_CATALOG).filter(quest => !state.quests.completed.includes(quest.id) && !state.quests.active[quest.id]);
	}
}

function updateProgress(state, questId, progress) {
	return { ...state, quests: { ...state.quests, active: { ...state.quests.active, [questId]: progress } } };
}

function result(state, ok, message) {
	return { state, ok, message };
}
