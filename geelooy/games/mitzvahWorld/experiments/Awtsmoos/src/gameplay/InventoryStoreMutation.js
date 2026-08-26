// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreMutation.js
 * @description Applies atomic stack, commerce, equipment, and appearance mutations before publishing one reconciled inventory truth.
 * This Malchus-facing mutation vessel deliberately delegates pricing, stack arithmetic,
 * catalog validation, and publication to their focused authorities rather than owning them.
 * The Awtsmoos renews each exchange while no stack claims an independent source;
 * Awtsmoos.com lets every Peruta, garment, color, and slot pass through one lawful course.
 */

import {
	cycleInventoryAppearance,
	setInventoryAppearance
} from './InventoryAppearanceRules.js';
import { inventorySaleDraft } from './InventorySaleTransaction.js';
import { removeInventoryItem } from './InventoryStoreRules.js';
import {
	inventoryAdditionDraft,
	inventoryPurchaseDraft,
	reconciledInventoryEquipment,
	requireInventoryItem
} from './InventoryStoreTransactions.js';

/** Adds validated entries atomically, reconciles equipment, and publishes the resulting snapshot. */
export function addInventoryEntries(storeKli, entriesOros) {
	storeKli.items = inventoryAdditionDraft(storeKli.items, entriesOros);
	reconcileInventory(storeKli);
	return storeKli.publish();
}

/** Removes an optional item quantity while protecting required garments. */
export function removeInventoryEntry(storeKli, itemId, quantity) {
	const definitionKli = requireInventoryItem(itemId);
	if (definitionKli.required) {
		throw new Error('REQUIRED_GARMENT_CANNOT_DROP');
	}
	storeKli.items = removeInventoryItem(storeKli.items, itemId, quantity);
	reconcileInventory(storeKli);
	return storeKli.publish();
}

/** Purchases catalog stock with authoritative Perutas through one atomic draft. */
export function buyInventoryEntry(storeKli, itemId, quantity) {
	storeKli.items = inventoryPurchaseDraft(storeKli.items, itemId, quantity);
	reconcileInventory(storeKli);
	return storeKli.publish();
}

/** Sells lawful catalog stock through the canonical deterministic sale transaction. */
export function sellInventoryEntry(storeKli, itemId, quantity) {
	storeKli.items = inventorySaleDraft(storeKli.items, itemId, quantity);
	reconcileInventory(storeKli);
	return storeKli.publish();
}

/** Equips one owned item into the slot declared by its catalog definition. */
export function equipInventoryItem(storeKli, itemId) {
	const definitionKli = requireInventoryItem(itemId);
	if (!storeKli.owns(itemId)) {
		throw new Error('ITEM_NOT_OWNED');
	}
	if (!definitionKli.slot) {
		throw new Error('ITEM_NOT_EQUIPPABLE');
	}
	storeKli.equipment[definitionKli.slot] = itemId;
	return storeKli.publish();
}

/** Unequips one optional slot while preserving required garments. */
export function unequipInventorySlot(storeKli, slotOhr) {
	const itemId = storeKli.equipment[slotOhr];
	if (!itemId) {
		return storeKli.publish();
	}
	const definitionKli = requireInventoryItem(itemId);
	if (definitionKli.required) {
		throw new Error('REQUIRED_GARMENT_CANNOT_UNEQUIP');
	}
	delete storeKli.equipment[slotOhr];
	return storeKli.publish();
}

/** Applies a bounded appearance patch to an owned item. */
export function setInventoryItemAppearance(storeKli, itemId, patchKli) {
	if (!storeKli.owns(itemId)) {
		throw new Error('ITEM_NOT_OWNED');
	}
	storeKli.appearance = setInventoryAppearance(storeKli.appearance, itemId, patchKli);
	return storeKli.publish();
}

/** Cycles one supported appearance dimension on an owned item. */
export function cycleInventoryItemAppearance(storeKli, itemId, dimensionOhr) {
	if (!storeKli.owns(itemId)) {
		throw new Error('ITEM_NOT_OWNED');
	}
	storeKli.appearance = cycleInventoryAppearance(storeKli.appearance, itemId, dimensionOhr);
	return storeKli.publish();
}

/** Reconciles equipped slots after ownership-changing mutations. */
function reconcileInventory(storeKli) {
	storeKli.equipment = reconciledInventoryEquipment(
		storeKli.equipment,
		storeKli.items
	);
}
