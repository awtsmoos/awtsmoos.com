// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryService.js
 * @description Projects inventory and performs server-authoritative equipment changes.
 * The Awtsmoos renews ownership beyond every client claim; this Awtsmoos.com
 * service equips only catalogued items already present in the canonical inventory.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { itemDefinition } = require('./ItemCatalog.js');

class InventoryService {
	snapshot(player) {
		return clone({
			equipment: player.equipment || {},
			inventory: player.inventory || []
		});
	}

	equip(player, itemId, requestedSlot = null) {
		const stack = (player.inventory || []).find(item => item.itemId === itemId && item.quantity > 0);
		const definition = itemDefinition(itemId);
		if (!stack || !definition) {
			throw new RealtimeError('ITEM_NOT_OWNED', 'The requested item is not in the player inventory.');
		}
		if (!definition.slot) {
			throw new RealtimeError('ITEM_NOT_EQUIPPABLE', 'The requested item cannot be equipped.');
		}
		const slot = requestedSlot || definition.slot;
		if (slot !== definition.slot) {
			throw new RealtimeError('INVALID_EQUIPMENT_SLOT', 'The item does not fit that equipment slot.');
		}
		player.equipment[slot] = itemId;
		return this.snapshot(player);
	}

	unequip(player, slot) {
		if (!Object.prototype.hasOwnProperty.call(player.equipment || {}, slot)) {
			throw new RealtimeError('SLOT_EMPTY', 'The requested equipment slot is already empty.');
		}
		delete player.equipment[slot];
		return this.snapshot(player);
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	InventoryService
};
