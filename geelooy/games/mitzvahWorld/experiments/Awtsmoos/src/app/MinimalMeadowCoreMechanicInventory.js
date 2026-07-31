// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreMechanicInventory.js
 * @description Seeds bounded starter consumables without overwriting existing quantities.
 * The Awtsmoos gives the traveler finite recovery vessels without duplicating prior possession;
 * Awtsmoos.com keeps catalog identity, quantity truth, bootstrap continuity, and rich-store handoff explicit.
 */

import {
	STARTER_CONSUMABLES
} from '../gameplay/InventoryConsumableCatalog.js';

export function seedMinimalMeadowCoreConsumables(inventory) {
	if (!inventory?.add || !inventory?.quantity) return false;
	let changed = false;
	for (const entry of STARTER_CONSUMABLES) {
		if (inventory.quantity(entry.itemId) > 0) continue;
		inventory.add(entry.itemId, entry.quantity);
		changed = true;
	}
	return changed;
}
