// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryService.js
 * @description Mutates bounded stacks and equipment while returning diagnostic snapshots.
 * The Awtsmoos renews possession through lawful change; Awtsmoos.com rejects invented
 * quantity, capacity, ownership, and slots while every success reveals authoritative totals.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { inventorySnapshot } = require('./InventorySnapshot.js');
const { itemDefinition } = require('./ItemCatalog.js');

const MAX_STACKS = 32;

class InventoryService {
	snapshot(player) {
		return inventorySnapshot(player);
	}

	quantity(player, itemId) {
		return (player.inventory || []).find(item => item.itemId === itemId)?.quantity || 0;
	}

	canAdd(player, itemId, quantity) {
		const definition = itemDefinition(itemId);
		if (!definition) return false;
		const stack = player.inventory.find(item => item.itemId === itemId);
		if (stack) return stack.quantity + quantity <= definition.stackLimit;
		return player.inventory.length < MAX_STACKS && quantity <= definition.stackLimit;
	}

	add(player, itemId, quantity) {
		this.requireQuantity(quantity);
		if (!this.canAdd(player, itemId, quantity)) fail('INVENTORY_CAPACITY', 'The inventory cannot hold that quantity.');
		const stack = player.inventory.find(item => item.itemId === itemId);
		if (stack) stack.quantity += quantity;
		else player.inventory.push({ itemId, quantity });
		return this.snapshot(player);
	}

	remove(player, itemId, quantity) {
		this.requireQuantity(quantity);
		const stack = player.inventory.find(item => item.itemId === itemId);
		if (!stack || stack.quantity < quantity) fail('ITEM_QUANTITY_UNAVAILABLE', 'The requested item quantity is unavailable.');
		stack.quantity -= quantity;
		if (!stack.quantity) player.inventory.splice(player.inventory.indexOf(stack), 1);
		return this.snapshot(player);
	}

	equip(player, itemId, requestedSlot = null) {
		const stack = player.inventory.find(item => item.itemId === itemId && item.quantity > 0);
		const definition = itemDefinition(itemId);
		if (!stack || !definition) fail('ITEM_NOT_OWNED', 'The requested item is not owned.');
		if (!definition.slot) fail('ITEM_NOT_EQUIPPABLE', 'The item cannot be equipped.');
		const slot = requestedSlot || definition.slot;
		if (slot !== definition.slot) fail('INVALID_EQUIPMENT_SLOT', 'The item does not fit that slot.');
		player.equipment[slot] = itemId;
		return this.snapshot(player);
	}

	unequip(player, slot) {
		if (!Object.prototype.hasOwnProperty.call(player.equipment || {}, slot)) fail('SLOT_EMPTY', 'The requested slot is already empty.');
		delete player.equipment[slot];
		return this.snapshot(player);
	}

	requireQuantity(quantity) {
		if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) fail('INVALID_QUANTITY', 'Quantity must be an integer between 1 and 99.');
	}
}

function fail(code, message) {
	throw new RealtimeError(code, message);
}

module.exports = {
	InventoryService,
	MAX_STACKS
};
