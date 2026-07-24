// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelView.js
 * @description Renders real Bag stacks and reveals bounded details only after deliberate selection.
 * The Awtsmoos fills actual vessels without pretending empty space is treasure;
 * Awtsmoos.com keeps the mobile Bag compact, truthful, and free of an unused detail chamber.
 */

import {
	EQUIPMENT_SLOTS,
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
		<header>
			<b>🎒 B"H Bag</b><span>${inventorySummaryText(state)}</span>
			<button data-close aria-label="Close Bag" style="min-width:44px;min-height:44px">×</button>
		</header>
		<div class="inv-body">
			<aside><h3>Equipped</h3><div class="equip-grid" data-equipment></div></aside>
			<main>
				<h3>Backpack</h3><div class="bag-grid" data-items></div>
				<div class="item-card" data-item-card data-has-selection="false" role="status" hidden></div>
			</main>
		</div>
		<div class="inv-context-menu" data-open="false" data-menu role="menu"></div>
	</section>`;
}

export function renderInventoryItems(container, state) {
	const stacks = aggregateInventoryStacks(state);
	if (stacks.length) {
		container.replaceChildren(...stacks.map(inventoryItemButton));
		return;
	}
	const documentValue = container.ownerDocument || document;
	const empty = documentValue.createElement('p');
	empty.className = 'bag-empty';
	empty.textContent = 'Your Bag is empty. Looted items will appear here.';
	container.replaceChildren(empty);
}

export function renderEquipment(container, state) {
	const buttons = EQUIPMENT_SLOTS.map(slot => inventoryEquipmentButton(slot, state));
	container.replaceChildren(...buttons);
}

export function renderInventoryCard(container, stack, state, equipmentState = {}) {
	if (!stack?.definition) {
		container.hidden = true;
		container.dataset.hasSelection = 'false';
		container.replaceChildren();
		return;
	}
	const item = stack.definition;
	container.hidden = false;
	container.dataset.hasSelection = 'true';
	container.innerHTML = `<h4>${escapeHtml(item.icon)} ${escapeHtml(item.name)}</h4>
		<p><b>${escapeHtml(item.category)}</b> · quantity ${stack.quantity}</p>
		<p>${escapeHtml(item.description)}</p>
		<p>Damage ${item.stats.damage} · Defense ${item.stats.defense} · Focus ${item.stats.focus}</p>
		<p>${escapeHtml(inventoryActionGuidance(item, state, equipmentState))}</p>`;
}

export function renderInventoryMenu(menu, stack, state, equipmentState = {}) {
	menu.replaceChildren();
	if (!stack?.definition) {
		menu.dataset.open = 'false';
		return;
	}
	const documentValue = menu.ownerDocument || document;
	const title = documentValue.createElement('h4');
	title.textContent = `${stack.definition.icon} ${stack.definition.name}`;
	const actions = documentValue.createElement('div');
	for (const action of inventoryActionsFor(stack.definition, state, equipmentState)) {
		const button = documentValue.createElement('button');
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
