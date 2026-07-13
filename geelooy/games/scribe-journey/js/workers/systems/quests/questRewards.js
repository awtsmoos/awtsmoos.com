// B"H
// Boruch Hashem
// Blessed is He

import { ensureQuestState } from './questState.js';

function addMoney(player, reward) {
	const money = typeof reward === 'number' ? { perutah: reward } : reward;
	for (const [unit, amount] of Object.entries(money || {})) {
		player.money[unit] = (player.money[unit] || 0) + Number(amount || 0);
	}
}

function addItems(state, rewards = []) {
	const events = [];
	for (const reward of rewards || []) {
		const itemId = typeof reward === 'string' ? reward : reward.itemId;
		const quantity = typeof reward === 'string'
			? 1
			: Math.max(1, Number(reward.quantity) || 1);
		const definition = state.db.items[itemId];
		if (!definition) continue;
		for (let index = 0; index < quantity; index += 1) {
			state.player.inventory.push({ ...definition });
		}
		events.push({ type: 'collect_item', targetId: itemId, quantity });
	}
	return events;
}

function addReputation(player, rewards = []) {
	const entries = Array.isArray(rewards)
		? rewards
		: Object.entries(rewards || {}).map(([factionId, amount]) => ({ factionId, amount }));
	for (const entry of entries) {
		player.reputation[entry.factionId] =
			(player.reputation[entry.factionId] || 0) + Number(entry.amount || 0);
	}
}

function applyMapChanges(player, changes = []) {
	for (const change of changes || []) {
		player.mapChanges[change.mapId] ||= {};
		player.mapChanges[change.mapId][change.changeId] = true;
		player.worldChanges[change.changeId] = true;
	}
}

function addPlayerExperience(player, amount) {
	player.xp = (player.xp || 0) + Number(amount || 0);
	while (player.xp >= player.level * 100) {
		player.xp -= player.level * 100;
		player.level += 1;
	}
}

function addLeadMusagExperience(player, amount) {
	if (!amount || !player.team[0]) return;
	player.team[0].experience =
		(player.team[0].experience || 0) + Number(amount);
}

/** Grants each authored reward exactly once and advances player-level gates. */
export function grantQuestRewards(state, quest) {
	const player = ensureQuestState(state.player);
	if (player.rewardedQuests.includes(quest.id)) {
		return { granted: false, itemEvents: [] };
	}
	const rewards = quest.rewards || {};
	addMoney(player, rewards.money);
	const itemEvents = addItems(state, rewards.items);
	addPlayerExperience(player, rewards.playerXp);
	addLeadMusagExperience(player, rewards.xp);
	addReputation(player, rewards.reputation);
	applyMapChanges(player, quest.mapChanges || rewards.mapChanges);
	for (const recipeId of rewards.recipes || []) {
		if (!player.unlockedRecipes.includes(recipeId)) {
			player.unlockedRecipes.push(recipeId);
		}
	}
	Object.assign(player.flags, rewards.flags || {});
	player.rewardedQuests.push(quest.id);
	return { granted: true, itemEvents };
}
