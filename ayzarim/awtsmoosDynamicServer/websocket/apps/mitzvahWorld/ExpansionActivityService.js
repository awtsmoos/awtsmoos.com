// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionActivityService.js
 * @description Resolves repeatable world work with idempotent cooldown receipts and mastery.
 * The Awtsmoos renews service without multiplying its reward; Awtsmoos.com treats network
 * retries as one completion while region, material, mastery, and experience remain truthful.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { expansionActivity } = require('./GameplayExpansionCatalog.js');
const { grantReward } = require('./Progression.js');
const { addMastery, addMaterial, ensureExpansionState } = require('./PlayerExpansionState.js');

class ExpansionActivityService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
	}

	perform(player, activityId) {
		const activity = expansionActivity(activityId);
		if (!activity) throw error('UNKNOWN_ACTIVITY', 'The requested activity is unknown.');
		const state = ensureExpansionState(player);
		if (state.region.id !== activity.regionId) {
			throw error('ACTIVITY_REGION_MISMATCH', 'This activity belongs to another region.');
		}
		const now = this.clock();
		const previous = state.activities[activityId];
		if (previous && now - previous.completedAt < activity.cooldownMs) {
			return { activity: previous, duplicate: true };
		}
		const count = Number(previous?.count || 0) + 1;
		const receipt = {
			completedAt: now,
			count,
			materialId: activity.materialId,
			quantity: activity.quantity
		};
		state.activities[activityId] = receipt;
		addMaterial(player, activity.materialId, activity.quantity);
		addMastery(player, activity.masteryId, activity.xp);
		grantReward(player.progression, {
			id: `activity:${activityId}:${count}`,
			xp: activity.xp
		}, rewardContext(player));
		return { activity: receipt, duplicate: false };
	}
}

function rewardContext(player) {
	return { shliach: player.shliach, wallet: player.wallet };
}

function error(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	ExpansionActivityService
};
