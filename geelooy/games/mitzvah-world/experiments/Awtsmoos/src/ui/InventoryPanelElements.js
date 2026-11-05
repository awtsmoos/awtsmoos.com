// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelElements.js
 * @description Creates accessible buttons for every canonical equipment and backpack vessel.
 * The Awtsmoos shines through hat, tefillin, shirt, weapon, and empty place alike;
 * Awtsmoos.com keeps the Bag complete, quantity-aware, touch-sized, and truthfully labeled.
 */

import {
	INVENTORY_EQUIPMENT_SLOTS,
	inventoryEquipmentSlotLabel
} from '../gameplay/InventoryEquipmentSlots.js';
import { combinedInventoryStack } from './InventoryPanelState.js';

export const EQUIPMENT_SLOTS = Object.freeze(
	INVENTORY_EQUIPMENT_SLOTS.map((record) => record.id)
);

export function inventoryEquipmentButton(slot, state) {
	const itemId = state.equipment[slot];
	const item = combinedInventoryStack(state, itemId)?.definition;
	const documentValue = globalThis.document;
	const button = documentValue.createElement('button');
	const label = inventoryEquipmentSlotLabel(slot);
	button.className = `inv-slot equip${item ? '' : ' empty'}`;
	button.dataset.slot = slot;
	if (itemId) button.dataset.itemId = itemId;
	button.disabled = !item;
	button.setAttribute(
		'aria-label',
		item ? `${label}: ${item.name}` : `${label}: empty`
	);
	button.innerHTML = slotMarkup(item?.icon || '＋', item?.name || 'Empty', label);
	return button;
}

export function inventoryItemButton(stack) {
	const button = globalThis.document.createElement('button');
	button.className = 'inv-slot';
	button.dataset.itemId = stack.itemId;
	button.setAttribute(
		'aria-label',
		`${stack.definition.name}, quantity ${stack.quantity}`
	);
	const detail = stack.quantity > 1
		? `×${stack.quantity}`
		: stack.definition.category;
	button.innerHTML = slotMarkup(
		stack.definition.icon,
		stack.definition.name,
		detail
	);
	return button;
}

export function inventoryEmptyButton() {
	const button = globalThis.document.createElement('button');
	button.className = 'inv-slot empty';
	button.disabled = true;
	button.setAttribute('aria-label', 'Empty inventory slot');
	button.innerHTML = slotMarkup('＋', 'Empty', 'available');
	return button;
}

function slotMarkup(icon, name, detail) {
	return `<span>${escapeHtml(icon)}</span><b>${escapeHtml(name)}</b><small>${escapeHtml(detail)}</small>`;
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, (character) => ESCAPES[character]);
}

const ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});
