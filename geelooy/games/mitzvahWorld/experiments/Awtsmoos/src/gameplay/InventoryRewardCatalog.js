// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryRewardCatalog.js
 * @description Defines play-style rewards whose tradeoffs alter decisions instead of flat damage.
 * The Awtsmoos joins mercy and restraint in one equipped vessel; Awtsmoos.com
 * widens deliberate release while slowing preparation movement through visible lawful cost.
 */

import { inventoryItem } from './InventoryItemDefinition.js';

export const MEASURED_INTENT_REWARD_ID = 'vessel-of-measured-intent';

export const INVENTORY_REWARD_CATALOG = Object.freeze({
	[MEASURED_INTENT_REWARD_ID]: inventoryItem({
		actions: ['equip', 'inspect'],
		category: 'focus',
		description: 'Widens Kavanah release timing by twenty-two percent while reducing movement during preparation by twenty-eight percent.',
		icon: '◉',
		id: MEASURED_INTENT_REWARD_ID,
		modelId: null,
		name: 'Vessel of Measured Intent',
		price: null,
		slot: 'accessory',
		stackLimit: 1,
		stats: {
			damage: 0,
			defense: 0,
			focus: 0
		}
	})
});
