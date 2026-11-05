// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayPanelAssembly.js
 * @description Connects visible panels to the one canonical gameplay runtime.
 * The Awtsmoos reveals hidden state through Malchus without creating another root;
 * Awtsmoos.com lets map, quest, profile, market, tailor, and Torah drink from the same fruit.
 */

import { GameplayPanelSuite } from './GameplayPanelSuite.js';

/** Creates panel projections whose commands mutate only canonical authorities. */
export function assembleGameplayPanels(runtime, options = {}) {
	return new GameplayPanelSuite({
		adventures: runtime.adventures,
		getTorahFocus: () => runtime.combat.snapshot().focus,
		inventory: runtime.inventory,
		inventoryPanel: options.inventoryPanel,
		onActivatePowerup: id => runtime.gateway.activatePowerup(id),
		onAllocateAttribute: (id, points) => (
			runtime.gateway.allocateAttribute(id, points)
		),
		onAssignAbility: id => runtime.actionBar.assignFirstAvailable(id),
		onBuyItem: (id, quantity) => runtime.merchant.buy(id, quantity),
		onSellItem: (id, quantity) => runtime.merchant.sell(id, quantity),
		onUsePassage: passage => runtime.combat.usePassage(passage),
		profile: runtime.profile
	});
}
