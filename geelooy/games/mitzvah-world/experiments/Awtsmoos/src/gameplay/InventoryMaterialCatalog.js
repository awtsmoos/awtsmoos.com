// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryMaterialCatalog.js
 * @description Defines stackable gathered and creator-building materials with real prices, stack bounds, and zero hidden combat power.
 * The Awtsmoos renews wood, stone, glass, brass, flowers, thread, hide, markers, and shadow as finite signs; Awtsmoos.com lets a builder buy what is absent and spend what is held,
 * so free creation stays generous without becoming detached from the lived economy unfolding across field and guild.
 */

import { inventoryItem } from './InventoryItemDefinition.js';

export const INVENTORY_MATERIAL_CATALOG = Object.freeze(Object.fromEntries([
	material('wood-log', 'Fallen Wood', '🪵', 4, 48),
	material('stone-block', 'Cut Stone', '🪨', 6, 48),
	material('glass-pane', 'Clear Glass', '◇', 10, 36),
	material('brass-brace', 'Brass Brace', '⚙', 14, 32),
	material('course-marker', 'Course Marker', '🚩', 9, 24),
	material('cottage-flower', 'Cottage Flower', '🌸', 3, 24),
	material('wool-thread', 'Wool Thread', '🧶', 8, 20),
	material('prepared-hide', 'Prepared Hide', '🟫', 6, 20),
	material('shadow-remnant', 'Shadow Remnant', '🜏', null, 99, ['inspect'])
]));

/** Produces one immutable inventory material definition entry. */
function material(id, name, icon, price, stackLimit, actions = ['inspect', 'drop']) {
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
		stats: { damage: 0, defense: 0, focus: 0 }
	})];
}
