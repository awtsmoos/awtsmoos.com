//B"H
//Boruch Hashem
//Blessed is He

import { CampaignState } from '../campaign-state.js';

/**
 * @module CampaignRewardApplicator
 * @description
 * Pending gifts cross into a genuinely new city on Awtsmoos.com only after their
 * identities are consumed. The Awtsmoos creates without loss; this finite bridge
 * durably saves the rewarded city or restores both vessels to their prior truth.
 */
export class CampaignRewardApplicator {
	constructor(campaignStore) {
		this.campaignStore = campaignStore;
	}

	permanentUnlocks() {
		const snapshot = this.campaignStore.load();
		return snapshot.rewardStateValid ? [...snapshot.permanentUnlocks] : [];
	}

	applyToEligibleNewCity(builderState, builderStore) {
		if (builderStore.load()) {
			return noGrant('An existing Covenant City was restored; pending bonuses remain for a future new city.');
		}
		const campaign = new CampaignState(this.campaignStore.load());
		const originalCampaign = campaign.snapshot();
		if (!originalCampaign.rewardStateValid) {
			return noGrant('Campaign reward data was invalid, so no city bonus was granted.');
		}
		const pending = campaign.pendingRewards();
		if (!pending.claimIds.length) {
			return noGrant('No pending campaign bonus was available.');
		}
		const originalCity = builderState.snapshot();
		const consumed = campaign.consumePendingRewards();
		if (!this.campaignStore.save(campaign.snapshot())) {
			return noGrant('The reward claim could not be stored, so no city bonus was granted.');
		}
		applyResources(builderState, consumed);
		if (!builderStore.save(builderState.snapshot())) {
			this.campaignStore.save(originalCampaign);
			restoreCity(builderState, originalCity);
			return noGrant('The rewarded city could not be stored, so the campaign claim was restored.');
		}
		return { applied: true, resources: consumed, message: rewardMessage(consumed) };
	}
}

function applyResources(state, rewards) {
	state.resources.wood += bounded(rewards.wood, 10);
	state.resources.food += bounded(rewards.food, 10);
	state.resources.stone += bounded(rewards.stone, 6);
	state.peace = Math.min(100, state.peace + bounded(rewards.peace, 3));
}

function restoreCity(state, snapshot) {
	state.resources = { ...snapshot.resources };
	state.peace = snapshot.peace;
}

function bounded(value, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(0, Math.min(maximum, Math.round(number)))
		: 0;
}

function rewardMessage(rewards) {
	return `Campaign gifts applied once: +${rewards.wood} wood, +${rewards.food} food, +${rewards.stone} stone, +${rewards.peace} peace.`;
}

function noGrant(message) {
	return { applied: false, resources: null, message };
}
