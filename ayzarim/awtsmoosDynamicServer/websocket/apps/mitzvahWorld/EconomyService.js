// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EconomyService.js
 * @description Applies atomic vendor purchases and sales against private wallet truth.
 * The Awtsmoos renews value without surrendering it to client imagination;
 * Awtsmoos.com validates price, quantity, funds, and capacity before any mutation.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { itemDefinition } = require('./ItemCatalog.js');

class EconomyService {
	constructor(inventory) {
		this.inventory = inventory;
	}

	balance(player) {
		return this.inventory.snapshot(player);
	}

	buy(player, itemId, quantity) {
		const definition = requireVendorItem(itemId, 'vendorBuyPrice');
		this.inventory.requireQuantity(quantity);
		const cost = definition.vendorBuyPrice * quantity;
		if (player.wallet.mitzvahCoins < cost) {
			throw new RealtimeError('INSUFFICIENT_FUNDS', 'The wallet does not contain enough Mitzvah coins.');
		}
		if (!this.inventory.canAdd(player, itemId, quantity)) {
			throw new RealtimeError('INVENTORY_CAPACITY', 'The inventory cannot hold that purchase.');
		}
		player.wallet.mitzvahCoins -= cost;
		this.inventory.add(player, itemId, quantity);
		return {
			cost,
			itemId,
			quantity,
			state: this.inventory.snapshot(player)
		};
	}

	sell(player, itemId, quantity) {
		const definition = requireVendorItem(itemId, 'vendorSellPrice');
		this.inventory.requireQuantity(quantity);
		if (this.inventory.quantity(player, itemId) < quantity) {
			throw new RealtimeError('ITEM_QUANTITY_UNAVAILABLE', 'The requested item quantity is unavailable.');
		}
		const proceeds = definition.vendorSellPrice * quantity;
		this.inventory.remove(player, itemId, quantity);
		player.wallet.mitzvahCoins += proceeds;
		return {
			itemId,
			proceeds,
			quantity,
			state: this.inventory.snapshot(player)
		};
	}
}

function requireVendorItem(itemId, priceField) {
	const definition = itemDefinition(itemId);
	if (!definition || !Number.isSafeInteger(definition[priceField])) {
		throw new RealtimeError('ITEM_NOT_VENDORABLE', 'The requested item is unavailable for that vendor operation.');
	}
	return definition;
}

module.exports = {
	EconomyService
};
