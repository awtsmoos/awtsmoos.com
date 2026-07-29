// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryCatalog.js
 * @description Combines tools, Torah, authoritative loot, and the model-derived Chossid wardrobe.
 * The Awtsmoos renews every carried vessel beneath one lawful catalog; Awtsmoos.com
 * keeps IDs, prices, models, garments, appearance choices, and real stats inspectable.
 */

import { GARMENT_CATALOG, GARMENT_ITEM_IDS } from './GarmentCatalog.js';
import { inventoryItem } from './InventoryItemDefinition.js';

const BASE_CATALOG = Object.freeze(Object.fromEntries([
	item('forest-axe', 'Forest Axe', '🪓', 'tool', 'tool', [5, 0, 2], 45, 'axe-small'),
	item('wooden-staff', 'Wooden Staff', '🪄', 'weapon', 'hand', [18, 2, 4], 32, 'wooden-staff'),
	item('spark-blade', 'Spark Blade', '⚔️', 'weapon', 'hand', [26, 4, 1], 110, 'sword'),
	item('village-shield', 'Village Shield', '🛡️', 'shield', 'offhand', [0, 10, 0], 75, 'shield'),
	item('chalaf', 'Chalaf', '🔪', 'tool', 'tool', [8, 0, 1], 40, null),
	item('siddur', 'Siddur', '📖', 'book', 'book', [0, 4, 5], 10, 'book', ['open', 'pin', 'inspect']),
	item('chumash-light', 'Chumash of Light', '📚', 'book', 'book', [0, 7, 8], 55, 'book', ['open', 'pin', 'inspect']),
	item('tanya-pocket', 'Pocket Tanya', '📕', 'book', 'book', [0, 8, 6], 65, 'book', ['open', 'pin', 'inspect']),
	item('quest-scroll', 'Shlichus Scroll', '📜', 'quest', null, [0, 0, 0], null, 'scroll', ['open', 'pin', 'inspect']),
	item('lost-scroll', 'Lost Stream Scroll', '📜', 'quest', null, [0, 0, 0], null, 'scroll'),
	item('wood-log', 'Fallen Wood', '🪵', 'material', null, [0, 0, 0], 4, null, ['inspect', 'drop'], 20),
	item('cottage-flower', 'Cottage Flower', '🌸', 'material', null, [0, 0, 0], 3, null, ['inspect', 'drop'], 24),
	item('wool-thread', 'Wool Thread', '🧶', 'material', null, [0, 0, 0], 8, null, ['inspect', 'drop'], 20),
	item('prepared-hide', 'Prepared Hide', '🟫', 'material', null, [0, 0, 0], 6, null, ['inspect', 'drop'], 20),
	item('shadow-remnant', 'Shadow Remnant', '🜏', 'material', null, [0, 0, 0], null, null, ['inspect'], 99),
	item('community-badge', 'Community Badge', '🏅', 'accessory', 'accessory', [0, 4, 3], 25, null),
	item('chest-key', 'Old Chest Key', '🗝️', 'quest', null, [0, 0, 0], null, null),
	item('perutas', 'Perutas', '🪙', 'currency', null, [0, 0, 0], null, null, ['inspect'], 9999)
]));

export const INVENTORY_CATALOG = Object.freeze({ ...BASE_CATALOG, ...GARMENT_CATALOG });

export const STARTER_INVENTORY = Object.freeze([
	stack('perutas', 120),
	...['siddur', 'wooden-staff', 'spark-blade', 'chalaf', 'quest-scroll'].map(id => stack(id, 1)),
	...GARMENT_ITEM_IDS.filter(id => !['blue-scholar-glasses', 'velvet-top-hat', 'brown-kapote', 'linen-outer-shirt'].includes(id)).map(id => stack(id, 1))
]);

export function inventoryDefinition(itemId) {
	return INVENTORY_CATALOG[itemId] || null;
}

function item(id, name, icon, category, slot, legacy, price, modelId, actions = ['equip', 'inspect'], stackLimit = 1) {
	return [id, inventoryItem({ actions, category, icon, id, modelId, name, price, slot, stackLimit, stats: { damage: legacy[0], defense: legacy[1], focus: legacy[2] } })];
}

function stack(itemId, quantity) {
	return Object.freeze({ itemId, quantity });
}
