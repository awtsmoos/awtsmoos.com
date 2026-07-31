// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceReward.js
 * @description Grants and equips a cataloged Kavanah tradeoff through one exact-once claim.
 * The Awtsmoos joins wider timing with slower preparation in one honest gift;
 * Awtsmoos.com composes earned mercy with user accessibility instead of erasing either voice.
 */

import {
	MEASURED_INTENT_REWARD_ID
} from '../gameplay/InventoryRewardCatalog.js';
import {
	effectiveMinimalMeadowTimingMultiplier
} from './MinimalMeadowAccessibilitySettings.js';

export const KAVANAH_FOCUS_ID = MEASURED_INTENT_REWARD_ID;
export const KAVANAH_FOCUS_CLAIM = 'vertical-slice:kedem-warden:first-clear';

export class MinimalMeadowVerticalSliceReward {
	constructor(runtime, saved = {}) {
		this.runtime = runtime;
		this.claimed = Boolean(saved.claimed)
			|| Boolean(runtime.inventory?.owns?.(KAVANAH_FOCUS_ID));
		this.equipped = Boolean(saved.equipped);
	}

	grant() {
		if (this.claimed || this.runtime.inventory?.owns?.(KAVANAH_FOCUS_ID)) {
			this.claimed = true;
			return this.receipt(false, 'already-claimed');
		}
		this.runtime.inventory?.add?.(KAVANAH_FOCUS_ID, 1);
		this.claimed = true;
		const receipt = this.receipt(true, 'granted');
		this.runtime.bus.emit('reward:granted', receipt);
		return receipt;
	}

	equip() {
		if (!this.claimed || !this.runtime.inventory?.owns?.(KAVANAH_FOCUS_ID)) {
			return this.receipt(false, 'not-owned');
		}
		this.runtime.inventory.equip(KAVANAH_FOCUS_ID);
		this.equipped = true;
		this.apply();
		const receipt = this.receipt(true, 'equipped');
		this.runtime.bus.emit('reward:equipped', receipt);
		return receipt;
	}

	unequip() {
		const accessory = this.runtime.inventory?.snapshot?.().equipment?.accessory;
		if (accessory === KAVANAH_FOCUS_ID) {
			this.runtime.inventory.unequip('accessory');
		}
		this.equipped = false;
		this.apply();
		const receipt = this.receipt(true, 'unequipped');
		this.runtime.bus.emit('reward:equipped', receipt);
		return receipt;
	}

	syncInventory(snapshot = {}) {
		this.claimed = this.claimed
			|| Boolean(snapshot.items?.[KAVANAH_FOCUS_ID]);
		this.equipped = snapshot.equipment?.accessory === KAVANAH_FOCUS_ID;
		this.apply();
		return this.snapshot();
	}

	apply() {
		this.runtime.accessibility ||= {};
		const rewardMultiplier = this.equipped ? 1.22 : 1;
		const userMultiplier = Number(
			this.runtime.accessibility.userTimingWindowMultiplier || 1
		);
		this.runtime.accessibility.rewardTimingWindowMultiplier = rewardMultiplier;
		this.runtime.accessibility.timingWindowMultiplier = effectiveMinimalMeadowTimingMultiplier(
			userMultiplier,
			rewardMultiplier
		);
		this.runtime.playerStats.kavanahMovementMultiplier = this.equipped
			? 0.72
			: 1;
	}

	snapshot() {
		return Object.freeze({
			claimed: this.claimed,
			equipped: this.equipped,
			id: KAVANAH_FOCUS_ID,
			movementDuringPreparationMultiplier: this.equipped ? 0.72 : 1,
			timingWindowMultiplier: this.equipped ? 1.22 : 1
		});
	}

	receipt(accepted, reason) {
		return Object.freeze({
			accepted,
			claimId: KAVANAH_FOCUS_CLAIM,
			reason,
			reward: this.snapshot()
		});
	}
}
