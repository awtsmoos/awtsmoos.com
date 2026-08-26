// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreMutation.js
<<<<<<< HEAD
 * @description Applies atomic stack, purchase, sale, equipment, and appearance mutations before publishing one reconciled inventory truth.
 * The Awtsmoos renews every exchange without losing the vessel that changed; Awtsmoos.com keeps purchase, sale, garment, color, and fabric under one reconciliation light,
 * so commerce can deepen while required clothing and equipped slots never drift into a contradictory night.
 */

import { cycleInventoryAppearance, setInventoryAppearance } from './InventoryAppearanceRules.js';
import { inventorySaleDraft } from './InventorySaleTransaction.js';
=======
 * @description Applies atomic stack, equipment, purchase, sale, and appearance mutations.
 * The Awtsmoos gives each carried vessel a lawful transition; Awtsmoos.com
 * reconciles ownership, required garments, prices, colors, and slots before publication.
 */

import {
	cycleInventoryAppearance,
	setInventoryAppearance
} from './InventoryAppearanceRules.js';
import { inventorySaleDraft } from './InventorySaleRules.js';
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
import { removeInventoryItem } from './InventoryStoreRules.js';
import {
	inventoryAdditionDraft,
	inventoryPurchaseDraft,
	reconciledInventoryEquipment,
	requireInventoryItem
} from './InventoryStoreTransactions.js';

/** Adds one or more validated stack entries and publishes the reconciled result. */
export function addInventoryEntries(storeKli, entriesOros) {
	storeKli.items = inventoryAdditionDraft(storeKli.items, entriesOros);
	reconcileInventory(storeKli);
	return storeKli.publish();
}

/** Removes a non-required item quantity and publishes the reconciled result. */
export function removeInventoryEntry(storeKli, itemId, quantity) {
	const definitionKli = requireInventoryItem(itemId);
	if (definitionKli.required) throw new Error('REQUIRED_GARMENT_CANNOT_DROP');
	storeKli.items = removeInventoryItem(storeKli.items, itemId, quantity);
	reconcileInventory(storeKli);
	return storeKli.publish();
}

/** Purchases catalog stock with Perutas through one atomic inventory draft. */
export function buyInventoryEntry(storeKli, itemId, quantity) {
	storeKli.items = inventoryPurchaseDraft(storeKli.items, itemId, quantity);
	reconcileInventory(storeKli);
	return storeKli.publish();
}

<<<<<<< HEAD
/** Sells lawful catalog stock back for deterministic Perutas through one atomic inventory draft. */
export function sellInventoryEntry(storeKli, itemId, quantity) {
	storeKli.items = inventorySaleDraft(storeKli.items, itemId, quantity);
	reconcileInventory(storeKli);
	return storeKli.publish();
=======
export function sellInventoryEntry(store, itemId, quantity) {
	const sale = inventorySaleDraft(store.items, itemId, quantity);
	store.items = sale.items;
	reconcile(store);
	return store.publish();
}

export function equipInventoryItem(store, itemId) {
	const definition = requireInventoryItem(itemId);
	if (!store.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	if (!definition.slot) throw new Error('ITEM_NOT_EQUIPPABLE');
	store.equipment[definition.slot] = itemId;
	return store.publish();
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
}

/** Equips one owned item into the slot declared by its catalog definition. */
export function equipInventoryItem(storeKli, itemId) {
	const definitionKli = requireInventoryItem(itemId);
	if (!storeKli.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	if (!definitionKli.slot) throw new Error('ITEM_NOT_EQUIPPABLE');
	storeKli.equipment[definitionKli.slot] = itemId;
	return storeKli.publish();
}

/** Unequips one optional slot while preserving required garments. */
export function unequipInventorySlot(storeKli, slotOhr) {
	const itemId = storeKli.equipment[slotOhr];
	if (!itemId) return storeKli.publish();
	const definitionKli = requireInventoryItem(itemId);
	if (definitionKli.required) throw new Error('REQUIRED_GARMENT_CANNOT_UNEQUIP');
	delete storeKli.equipment[slotOhr];
	return storeKli.publish();
}

/** Applies a bounded appearance patch to an owned item. */
export function setInventoryItemAppearance(storeKli, itemId, patchKli) {
	if (!storeKli.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	storeKli.appearance = setInventoryAppearance(storeKli.appearance, itemId, patchKli);
	return storeKli.publish();
}

/** Cycles one supported appearance dimension on an owned item. */
export function cycleInventoryItemAppearance(storeKli, itemId, dimensionOhr) {
	if (!storeKli.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	storeKli.appearance = cycleInventoryAppearance(storeKli.appearance, itemId, dimensionOhr);
	return storeKli.publish();
}

/** Reconciles equipment after any mutation that may change ownership. */
function reconcileInventory(storeKli) {
	storeKli.equipment = reconciledInventoryEquipment(storeKli.equipment, storeKli.items);
}
