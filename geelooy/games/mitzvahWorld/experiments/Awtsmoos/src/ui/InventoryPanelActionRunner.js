// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelActionRunner.js
 * @description Executes real Bag actions, contextual selection, positioning, and focus-safe openness.
 * The Awtsmoos joins intention to consequence without invisible blockers; Awtsmoos.com keeps
 * every touch and keyboard action connected to store truth, equipment events, and restored focus.
 */

import { combinedInventoryStack } from './InventoryPanelState.js';
import { renderInventoryCard, renderInventoryMenu } from './InventoryPanelView.js';

export function selectInventoryPanelItem(panel, itemId, button) {
	panel.selectedItemId = itemId;
	const state = panel.store.snapshot();
	const stack = combinedInventoryStack(state, itemId);
	renderInventoryCard(panel.card, stack, state, panel.equipmentState);
	renderInventoryMenu(panel.menu, stack, state, panel.equipmentState);
	positionMenu(panel.menu, button.getBoundingClientRect());
}

export function runInventoryPanelAction(panel, action) {
	const state = panel.store.snapshot();
	const item = combinedInventoryStack(state, panel.selectedItemId)?.definition;
	if (!item) return;
	if (action === 'equip') panel.store.equip(item.id);
	if (action === 'unequip') panel.store.unequip(item.slot);
	if (action === 'draw') panel.bus.emit('equipment:draw');
	if (action === 'sheath') panel.bus.emit('equipment:sheath');
	if (action === 'drop') panel.store.remove(item.id, 1);
	if (action === 'open' && item.category === 'book') panel.bus.emit('torah:toggle');
	if (action === 'open' && item.id === 'quest-scroll') panel.bus.emit('questlog:toggle');
	if (action === 'pin' && item.category === 'book') panel.store.toggleBookPin(item.id);
	panel.bus.emit('inventory:action', { action, itemId: item.id });
	panel.menu.dataset.open = 'false';
	panel.render();
}

export function setInventoryPanelOpen(panel, open) {
	const nextOpen = Boolean(open);
	if (nextOpen && !panel.open) panel.lastFocusedElement = panel.document?.activeElement || null;
	panel.open = nextOpen;
	panel.panel.dataset.open = String(panel.open);
	panel.panel.setAttribute('aria-hidden', String(!panel.open));
	if (panel.open) panel.panel.querySelector('[data-close]')?.focus?.();
	if (!panel.open) {
		panel.menu.dataset.open = 'false';
		panel.lastFocusedElement?.focus?.();
	}
	panel.bus.emit('inventory:state', { open: panel.open });
}

function positionMenu(menu, rectangle) {
	const width = Number(globalThis.innerWidth) || 390;
	const height = Number(globalThis.innerHeight) || 844;
	menu.style.left = `${Math.max(8, Math.min(width - 230, rectangle.left))}px`;
	menu.style.top = `${Math.max(8, Math.min(height - 180, rectangle.bottom + 6))}px`;
}
