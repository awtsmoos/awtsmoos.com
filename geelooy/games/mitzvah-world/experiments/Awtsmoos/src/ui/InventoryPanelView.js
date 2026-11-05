// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelView.js
 * @description Projects Bag state into semantic DOM without owning action execution or geometry.
 * The Awtsmoos fills true vessels and leaves empty vessels honest and clear;
 * Awtsmoos.com lets Malchus reveal data while CSS, commands, and focus each keep their sphere.
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
	escapeInventoryHtml,
	inventoryPanelMarkup
} from './InventoryPanelMarkup.js';
import {
	aggregateInventoryStacks,
	combinedInventoryStack
} from './InventoryPanelState.js';

export { combinedInventoryStack } from './InventoryPanelState.js';

/** @param {object} malchusState Inventory snapshot. @returns {string} Semantic Bag shell markup. */
export function inventoryPanelHtml(malchusState) {
	return inventoryPanelMarkup(malchusState);
}

/** @param {HTMLElement} malchusContainer Item-grid root. @param {object} malchusState Inventory snapshot. @returns {void} */
export function renderInventoryItems(malchusContainer, malchusState) {
	const yesodStacks = aggregateInventoryStacks(malchusState);
	if (yesodStacks.length) {
		malchusContainer.replaceChildren(...yesodStacks.map(inventoryItemButton));
		return;
	}
	const malchusDocument = malchusContainer.ownerDocument || document;
	const malchusEmpty = malchusDocument.createElement('p');
	malchusEmpty.className = 'bag-empty';
	malchusEmpty.textContent = 'Your Bag is empty. Looted items will appear here.';
	malchusContainer.replaceChildren(malchusEmpty);
}

/** @param {HTMLElement} malchusContainer Equipment-grid root. @param {object} malchusState Inventory snapshot. @returns {void} */
export function renderEquipment(malchusContainer, malchusState) {
	malchusContainer.replaceChildren(
		...EQUIPMENT_SLOTS.map(slot => inventoryEquipmentButton(slot, malchusState))
	);
}

/**
 * Reveals selected-item details or collapses the detail vessel completely when nothing is selected.
 * @param {HTMLElement} malchusContainer Detail-card root.
 * @param {object|null} yesodStack Selected item stack.
 * @param {object} malchusState Inventory snapshot.
 * @param {object} [binahEquipment={}] Equipment state.
 * @returns {void}
 */
export function renderInventoryCard(malchusContainer, yesodStack, malchusState, binahEquipment = {}) {
	if (!yesodStack?.definition) {
		malchusContainer.hidden = true;
		malchusContainer.dataset.hasSelection = 'false';
		malchusContainer.replaceChildren();
		return;
	}
	const malchusItem = yesodStack.definition;
	malchusContainer.hidden = false;
	malchusContainer.dataset.hasSelection = 'true';
	malchusContainer.innerHTML = `<h4>${escapeInventoryHtml(malchusItem.icon)} ${escapeInventoryHtml(malchusItem.name)}</h4>
		<p><b>${escapeInventoryHtml(malchusItem.category)}</b> · quantity ${yesodStack.quantity}</p>
		<p>${escapeInventoryHtml(malchusItem.description)}</p>
		<p>Damage ${malchusItem.stats.damage} · Defense ${malchusItem.stats.defense} · Focus ${malchusItem.stats.focus}</p>
		<p>${escapeInventoryHtml(inventoryActionGuidance(malchusItem, malchusState, binahEquipment))}</p>`;
}

/**
 * Reveals contextual actions inside the Bag's own bounded action tray.
 * @param {HTMLElement} malchusMenu Context-action tray.
 * @param {object|null} yesodStack Selected item stack.
 * @param {object} malchusState Inventory snapshot.
 * @param {object} [binahEquipment={}] Equipment state.
 * @returns {void}
 */
export function renderInventoryMenu(malchusMenu, yesodStack, malchusState, binahEquipment = {}) {
	malchusMenu.replaceChildren();
	if (!yesodStack?.definition) {
		malchusMenu.dataset.open = 'false';
		return;
	}
	const malchusDocument = malchusMenu.ownerDocument || document;
	const malchusTitle = malchusDocument.createElement('h4');
	malchusTitle.textContent = `${yesodStack.definition.icon} ${yesodStack.definition.name}`;
	const yesodActions = malchusDocument.createElement('div');
	for (const action of inventoryActionsFor(yesodStack.definition, malchusState, binahEquipment)) {
		const malchusButton = malchusDocument.createElement('button');
		malchusButton.dataset.action = action;
		malchusButton.type = 'button';
		malchusButton.textContent = inventoryActionLabel(action);
		yesodActions.appendChild(malchusButton);
	}
	malchusMenu.append(malchusTitle, yesodActions);
	malchusMenu.dataset.open = 'true';
}
