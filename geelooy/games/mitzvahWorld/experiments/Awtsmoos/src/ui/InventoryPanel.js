// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanel.js
 * @description Connects Bag rendering and input to authoritative inventory and visible equipment.
 * The Awtsmoos renews touch, keyboard, focus, action, and result as one truthful path;
 * Awtsmoos.com keeps this coordinator small while focused vessels execute each interaction.
 */

import {
	runInventoryPanelAction,
	selectInventoryPanelItem,
	setInventoryPanelOpen
} from './InventoryPanelActionRunner.js';
import { inventorySummaryText } from './InventoryPanelState.js';
import {
	combinedInventoryStack,
	inventoryPanelHtml,
	renderEquipment,
	renderInventoryCard,
	renderInventoryItems,
	renderInventoryMenu
} from './InventoryPanelView.js';

export class InventoryPanel {
	constructor(host, bus, options = {}) {
		this.host = host || makeHost();
		this.bus = bus;
		this.store = options.store;
		if (!this.store) throw new Error('InventoryPanel requires an InventoryStore.');
		this.document = this.host.ownerDocument || globalThis.document;
		this.open = false;
		this.selectedItemId = null;
		this.lastFocusedElement = null;
		this.equipmentState = { drawn: false };
		this.unsubscribers = [];
		this.onPanelClick = event => this.handleClick(event);
		this.onKeyDown = event => this.handleKeyDown(event);
		this.build();
	}

	build() {
		this.host.classList.add('Awtsmoos-inventory-shell');
		this.host.innerHTML = inventoryPanelHtml(this.store.snapshot());
		this.panel = this.host.querySelector('.Awtsmoos-inventory-panel');
		this.menu = this.host.querySelector('[data-menu]');
		this.card = this.host.querySelector('[data-item-card]');
		this.panel.addEventListener('click', this.onPanelClick);
		this.document?.addEventListener?.('keydown', this.onKeyDown);
		this.unsubscribers.push(this.bus.on('inventory:toggle', () => this.setOpen(!this.open)));
		this.unsubscribers.push(this.bus.on('inventory:open', () => this.setOpen(true)));
		this.unsubscribers.push(this.bus.on('equipment:state', state => this.updateEquipmentState(state)));
		this.unsubscribers.push(this.store.onChange(() => this.render()));
		this.render();
	}

	render() {
		const state = this.store.snapshot();
		renderInventoryItems(this.panel.querySelector('[data-items]'), state);
		renderEquipment(this.panel.querySelector('[data-equipment]'), state);
		const selected = combinedInventoryStack(state, this.selectedItemId);
		renderInventoryCard(this.card, selected, state, this.equipmentState);
		this.panel.querySelector('header span').textContent = inventorySummaryText(state);
		if (this.menu.dataset.open === 'true') {
			renderInventoryMenu(this.menu, selected, state, this.equipmentState);
		}
	}

	handleClick(event) {
		if (event.target.closest('[data-close]')) return this.setOpen(false);
		const itemButton = event.target.closest('[data-item-id]');
		if (itemButton) return this.select(itemButton.dataset.itemId, itemButton);
		const actionButton = event.target.closest('[data-action]');
		if (actionButton) this.runAction(actionButton.dataset.action);
	}

	handleKeyDown(event) {
		if (event.key !== 'Escape' || !this.open) return;
		event.preventDefault();
		this.setOpen(false);
	}

	updateEquipmentState(state) {
		this.equipmentState = { ...this.equipmentState, ...state };
		this.render();
	}

	select(itemId, button) {
		selectInventoryPanelItem(this, itemId, button);
	}

	runAction(action) {
		try {
			runInventoryPanelAction(this, action);
		} catch (error) {
			this.card.textContent = error.message;
		}
	}

	setOpen(open) {
		setInventoryPanelOpen(this, open);
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.panel.removeEventListener('click', this.onPanelClick);
		this.document?.removeEventListener?.('keydown', this.onKeyDown);
	}
}

function makeHost() {
	const host = document.createElement('div');
	document.body.appendChild(host);
	return host;
}
