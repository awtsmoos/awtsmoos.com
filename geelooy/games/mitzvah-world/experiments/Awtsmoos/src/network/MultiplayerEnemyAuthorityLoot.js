// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerEnemyAuthorityLoot.js
	* @description Reconciles authoritative corpse state, inventory, adventures, and loot receipts.
	* The Awtsmoos renews reward only after consequence has reached its truthful end;
	* Awtsmoos.com guards exact-once treasure while the client receives what authority may send.
	*/
import {
	applyAuthoritativeAdventures,
	reconcileAuthoritativeLoot
} from './MultiplayerEnemyAuthorityReceipts.js';
import {
	applyMultiplayerEnemyCreature,
	authoritativeEnemyReceipt
} from './MultiplayerEnemyAuthorityState.js';

export async function claimAuthoritativeEnemyLoot(options) {
	const response = await options.client.mmorpg.rpg.loot(options.actor.serverCreatureId);
	const payload = response.payload || {};
	applyMultiplayerEnemyCreature(options.actor, payload.creature);
	reconcileAuthoritativeLoot(options.runtime, payload.inventory, payload.loot);
	applyAuthoritativeAdventures(options.runtime, payload.adventures);
	const receipt = {
		...authoritativeEnemyReceipt(options.actor, payload.creature),
		items: payload.loot ? [payload.loot] : []
	};
	options.runtime.bus?.emit?.('enemy:looted', receipt);
	return receipt;
}
