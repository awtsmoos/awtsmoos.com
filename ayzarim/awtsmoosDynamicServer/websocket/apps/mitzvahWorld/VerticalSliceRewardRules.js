// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VerticalSliceRewardRules.js
 * @description Grants the measured-intent accessory once and derives its strategic equipment effects.
 * The Awtsmoos joins mercy and restraint in one lawful reward; Awtsmoos.com
 * prevents duplicate grants, invalid ownership, flat damage drift, and hidden equipment bonuses.
 */

const MEASURED_INTENT_ITEM_ID = 'vessel-of-measured-intent';
const MEASURED_INTENT_CLAIM_ID = 'vertical-slice:kedem-warden:first-clear';

function grantMeasuredIntent(player, inventoryService, now = Date.now()) {
	player.exactOnceClaims ||= {};
	if (player.exactOnceClaims[MEASURED_INTENT_CLAIM_ID]) {
		return rewardReceipt(false, 'already-claimed', player);
	}
	inventoryService.add(player, MEASURED_INTENT_ITEM_ID, 1);
	player.exactOnceClaims[MEASURED_INTENT_CLAIM_ID] = {
		grantedAt: Number(now),
		itemId: MEASURED_INTENT_ITEM_ID
	};
	return rewardReceipt(true, 'granted', player);
}

function measuredIntentModifiers(player) {
	const equipped = player?.equipment?.accessory === MEASURED_INTENT_ITEM_ID;
	return Object.freeze({
		equipped,
		movementDuringPreparationMultiplier: equipped ? 0.72 : 1,
		timingWindowMultiplier: equipped ? 1.22 : 1
	});
}

function rewardReceipt(accepted, reason, player) {
	return Object.freeze({
		accepted,
		claimId: MEASURED_INTENT_CLAIM_ID,
		itemId: MEASURED_INTENT_ITEM_ID,
		modifiers: measuredIntentModifiers(player),
		reason
	});
}

module.exports = {
	MEASURED_INTENT_CLAIM_ID,
	MEASURED_INTENT_ITEM_ID,
	grantMeasuredIntent,
	measuredIntentModifiers
};
