// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabAuthorityApi.js
	* @description Exposes server-shaped local economy, inventory, and equipment authority.
	* The Awtsmoos places commerce beneath law rather than trust in the view;
	* Awtsmoos.com validates quantity, balance, ownership, and equipped truth anew.
	*/

import { localTabVendorItemById } from './LocalTabAuthorityCatalog.js';

export function createLocalTabAuthorityApi(store) {
	const authority = new LocalTabAuthorityApi(store);
	return Object.freeze({
		economy: Object.freeze({
			balance: () => authority.balance(),
			buy: (itemId, quantity) => authority.buy(itemId, quantity),
			sell: (itemId, quantity) => authority.sell(itemId, quantity)
		}),
		equipment: (operation, itemId, slot) => authority.equipment(operation, itemId, slot),
		inventory: () => authority.inventory()
	});
}

export class LocalTabAuthorityApi {
	constructor(store) {
		this.store = store;
	}

	async balance() {
		const state = this.store.snapshot();
		return receipt('economy.balance', {
			currency: 'sparks',
			sparks: state.sparks
		});
	}

	async inventory() {
		return receipt('player.inventory', inventoryPayload(this.store.snapshot()));
	}

	async buy(itemId, quantity = 1) {
		const item = localTabVendorItemById(itemId);
		const count = commandQuantity(quantity);
		const state = this.store.update(draft => {
			const cost = item.buyPrice * count;
			if (draft.sparks < cost) {
				throw new Error('Not enough sparks for this purchase.');
			}
			draft.sparks -= cost;
			draft.inventory[item.id] = (draft.inventory[item.id] || 0) + count;
		});
		return receipt('vendor.bought', inventoryPayload(state));
	}

	async sell(itemId, quantity = 1) {
		const item = localTabVendorItemById(itemId);
		const count = commandQuantity(quantity);
		const state = this.store.update(draft => {
			const owned = draft.inventory[item.id] || 0;
			if (owned < count) {
				throw new Error('The local player does not own enough of this item.');
			}
			draft.inventory[item.id] = owned - count;
			if (draft.inventory[item.id] === 0) {
				delete draft.inventory[item.id];
			}
			if (draft.equipped === item.id && !draft.inventory[item.id]) {
				draft.equipped = null;
			}
			draft.sparks += item.sellPrice * count;
		});
		return receipt('vendor.sold', inventoryPayload(state));
	}

	async equipment(operation = 'snapshot', itemId = null) {
		if (operation === 'snapshot') {
			return receipt('player.equipment', inventoryPayload(this.store.snapshot()));
		}
		const state = this.store.update(draft => {
			if (operation === 'unequip') {
				draft.equipped = null;
				return;
			}
			if (operation !== 'equip' || !draft.inventory[itemId]) {
				throw new Error('Only an owned item may be equipped.');
			}
			draft.equipped = itemId;
		});
		return receipt('player.equipment', inventoryPayload(state));
	}
}

function inventoryPayload(state) {
	return {
		equipped: state.equipped,
		items: Object.entries(state.inventory).map(([itemId, quantity]) => ({ itemId, quantity })),
		sparks: state.sparks
	};
}

function commandQuantity(value) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 1 || number > 99) {
		throw new Error('Quantity must be an integer from 1 through 99.');
	}
	return number;
}

function receipt(type, payload) {
	return { payload, type };
}
