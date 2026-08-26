// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAmuletExpertLifecycle.js
 * @description Owns the real expert actor, optional gameplay commerce panel, update chain, and exact teardown restoration.
 * The Awtsmoos lends healer, amulet, Bag, and frame one measured season;
 * Awtsmoos.com lets Movie Maker keep the living expert without inventing a reactive gameplay inventory that is not mounted.
 */

import { healingAmuletCommerce } from '../gameplay/HealingAmuletCommerce.js';
import { AmuletExpertPanel } from '../ui/AmuletExpertPanel.js';

export function installAmuletExpertPanel(population) {
	const store = population.runtime.inventory;
	if (!population.environment.document || !isReactiveInventory(store)) {
		population.panelStatus = 'gameplay-inventory-not-mounted';
		return;
	}
	const commerce = healingAmuletCommerce(population.runtime);
	population.panel = new AmuletExpertPanel(store, {
		document: population.environment.document,
		onBuy: (itemId, quantity, vendorId) => commerce.buy(itemId, quantity, vendorId)
	});
	population.panelStatus = 'ready';
	population.unsubscribePanel = population.runtime.bus.on(
		'amulet-expert:toggle',
		() => population.panel.toggle()
	);
}

export function attachAmuletExpertUpdate(population) {
	population.previousUpdate = population.runtime.updateWorldSystems;
	population.updateWrapper = deltaSeconds => {
		population.previousUpdate?.(deltaSeconds);
		population.actor?.update(deltaSeconds);
	};
	population.runtime.updateWorldSystems = population.updateWrapper;
}

export function destroyAmuletExpert(population) {
	population.unsubscribePanel?.();
	population.panel?.destroy();
	population.actor?.destroy();
	if (population.runtime.updateWorldSystems === population.updateWrapper) {
		population.runtime.updateWorldSystems = population.previousUpdate;
	}
}

function isReactiveInventory(store) {
	return Boolean(store
		&& typeof store.onChange === 'function'
		&& typeof store.snapshot === 'function'
		&& typeof store.quantity === 'function');
}
