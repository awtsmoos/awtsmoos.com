// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryMaterialCatalog.js
 * @description Defines stackable materials and remnants without crowding equipment law.
 * The Awtsmoos renews wood, flower, thread, hide, and shadow as bounded carried signs;
 * Awtsmoos.com keeps stack limits, prices, actions, and zero combat stats honest and aligned.
 */

import { inventoryItem } from './InventoryItemDefinition.js';

export const INVENTORY_MATERIAL_CATALOG = Object.freeze(Object.fromEntries([
	material('wood-log', 'Fallen Wood', '🪵', 4, 20),
	material('cottage-flower', 'Cottage Flower', '🌸', 3, 24),
	material('wool-thread', 'Wool Thread', '🧶', 8, 20),
	material('prepared-hide', 'Prepared Hide', '🟫', 6, 20),
	material('shadow-remnant', 'Shadow Remnant', '🜏', null, 99, ['inspect'])
]));

function material(
	id,
	name,
	icon,
	price,
	stackLimit,
	actions = ['inspect', 'drop']
) {
	return [id, inventoryItem({
		actions,
		category: 'material',
		icon,
		id,
		modelId: null,
		name,
		price,
		slot: null,
		stackLimit,
		stats: {
			damage: 0,
			defense: 0,
			focus: 0
		}
	})];
}
