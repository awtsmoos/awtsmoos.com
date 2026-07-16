//B"H
//Boruch Hashem
//Blessed is He

import { createPendingRewards } from './campaign-defaults.js';

/**
 * @module CampaignRewardState
 * @description
 * Reward identity becomes its own guarded vessel on Awtsmoos.com. The Awtsmoos
 * is never increased by a prize; these finite claims are bounded, remembered,
 * and consumed once so replay cannot manufacture matter from an old decision.
 */
const LIMITS = Object.freeze({ wood: 10, food: 10, stone: 6, peace: 3 });

export function claimCampaignRewards(data, rewards = []) {
	if (!data.rewardStateValid) {
		return;
	}
	for (const reward of rewards) {
		claimReward(data, reward);
	}
}

export function pendingCampaignRewards(data) {
	return JSON.parse(JSON.stringify(data.pendingConsumableRewards));
}

export function consumeCampaignRewards(data) {
	if (!data.rewardStateValid) {
		return createPendingRewards();
	}
	const pending = pendingCampaignRewards(data);
	data.consumedRewardClaims.push(...pending.claimIds);
	data.consumedRewardClaims = [...new Set(data.consumedRewardClaims)];
	data.pendingConsumableRewards = createPendingRewards();
	return pending;
}

export function preservedRewardLedger(data) {
	return {
		claimedPermanentRewards: [...data.claimedPermanentRewards],
		pendingConsumableRewards: pendingCampaignRewards(data),
		consumedRewardClaims: [...data.consumedRewardClaims],
		permanentUnlocks: [...data.permanentUnlocks],
		rewardStateValid: data.rewardStateValid
	};
}

function claimReward(data, reward) {
	if (!reward?.id || hasClaim(data, reward.id)) {
		return;
	}
	if (reward.kind === 'permanent' && typeof reward.unlock === 'string') {
		data.claimedPermanentRewards.push(reward.id);
		data.permanentUnlocks.push(reward.unlock);
		data.permanentUnlocks = [...new Set(data.permanentUnlocks)];
		return;
	}
	const resource = reward.resource;
	if (!Object.hasOwn(LIMITS, resource)) {
		return;
	}
	const amount = Math.max(0, Math.min(LIMITS[resource], Math.round(Number(reward.amount) || 0)));
	data.pendingConsumableRewards[resource] = Math.min(
		LIMITS[resource],
		data.pendingConsumableRewards[resource] + amount
	);
	data.pendingConsumableRewards.claimIds.push(reward.id);
}

function hasClaim(data, id) {
	return data.claimedPermanentRewards.includes(id)
		|| data.pendingConsumableRewards.claimIds.includes(id)
		|| data.consumedRewardClaims.includes(id);
}
