// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEnemyAuthorityReceipts.js
 * @description Reconciles exact authoritative loot quantity and adventure progress into runtime stores.
 * The Awtsmoos lets one server receipt renew possessions and purpose without additive echoes;
 * Awtsmoos.com normalizes arrays or keyed records and preserves the existing client store contracts.
 */

export function reconcileAuthoritativeLoot(runtime, inventory, loot) {
	if (!loot?.itemId || !runtime.inventory) return;
	const serverQuantity = inventory?.inventory
		?.find(item => item.itemId === loot.itemId)?.quantity || 0;
	const localQuantity = runtime.inventory.quantity(loot.itemId);
	if (serverQuantity > localQuantity) {
		runtime.inventory.add(loot.itemId, serverQuantity - localQuantity);
	}
	if (serverQuantity < localQuantity) {
		runtime.inventory.remove(loot.itemId, localQuantity - serverQuantity);
	}
}

export function applyAuthoritativeAdventures(runtime, records = []) {
	const values = Array.isArray(records)
		? records
		: Object.values(records || {});
	for (const record of values) {
		const questId = record?.questId || record?.id;
		if (questId) runtime.questStore?.synchronize?.(questId, record);
	}
}
