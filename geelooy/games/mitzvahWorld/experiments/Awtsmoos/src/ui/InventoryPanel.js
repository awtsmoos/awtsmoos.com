// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanel.js
 * @description Connects the shared InventoryStore to bag, equipment, books, and actions.
 * The Awtsmoos renews each selection through a measured action menu; Awtsmoos.com
 * keeps bag presentation local while multiplayer mutations remain server-authoritative.
 */

import {
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
		this.open = false;
		this.selectedItemId = null;
		this.unsubscribers = [];
		this.build();
	}

	build() {
		this.host.classList.add('Awtsmoos-inventory-shell');
		this.host.innerHTML = inventoryPanelHtml(this.store.snapshot());
		this.panel = this.host.querySelector('.Awtsmoos-inventory-panel');
		this.menu = this.host.querySelector('[data-menu]');
		this.panel.addEventListener('click', event => this.onClick(event));
		this.unsubscribers.push(this.bus.on('inventory:toggle', () => this.setOpen(!this.open)));
		this.unsubscribers.push(this.bus.on('inventory:open', () => this.setOpen(true)));
		this.unsubscribers.push(this.store.onChange(() => this.render()));
		this.render();
	}

	render() {
		const state = this.store.snapshot();
		renderInventoryItems(this.panel.querySelector('[data-items]'), state);
		renderEquipment(this.panel.querySelector('[data-equipment]'), state);
		const selected = state.items.find(item => item.itemId === this.selectedItemId);
		renderInventoryCard(this.panel.querySelector('[data-item-card]'), selected);
		this.panel.querySelector('header span').textContent = summaryText(state);
	}

	onClick(event) {
		if (event.target.closest('[data-close]')) {
			this.setOpen(false);
			return;
		}
		const itemButton = event.target.closest('[data-item-id]');
		if (itemButton) {
			this.select(itemButton.dataset.itemId, itemButton);
			return;
		}
		const actionButton = event.target.closest('[data-action]');
		if (actionButton) this.runAction(actionButton.dataset.action);
	}

	select(itemId, button) {
		this.selectedItemId = itemId;
		const stack = this.store.snapshot().items.find(item => item.itemId === itemId);
		renderInventoryCard(this.panel.querySelector('[data-item-card]'), stack);
		renderInventoryMenu(this.menu, stack);
		const rectangle = button.getBoundingClientRect();
		this.menu.style.left = `${Math.max(8, Math.min(innerWidth - 230, rectangle.left))}px`;
		this.menu.style.top = `${Math.max(8, Math.min(innerHeight - 180, rectangle.bottom + 6))}px`;
	}

	runAction(action) {
		const definition = this.store.snapshot().items.find(item => (
			item.itemId === this.selectedItemId
		))?.definition;
		if (!definition) return;
		try {
			if (action === 'equip') this.store.equip(definition.id);
			if (action === 'drop') this.store.remove(definition.id, 1);
			if (action === 'open' && definition.category === 'book') this.bus.emit('torah:toggle');
			if (action === 'open' && definition.id === 'quest-scroll') this.bus.emit('questlog:toggle');
			if (action === 'pin' && definition.category === 'book') this.store.toggleBookPin(definition.id);
			this.bus.emit('inventory:action', { action, itemId: definition.id });
			this.menu.dataset.open = 'false';
			this.render();
		} catch (error) {
			this.panel.querySelector('[data-item-card]').textContent = error.message;
		}
	}

	setOpen(open) {
		this.open = Boolean(open);
		this.panel.dataset.open = String(this.open);
		this.panel.setAttribute('aria-hidden', String(!this.open));
		if (!this.open) this.menu.dataset.open = 'false';
		this.bus.emit('inventory:state', { open: this.open });
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}

function summaryText(state) {
	const coins = state.items.find(item => item.itemId === 'perutas')?.quantity || 0;
	return `🪙 ${coins} · ⚔ ${state.stats.damage} · 🛡 ${state.stats.defense} · ✨ ${state.stats.focus}`;
}

function makeHost() {
	const host = document.createElement('div');
	document.body.appendChild(host);
	return host;
}
