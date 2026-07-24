// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanel.js
 * @description Connects bag actions to real garment visibility and hand/back weapon state.
 * The Awtsmoos renews selection, wearing, drawing, and sheathing through one store;
 * Awtsmoos.com keeps the bag local while the visible Chossid obeys authoritative equipment.
 */

import {
	inventoryPanelHtml,
	renderEquipment,
	renderInventoryCard,
	renderInventoryItems,
	renderInventoryMenu
} from './InventoryPanelView.js?v=20260724-meadow-21';

export class InventoryPanel {
	constructor(host, bus, options = {}) {
		this.host = host || makeHost();
		this.bus = bus;
		this.store = options.store;
		if (!this.store) throw new Error('InventoryPanel requires an InventoryStore.');
		this.open = false;
		this.selectedItemId = null;
		this.equipmentState = { drawn: false };
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
		this.unsubscribers.push(this.bus.on('equipment:state', state => {
			this.equipmentState = state;
			this.render();
		}));
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
		if (event.target.closest('[data-close]')) return this.setOpen(false);
		const itemButton = event.target.closest('[data-item-id]');
		if (itemButton) return this.select(itemButton.dataset.itemId, itemButton);
		const actionButton = event.target.closest('[data-action]');
		if (actionButton) this.runAction(actionButton.dataset.action);
	}

	select(itemId, button) {
		this.selectedItemId = itemId;
		const state = this.store.snapshot();
		const stack = state.items.find(item => item.itemId === itemId);
		renderInventoryCard(this.panel.querySelector('[data-item-card]'), stack);
		renderInventoryMenu(this.menu, stack, state, this.equipmentState);
		const rectangle = button.getBoundingClientRect();
		this.menu.style.left = `${Math.max(8, Math.min(innerWidth - 230, rectangle.left))}px`;
		this.menu.style.top = `${Math.max(8, Math.min(innerHeight - 180, rectangle.bottom + 6))}px`;
	}

	runAction(action) {
		const stack = this.store.snapshot().items.find(item => item.itemId === this.selectedItemId);
		const item = stack?.definition;
		if (!item) return;
		try {
			if (action === 'equip') this.store.equip(item.id);
			if (action === 'unequip') this.store.unequip(item.slot);
			if (action === 'draw') this.bus.emit('equipment:draw');
			if (action === 'sheath') this.bus.emit('equipment:sheath');
			if (action === 'drop') this.store.remove(item.id, 1);
			if (action === 'open' && item.category === 'book') this.bus.emit('torah:toggle');
			if (action === 'open' && item.id === 'quest-scroll') this.bus.emit('questlog:toggle');
			if (action === 'pin' && item.category === 'book') this.store.toggleBookPin(item.id);
			this.bus.emit('inventory:action', { action, itemId: item.id });
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
