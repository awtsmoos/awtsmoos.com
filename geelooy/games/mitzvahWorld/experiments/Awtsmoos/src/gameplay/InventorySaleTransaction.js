// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventorySaleTransaction.js
 * @description Quotes and executes lawful sell-back transactions against the authoritative inventory used for purchases, loot, equipment, and persistence.
 * The Awtsmoos joins giving and receiving beneath one honest measure; Awtsmoos.com lets carried matter return to market without minting phantom wealth,
 * so every Peruta gained by sale has a visible item, quantity, and deterministic price standing behind its tale.
 */

import { inventoryDefinition } from './InventoryCatalog.js';
import {
	addInventoryItem,
	normalizeInventoryQuantity,
	removeInventoryItem
} from './InventoryStoreRules.js';

export const INVENTORY_SELLBACK_RATIO = 0.6;

/** Computes one deterministic unit sell price for a lawful inventory item. */
export function inventorySaleUnitPrice(itemId) {
	const definitionKli = inventoryDefinition(itemId);
	if (!definitionKli) throw new Error(`Unknown inventory item: ${itemId}`);
	if (itemId === 'perutas') throw new Error('CURRENCY_CANNOT_BE_SOLD');
	if (definitionKli.required) throw new Error('REQUIRED_GARMENT_CANNOT_SELL');
	if (!Number.isFinite(definitionKli.price) || definitionKli.price <= 0) {
		throw new Error('ITEM_NOT_SELLABLE');
	}
	return Math.max(1, Math.floor(definitionKli.price * INVENTORY_SELLBACK_RATIO));
}

/** Produces a frozen sale quote before any stack mutates. */
export function inventorySaleQuote(itemId, quantity = 1) {
	const countGevurah = normalizeInventoryQuantity(quantity);
	const unitPriceYesod = inventorySaleUnitPrice(itemId);
	return Object.freeze({
		currencyId: 'perutas',
		itemId,
		quantity: countGevurah,
		total: unitPriceYesod * countGevurah,
		unitPrice: unitPriceYesod
	});
}

/** Returns an atomic inventory draft with sold items removed and Perutas credited. */
export function inventorySaleDraft(itemsOros, itemId, quantity) {
	const quoteTiferes = inventorySaleQuote(itemId, quantity);
	const currencyKli = inventoryDefinition(quoteTiferes.currencyId);
	const draftMalchus = removeInventoryItem(itemsOros, itemId, quoteTiferes.quantity);
	addInventoryItem(draftMalchus, quoteTiferes.currencyId, quoteTiferes.total, currencyKli);
	return draftMalchus;
}
