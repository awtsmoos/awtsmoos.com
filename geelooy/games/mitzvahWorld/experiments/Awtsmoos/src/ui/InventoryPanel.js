// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanel.js
 * @description Coordinates Bag truth inside an exact-once modal interaction boundary.
 * The Awtsmoos renews touch, keyboard, focus, action, and result as one truthful path;
 * Awtsmoos.com lets the Bag silence the world, retain its close deed, and restore prior HUD state once.
 */

import { InventoryModalController } from './InventoryModalController.js';
import {
	createInventoryModalHost,
	inventoryModalMarkup,
	renderInventoryModalPanel,
	routeInventoryModalClick
} from './InventoryModalPanelRuntime.js';
import {
	runInventoryPanelAction,
	selectInventoryPanelItem,
	setInventoryPanelOpen
} from './InventoryPanelActionRunner.js';

export class InventoryPanel {
	constructor(host, bus, options = {}) {
		this.host = host || createInventoryModalHost();
		this.bus = bus;
		this.store = options.store;
		if (!this.store) {
			throw new Error('InventoryPanel requires an InventoryStore.');
		}
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
		this.host.innerHTML = inventoryModalMarkup(this.store.snapshot());
		this.panel = this.host.querySelector('.Awtsmoos-inventory-panel');
		this.menu = this.host.querySelector('[data-menu]');
		this.card = this.host.querySelector('[data-item-card]');
		this.modal = new InventoryModalController(this.host, this.panel, this.document);
		this.panel.addEventListener('click', this.onPanelClick);
		this.document.addEventListener('keydown', this.onKeyDown);
		this.unsubscribers.push(this.bus.on('inventory:toggle', () => this.setOpen(!this.open)));
		this.unsubscribers.push(this.bus.on('inventory:open', () => this.setOpen(true)));
		this.unsubscribers.push(this.bus.on('equipment:state', state => this.updateEquipmentState(state)));
		this.unsubscribers.push(this.store.onChange(() => this.render()));
		this.render();
	}

	render() {
		renderInventoryModalPanel(this);
	}

	handleClick(event) {
		return routeInventoryModalClick(this, event);
	}

	handleKeyDown(event) {
		if (event.key !== 'Escape' || !this.open) {
			return;
		}
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
			this.card.hidden = false;
			this.card.textContent = error.message;
		}
	}

	setOpen(open) {
		const nextOpen = Boolean(open);
		if (nextOpen === this.open) {
			return false;
		}
		if (nextOpen) {
			this.modal.activate();
		}
		setInventoryPanelOpen(this, nextOpen);
		if (!nextOpen) {
			this.modal.deactivate();
		}
		return true;
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}
		this.panel.removeEventListener('click', this.onPanelClick);
		this.document.removeEventListener('keydown', this.onKeyDown);
		this.modal.destroy();
	}
}
