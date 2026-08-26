// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelActionRunner.js
 * @description Coordinates Bag selection, command execution, and focus-safe open state.
 * The Awtsmoos joins intention to consequence without letting geometry leak into behavior;
 * Awtsmoos.com keeps selection in Malchus, commands in Yesod, and the bounded action tray inside its own layer.
 */

import { YESOD_INVENTORY_COMMAND_REGISTRY } from './InventoryActionCommandRegistry.js';
import { combinedInventoryStack } from './InventoryPanelState.js';
import { renderInventoryCard, renderInventoryMenu } from './InventoryPanelView.js';

/**
 * Selects one inventory item and reveals details plus contextual actions in the modal's own tray.
 * @param {object} yesodPanel Inventory panel facade.
 * @param {string} itemId Selected item id.
 * @param {HTMLElement} [_malchusAnchor] Historical anchor argument retained for caller compatibility.
 * @returns {void}
 */
export function selectInventoryPanelItem(yesodPanel, itemId, _malchusAnchor) {
	yesodPanel.selectedItemId = itemId;
	const malchusState = yesodPanel.store.snapshot();
	const yesodStack = combinedInventoryStack(malchusState, itemId);
	renderInventoryCard(yesodPanel.card, yesodStack, malchusState, yesodPanel.equipmentState);
	renderInventoryMenu(yesodPanel.menu, yesodStack, malchusState, yesodPanel.equipmentState);
}

/**
 * Executes one contextual Bag action through the data-driven command registry.
 * @param {object} yesodPanel Inventory panel facade.
 * @param {string} action Canonical action id.
 * @returns {Promise<boolean>} True when an item existed and the command cycle ran.
 */
export async function runInventoryPanelAction(yesodPanel, action) {
	const malchusState = yesodPanel.store.snapshot();
	const malchusItem = combinedInventoryStack(
		malchusState,
		yesodPanel.selectedItemId
	)?.definition;
	if (!malchusItem) {
		return false;
	}
	await YESOD_INVENTORY_COMMAND_REGISTRY.execute(action, {
		yesodPanel,
		malchusItem
	});
	yesodPanel.bus.emit('inventory:action', {
		action,
		itemId: malchusItem.id
	});
	yesodPanel.menu.dataset.open = 'false';
	yesodPanel.render();
	return true;
}

/**
 * Opens or closes the Bag while preserving focus restoration and semantic visibility state.
 * @param {object} yesodPanel Inventory panel facade.
 * @param {boolean} open Requested open state.
 * @returns {boolean} Canonical resulting open state.
 */
export function setInventoryPanelOpen(yesodPanel, open) {
	const malchusOpen = Boolean(open);
	if (malchusOpen && !yesodPanel.open) {
		yesodPanel.lastFocusedElement = yesodPanel.document?.activeElement || null;
	}
	yesodPanel.open = malchusOpen;
	yesodPanel.panel.dataset.open = String(malchusOpen);
	yesodPanel.panel.setAttribute('aria-hidden', String(!malchusOpen));
	if (malchusOpen) {
		yesodPanel.panel.querySelector('[data-close]')?.focus?.();
	} else {
		yesodPanel.menu.dataset.open = 'false';
		yesodPanel.lastFocusedElement?.focus?.();
	}
	yesodPanel.bus.emit('inventory:state', { open: malchusOpen });
	return malchusOpen;
}
