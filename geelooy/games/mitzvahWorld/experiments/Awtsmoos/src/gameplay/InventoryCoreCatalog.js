// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryCoreCatalog.js
 * @description Defines equipment, books, quests, accessories, and currency carried by the player.
 * The Awtsmoos renews every named vessel beneath one inspectable law; Awtsmoos.com
 * keeps slot, value, model, action, stack, and derived combat meaning visibly aligned.
 */

import { inventoryItem } from './InventoryItemDefinition.js';

export const INVENTORY_CORE_CATALOG = Object.freeze(Object.fromEntries([
	entry('forest-axe', 'Forest Axe', '🪓', 'tool', 'tool', [5, 0, 2], 45, 'axe-small'),
	entry('wooden-staff', 'Wooden Staff', '🪄', 'weapon', 'hand', [18, 2, 4], 32, 'wooden-staff'),
	entry('spark-blade', 'Spark Blade', '⚔️', 'weapon', 'hand', [26, 4, 1], 110, 'sword'),
	entry('village-shield', 'Village Shield', '🛡️', 'shield', 'offhand', [0, 10, 0], 75, 'shield'),
	entry('chalaf', 'Chalaf', '🔪', 'tool', 'tool', [8, 0, 1], 40, null),
	entry('siddur', 'Siddur', '📖', 'book', 'book', [0, 4, 5], 10, 'book', bookActions()),
	entry('chumash-light', 'Chumash of Light', '📚', 'book', 'book', [0, 7, 8], 55, 'book', bookActions()),
	entry('tanya-pocket', 'Pocket Tanya', '📕', 'book', 'book', [0, 8, 6], 65, 'book', bookActions()),
	entry('quest-scroll', 'Shlichus Scroll', '📜', 'quest', null, [0, 0, 0], null, 'scroll', bookActions()),
	entry('lost-scroll', 'Lost Stream Scroll', '📜', 'quest', null, [0, 0, 0], null, 'scroll'),
	entry('community-badge', 'Community Badge', '🏅', 'accessory', 'accessory', [0, 4, 3], 25, null),
	entry('chest-key', 'Old Chest Key', '🗝️', 'quest', null, [0, 0, 0], null, null),
	entry('perutas', 'Perutas', '🪙', 'currency', null, [0, 0, 0], null, null, ['inspect'], 9999)
]));

function entry(
	id,
	name,
	icon,
	category,
	slot,
	legacy,
	price,
	modelId,
	actions = ['equip', 'inspect'],
	stackLimit = 1
) {
	return [id, inventoryItem({
		actions,
		category,
		icon,
		id,
		modelId,
		name,
		price,
		slot,
		stackLimit,
		stats: {
			damage: legacy[0],
			defense: legacy[1],
			focus: legacy[2]
		}
	})];
}

function bookActions() {
	return ['open', 'pin', 'inspect'];
}
