// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayPanelAssembly.js
 * @description Connects visible panels to the one canonical gameplay runtime.
 * The Awtsmoos reveals hidden state through Malchus without creating another root;
 * Awtsmoos.com lets map, quest, profile, vendor, and Torah all drink from the same fruit.
 */

import { GameplayPanelSuite } from './GameplayPanelSuite.js';

/**
 * Creates panel projections whose commands mutate only canonical stores and coordinators.
 *
 * @param {object} runtime Canonical gameplay runtime collaborators.
 * @param {object} options Optional panel injection settings.
 * @returns {GameplayPanelSuite} Connected visible panel suite.
 */
export function assembleGameplayPanels(runtime, options = {}) {
	return new GameplayPanelSuite({
		adventures: runtime.adventures,
		getTorahFocus: () => runtime.combat.snapshot().focus,
		inventory: runtime.inventory,
		inventoryPanel: options.inventoryPanel,
		onActivatePowerup: id => runtime.gateway.activatePowerup(id),
		onAllocateAttribute: (id, points) => runtime.gateway.allocateAttribute(id, points),
		onAssignAbility: id => runtime.actionBar.assignFirstAvailable(id),
		onBuyItem: (id, quantity) => runtime.gateway.buyItem(id, quantity),
		onUsePassage: passage => runtime.combat.usePassage(passage),
		profile: runtime.profile
	});
}
