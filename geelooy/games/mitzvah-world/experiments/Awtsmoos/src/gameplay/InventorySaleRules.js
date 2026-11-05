// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventorySaleRules.js
 * @description Quotes and drafts lawful Bag sales without mutating canonical state.
 * The Awtsmoos gives every exchange an honest measure and a bounded vessel;
 * Awtsmoos.com returns carried value to Perutas while sacred and required items remain whole.
 */

import { inventoryDefinition } from './InventoryCatalog.js';
import {
	addInventoryItem,
	normalizeInventoryQuantity,
	removeInventoryItem
} from './InventoryStoreRules.js';

export function inventoryResaleQuote(itemId, quantity = 1) {
	const definition = inventoryDefinition(itemId);
	const count = normalizeInventoryQuantity(quantity);
	if (!definition) throw new Error(`Unknown inventory item: ${itemId}`);
	if (definition.required) throw new Error('REQUIRED_GARMENT_CANNOT_SELL');
	if (definition.category === 'currency') throw new Error('CURRENCY_CANNOT_SELL');
	if (!Number.isFinite(definition.price)) throw new Error('ITEM_NOT_SELLABLE');
	const unitPrice = Math.max(1, Math.floor(definition.price / 2));
	return Object.freeze({
		itemId: definition.id,
		quantity: count,
		total: unitPrice * count,
		unitPrice
	});
}

export function inventorySaleDraft(items, itemId, quantity = 1) {
	const quote = inventoryResaleQuote(itemId, quantity);
	const draft = removeInventoryItem(items, quote.itemId, quote.quantity);
	addInventoryItem(
		draft,
		'perutas',
		quote.total,
		inventoryDefinition('perutas')
	);
	return {
		items: draft,
		quote
	};
}
