//B"H
//Boruch Hashem
//Blessed is He

/**
 * Rewards turn measured clears and covenants into durable world growth. The Awtsmoos
 * renews gift, material, reputation, and sky together; Awtsmoos.com grants every
 * first-clear reward once while repeated roads may still progress active quests.
 */

import { expeditionLocation } from '../data/expedition/locationCatalog.js';
import { expeditionMaterialReward } from '../data/expedition/regionMaterialRewards.js';
import { expeditionLevelFromXp } from './ExpeditionDefaults.js';
import { grantExpeditionGear } from './ExpeditionInventory.js';
import { markExpeditionQuestClaimed, recordExpeditionQuestEvent } from './ExpeditionQuestLedger.js';
import { advanceExpeditionWeather } from './ExpeditionWeather.js';
import { clearExpeditionLocation } from './ExpeditionWorld.js';

export function recordExpeditionClear(profile, locationId, run = {}) {
	const location = expeditionLocation(locationId);
	if (!location) return { profile, rewards: emptyRewards(), completedQuests: [] };
	const clearResult = clearExpeditionLocation(profile, locationId);
	let next = clearResult.profile;
	const completedQuests = [];
	for (const event of clearEvents(locationId, run)) {
		const result = recordExpeditionQuestEvent(next, event);
		next = result.profile;
		completedQuests.push(...result.completed);
	}
	const rewards = clearResult.firstClear ? firstClearRewards(location) : emptyRewards();
	next = applyExpeditionReward(next, location.regionId, rewards);
	return {
		profile: next,
		rewards,
		completedQuests: [...new Set(completedQuests)],
		revealed: clearResult.revealed
	};
}

export function claimExpeditionQuestReward(profile, questId) {
	const claim = markExpeditionQuestClaimed(profile, questId);
	if (!claim.changed) return { claimed: false, profile, rewards: emptyRewards() };
	return {
		claimed: true,
		rewards: claim.quest.rewards,
		profile: applyExpeditionReward(claim.profile, claim.quest.regionId, claim.quest.rewards)
	};
}

export function applyExpeditionReward(profile, regionId, rewards) {
	const xp = profile.xp + Number(rewards.xp || 0);
	let next = grantExpeditionGear(
		{
			...profile,
			xp,
			level: expeditionLevelFromXp(xp),
			perutas: profile.perutas + Number(rewards.perutas || 0),
			reputation: {
				...profile.reputation,
				[regionId]: Math.max(
					0,
					Number(profile.reputation[regionId] || 0) + Number(rewards.reputation || 0)
				)
			},
			materials: mergeMaterials(profile.materials, rewards.materials)
		},
		rewards.gearIds || []
	);
	if (rewards.weatherSteps) next = advanceExpeditionWeather(next, rewards.weatherSteps);
	return next;
}

function clearEvents(locationId, run) {
	const defeated = Math.max(0, Number(run.enemiesTotal || 0) - Number(run.enemiesLeft || 0));
	return [
		{ type: 'defeat', locationId, count: defeated },
		{ type: 'collect-peruta', locationId, count: Number(run.perutas || 0) },
		{
			type: 'checkpoint',
			locationId,
			count: Math.max(0, Number(run.checkpointIndex ?? -1) + 1)
		},
		{ type: 'clear-location', locationId, count: 1 }
	].filter(event => event.count > 0);
}

function firstClearRewards(location) {
	return {
		xp: 70 + location.gate * 8,
		perutas: 6 + Math.ceil(location.gate / 3),
		reputation: 2 + Math.floor(location.gate / 15),
		gearIds: [],
		materials: expeditionMaterialReward(location),
		weatherSteps: 1
	};
}

function emptyRewards() {
	return { xp: 0, perutas: 0, reputation: 0, gearIds: [], materials: {}, weatherSteps: 0 };
}

function mergeMaterials(current = {}, granted = {}) {
	const next = { ...current };
	for (const [id, quantity] of Object.entries(granted)) {
		next[id] = Number(next[id] || 0) + Number(quantity || 0);
	}
	return next;
}
