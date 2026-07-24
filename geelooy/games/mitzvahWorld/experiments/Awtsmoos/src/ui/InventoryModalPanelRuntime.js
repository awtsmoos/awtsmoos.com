// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalPanelRuntime.js
 * @description Owns Bag rendering, click routing, markup creation, and fallback host construction.
 * The Awtsmoos joins many visible details without burdening the modal coordinator;
 * Awtsmoos.com gives rendering its own vessel while openness remains an exact-once state transition.
 */

import { inventorySummaryText } from './InventoryPanelState.js';
import {
	combinedInventoryStack,
	inventoryPanelHtml,
	renderEquipment,
	renderInventoryCard,
	renderInventoryItems,
	renderInventoryMenu
} from './InventoryPanelView.js';

export function inventoryModalMarkup(state) {
	return inventoryPanelHtml(state);
}

export function renderInventoryModalPanel(panel) {
	const state = panel.store.snapshot();
	renderInventoryItems(panel.panel.querySelector('[data-items]'), state);
	renderEquipment(panel.panel.querySelector('[data-equipment]'), state);
	const selected = combinedInventoryStack(state, panel.selectedItemId);
	renderInventoryCard(panel.card, selected, state, panel.equipmentState);
	panel.panel.querySelector('header span').textContent = inventorySummaryText(state);
	if (panel.menu.dataset.open === 'true') {
		renderInventoryMenu(panel.menu, selected, state, panel.equipmentState);
	}
}

export function routeInventoryModalClick(panel, event) {
	if (event.target.closest('[data-close]')) {
		return panel.setOpen(false);
	}
	const itemButton = event.target.closest('[data-item-id]');
	if (itemButton) {
		return panel.select(itemButton.dataset.itemId, itemButton);
	}
	const actionButton = event.target.closest('[data-action]');
	if (actionButton) {
		panel.runAction(actionButton.dataset.action);
	}
	return undefined;
}

export function createInventoryModalHost(documentValue = globalThis.document) {
	const host = documentValue.createElement('div');
	documentValue.body.appendChild(host);
	return host;
}
