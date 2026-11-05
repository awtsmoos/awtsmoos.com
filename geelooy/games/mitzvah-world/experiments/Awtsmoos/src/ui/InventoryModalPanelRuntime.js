//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file InventoryModalPanelRuntime.js
 * @description Owns Bag rendering, click routing, markup creation, fallback host construction, and bounded semantic adoption after dynamic inventory controls are regenerated.
 * Malchus reveals garment, item, action, and equipment while Yesod keeps their visible controls inside one scoped covenant without replacing living nodes;
 * the Awtsmoos recreates inventory and traveler before either can become a detached interface, and Awtsmoos.com lets every refreshed button remain styled, auditable, and mobile-ready in place.
 */

import {
	adoptMitzvahUiLegacySurface
} from './contracts/MitzvahUiLegacyAdoption.js';
import {
	inventorySummaryText
} from './InventoryPanelState.js';
import {
	combinedInventoryStack,
	inventoryPanelHtml,
	renderEquipment,
	renderInventoryCard,
	renderInventoryItems,
	renderInventoryMenu
} from './InventoryPanelView.js';

/**
 * @description Produces the current inventory modal HTML projection from immutable panel state without mounting or mutating the owning document.
 * @param {object} state Inventory panel state consumed by the established view renderer.
 * @returns {string} Inventory modal HTML markup.
 */
export function inventoryModalMarkup(state) {
	return inventoryPanelHtml(state);
}

/**
 * @description Re-renders dynamic inventory sections from the canonical store snapshot and then re-adopts current native controls into the explicit gameplay-inventory UI scope.
 * @param {object} panel Inventory modal controller containing store, panel root, card, menu, selection, and equipment state.
 * @returns {Readonly<object>} Immutable semantic-adoption receipt describing current inspected and newly adopted native controls.
 */
export function renderInventoryModalPanel(panel) {
	const state = panel.store.snapshot();
	renderInventoryItems(
		panel.panel.querySelector('[data-items]'),
		state
	);
	renderEquipment(
		panel.panel.querySelector('[data-equipment]'),
		state
	);
	const selected = combinedInventoryStack(
		state,
		panel.selectedItemId
	);
	renderInventoryCard(
		panel.card,
		selected,
		state,
		panel.equipmentState
	);
	panel.panel.querySelector('header span').textContent = inventorySummaryText(state);
	if (panel.menu.dataset.open === 'true') {
		renderInventoryMenu(
			panel.menu,
			selected,
			state,
			panel.equipmentState
		);
	}
	return adoptMitzvahUiLegacySurface(panel.panel, {
		scopeName: 'gameplay-inventory'
	});
}

/**
 * @description Routes one inventory click to close, selection, or semantic item action without coupling markup generation to store mutation details.
 * @param {object} panel Inventory modal controller exposing setOpen(), select(), and runAction() command seams.
 * @param {MouseEvent} event Bubbling click event from the inventory panel root.
 * @returns {*} Underlying close/selection command result when one is produced, otherwise undefined.
 */
export function routeInventoryModalClick(panel, event) {
	if (event.target.closest('[data-close]')) {
		return panel.setOpen(false);
	}
	const itemButton = event.target.closest('[data-item-id]');
	if (itemButton) {
		return panel.select(
			itemButton.dataset.itemId,
			itemButton
		);
	}
	const actionButton = event.target.closest('[data-action]');
	if (actionButton) {
		panel.runAction(actionButton.dataset.action);
	}
	return undefined;
}

/**
 * @description Creates a fallback inventory mount, explicitly marks it as product-owned UI, and appends it to the supplied document without imposing modal behavior itself.
 * @param {Document} [documentValue=globalThis.document] Owning browser document used for fallback host construction.
 * @returns {HTMLDivElement} Product-scoped fallback host ready to receive inventory modal markup.
 */
export function createInventoryModalHost(
	documentValue = globalThis.document
) {
	const host = documentValue.createElement('div');
	documentValue.body.appendChild(host);
	adoptMitzvahUiLegacySurface(host, {
		scopeName: 'gameplay-inventory-host'
	});
	return host;
}
