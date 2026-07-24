// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelElements.js
 * @description Creates accessible equipment, backpack, and empty-slot button vessels.
 * The Awtsmoos shines through filled and empty places alike; Awtsmoos.com keeps every finite
 * button labeled, quantity-aware, keyboard reachable, and disabled only when truly unavailable.
 */

import { combinedInventoryStack } from './InventoryPanelState.js';

export const EQUIPMENT_SLOTS = Object.freeze([
	'head',
	'coat',
	'hand',
	'offhand',
	'feet',
	'tool'
]);

export function inventoryEquipmentButton(slot, state) {
	const itemId = state.equipment[slot];
	const item = combinedInventoryStack(state, itemId)?.definition;
	const button = document.createElement('button');
	button.className = `inv-slot equip${item ? '' : ' empty'}`;
	button.dataset.slot = slot;
	if (itemId) button.dataset.itemId = itemId;
	button.disabled = !item;
	button.setAttribute('aria-label', item ? `${slot}: ${item.name}` : `${slot}: empty`);
	button.innerHTML = slotMarkup(item?.icon || '＋', item?.name || 'Empty', slot);
	return button;
}

export function inventoryItemButton(stack) {
	const button = document.createElement('button');
	button.className = 'inv-slot';
	button.dataset.itemId = stack.itemId;
	button.setAttribute('aria-label', `${stack.definition.name}, quantity ${stack.quantity}`);
	const detail = stack.quantity > 1 ? `×${stack.quantity}` : stack.definition.category;
	button.innerHTML = slotMarkup(stack.definition.icon, stack.definition.name, detail);
	return button;
}

export function inventoryEmptyButton() {
	const button = document.createElement('button');
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
	return String(value ?? '').replace(/[&<>"']/g, character => ESCAPES[character]);
}

const ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});
