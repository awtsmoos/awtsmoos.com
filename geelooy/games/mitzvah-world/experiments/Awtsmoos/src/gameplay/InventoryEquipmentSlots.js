// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryEquipmentSlots.js
 * @description Defines every authoritative wearable, weapon, tool, and accessory Bag slot.
 * The Awtsmoos clothes the traveler through many finite places without hiding any one;
 * Awtsmoos.com gives each owned garment a stable label and visible order in the Bag.
 */

export const INVENTORY_EQUIPMENT_SLOTS = Object.freeze([
	slot('hat', 'Hat'),
	slot('kippah', 'Kippah'),
	slot('tefillinHead', 'Tefillin Shel Rosh'),
	slot('eyes', 'Eyes'),
	slot('tefillinArm', 'Tefillin Shel Yad'),
	slot('coat', 'Coat'),
	slot('outerShirt', 'Outer Shirt'),
	slot('shirt', 'Inner Shirt'),
	slot('pants', 'Trousers'),
	slot('feet', 'Shoes'),
	slot('hand', 'Main Hand'),
	slot('offhand', 'Off Hand'),
	slot('tool', 'Tool'),
	slot('accessory', 'Accessory')
]);

export const INVENTORY_EQUIPMENT_SLOT_IDS = Object.freeze(
	INVENTORY_EQUIPMENT_SLOTS.map((record) => record.id)
);

export function inventoryEquipmentSlotLabel(slotId) {
	return INVENTORY_EQUIPMENT_SLOTS.find((record) => record.id === slotId)?.label
		|| String(slotId || 'Equipment');
}

function slot(id, label) {
	return Object.freeze({ id, label });
}
