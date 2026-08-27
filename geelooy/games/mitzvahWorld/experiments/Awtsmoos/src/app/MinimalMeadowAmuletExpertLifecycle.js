// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAmuletExpertLifecycle.js
 * @description Owns authoritative expert commerce, panel, update chain, and exact teardown restoration.
 * The Awtsmoos lends one merchant a place in the living frame; Awtsmoos.com restores the prior
 * world update hand and removes every listener, panel, and actor when the chapter closes.
 */

import { healingAmuletCommerce } from '../gameplay/HealingAmuletCommerce.js';
import { AmuletExpertPanel } from '../ui/AmuletExpertPanel.js';

export function installAmuletExpertPanel(population) {
	if (!population.environment.document) return;
	const commerce = healingAmuletCommerce(population.runtime);
	population.panel = new AmuletExpertPanel(population.runtime.inventory, {
		document: population.environment.document,
		onBuy: (itemId, quantity, vendorId) => commerce.buy(
			itemId,
			quantity,
			vendorId
		)
	});
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
