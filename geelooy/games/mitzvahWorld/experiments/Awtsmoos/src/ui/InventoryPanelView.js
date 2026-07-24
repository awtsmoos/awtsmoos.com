// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelView.js
 * @description Renders aggregate Bag items, real equipment, detail guidance, and context actions.
 * The Awtsmoos appears through every finite icon without becoming the icon; Awtsmoos.com keeps
 * the visual Bag synchronized with authoritative quantities while focused modules form each vessel.
 */

import {
	EQUIPMENT_SLOTS,
	inventoryEmptyButton,
	inventoryEquipmentButton,
	inventoryItemButton
} from './InventoryPanelElements.js';
import {
	inventoryActionGuidance,
	inventoryActionLabel,
	inventoryActionsFor
} from './InventoryPanelGuidance.js';
import {
	aggregateInventoryStacks,
	combinedInventoryStack,
	inventorySummaryText
} from './InventoryPanelState.js';

export { combinedInventoryStack } from './InventoryPanelState.js';

export function inventoryPanelHtml(state) {
	return `<section class="Awtsmoos-inventory-panel" data-open="false" aria-hidden="true" aria-label="Bag">
		<header><b>🎒 B"H Bag</b><span>${inventorySummaryText(state)}</span><button data-close aria-label="Close Bag" style="min-width:44px;min-height:44px">×</button></header>
		<div class="inv-body"><aside><h3>Equipped</h3><div class="equip-grid" data-equipment></div></aside>
		<main><h3>Backpack</h3><div class="bag-grid" data-items></div><div class="item-card" data-item-card role="status">Select an item.</div></main></div>
		<div class="inv-context-menu" data-open="false" data-menu role="menu"></div></section>`;
}

export function renderInventoryItems(container, state) {
	const stacks = aggregateInventoryStacks(state);
	container.replaceChildren(...stacks.map(inventoryItemButton));
	for (let index = stacks.length; index < 24; index += 1) {
		container.appendChild(inventoryEmptyButton());
	}
}

export function renderEquipment(container, state) {
	container.replaceChildren(...EQUIPMENT_SLOTS.map(slot => inventoryEquipmentButton(slot, state)));
}

export function renderInventoryCard(container, stack, state, equipmentState = {}) {
	if (!stack?.definition) {
		container.textContent = 'Select an item. Empty slots are available for future loot.';
		return;
	}
	const item = stack.definition;
	container.innerHTML = `<h4>${escapeHtml(item.icon)} ${escapeHtml(item.name)}</h4>
		<p><b>${escapeHtml(item.category)}</b> · total quantity ${stack.quantity}</p>
		<p>${escapeHtml(item.description)}</p>
		<p>Damage ${item.stats.damage} · Defense ${item.stats.defense} · Focus ${item.stats.focus}</p>
		<p>${escapeHtml(inventoryActionGuidance(item, state, equipmentState))}</p>`;
}

export function renderInventoryMenu(menu, stack, state, equipmentState = {}) {
	menu.replaceChildren();
	if (!stack?.definition) return;
	const documentRef = menu.ownerDocument || document;
	const title = documentRef.createElement('h4');
	title.textContent = `${stack.definition.icon} ${stack.definition.name}`;
	const actions = documentRef.createElement('div');
	for (const action of inventoryActionsFor(stack.definition, state, equipmentState)) {
		const button = documentRef.createElement('button');
		button.dataset.action = action;
		button.setAttribute('role', 'menuitem');
		button.style.minWidth = '44px';
		button.style.minHeight = '44px';
		button.textContent = inventoryActionLabel(action);
		actions.appendChild(button);
	}
	menu.append(title, actions);
	menu.dataset.open = 'true';
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
