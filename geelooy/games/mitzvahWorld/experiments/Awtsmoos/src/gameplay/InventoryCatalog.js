// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryCatalog.js
 * @description Defines tools, weapons, shields, books, clothing, materials, and quest items.
 * The Awtsmoos renews every carried vessel beneath explicit ownership and equipment law;
 * Awtsmoos.com keeps canonical IDs, slots, actions, stats, prices, and models inspectable.
 */

export const INVENTORY_CATALOG = Object.freeze({
	'forest-axe': item('forest-axe', 'Forest Axe', '🪓', 'tool', 'tool', ['equip', 'inspect'], stats(5, 0, 2), 45, 'axe-small'),
	'wooden-staff': item('wooden-staff', 'Wooden Staff', '🪄', 'weapon', 'hand', ['equip', 'inspect'], stats(18, 2, 4), 32, 'wooden-staff'),
	'spark-blade': item('spark-blade', 'Spark Blade', '⚔️', 'weapon', 'hand', ['equip', 'inspect'], stats(26, 4, 1), 110, 'sword'),
	'village-shield': item('village-shield', 'Village Shield', '🛡️', 'shield', 'offhand', ['equip', 'inspect'], stats(0, 10, 0), 75, 'shield'),
	'chalaf': item('chalaf', 'Chalaf', '🔪', 'tool', 'tool', ['equip', 'inspect'], stats(8, 0, 1), 40, null),
	'siddur': item('siddur', 'Siddur', '📖', 'book', 'book', ['open', 'pin', 'inspect'], stats(0, 4, 5), 10, 'book'),
	'chumash-light': item('chumash-light', 'Chumash of Light', '📚', 'book', 'book', ['open', 'pin', 'inspect'], stats(0, 7, 8), 55, 'book'),
	'tanya-pocket': item('tanya-pocket', 'Pocket Tanya', '📕', 'book', 'book', ['open', 'pin', 'inspect'], stats(0, 8, 6), 65, 'book'),
	'quest-scroll': item('quest-scroll', 'Shlichus Scroll', '📜', 'quest', null, ['open', 'pin', 'inspect'], stats(0, 0, 0), null, 'scroll'),
	'lost-scroll': item('lost-scroll', 'Lost Stream Scroll', '📜', 'quest', null, ['inspect'], stats(0, 0, 0), null, 'scroll'),
	'wood-log': item('wood-log', 'Fallen Wood', '🪵', 'material', null, ['inspect', 'drop'], stats(0, 0, 0), 4, null, 20),
	'cottage-flower': item('cottage-flower', 'Cottage Flower', '🌸', 'material', null, ['inspect', 'drop'], stats(0, 0, 0), 3, null, 24),
	'wool-thread': item('wool-thread', 'Wool Thread', '🧶', 'material', null, ['inspect', 'drop'], stats(0, 0, 0), 8, null, 20),
	'prepared-hide': item('prepared-hide', 'Prepared Hide', '🟫', 'material', null, ['inspect', 'drop'], stats(0, 0, 0), 6, null, 20),
	'community-badge': item('community-badge', 'Community Badge', '🏅', 'accessory', 'accessory', ['equip', 'inspect'], stats(0, 4, 3), 25, null),
	'black-coat': item('black-coat', 'Black Shabbos Coat', '🧥', 'clothing', 'coat', ['equip', 'inspect'], stats(0, 6, 2), 80, null),
	'wool-kippah': item('wool-kippah', 'Wool Kippah', '⚫', 'clothing', 'head', ['equip', 'inspect'], stats(0, 3, 3), 25, null),
	'walking-boots': item('walking-boots', 'Walking Boots', '🥾', 'clothing', 'feet', ['equip', 'inspect'], stats(0, 2, 1), 42, null),
	'chest-key': item('chest-key', 'Old Chest Key', '🗝️', 'quest', null, ['inspect'], stats(0, 0, 0), null, null),
	'perutas': item('perutas', 'Perutas', '🪙', 'currency', null, ['inspect'], stats(0, 0, 0), null, null, 9999)
});

export const STARTER_INVENTORY = Object.freeze([
	stack('perutas', 120),
	stack('siddur', 1),
	stack('wooden-staff', 1),
	stack('chalaf', 1),
	stack('quest-scroll', 1),
	stack('black-coat', 1)
]);

export function inventoryDefinition(itemId) {
	return INVENTORY_CATALOG[itemId] || null;
}

function item(id, name, icon, category, slot, actions, statValue, price, modelId, stackLimit = 1) {
	return Object.freeze({ actions: Object.freeze(actions), category, description: descriptionFor(name, category), icon, id, modelId, name, price, slot, stackLimit, stats: Object.freeze(statValue) });
}

function stats(damage, defense, focus) {
	return { damage, defense, focus };
}

function stack(itemId, quantity) {
	return Object.freeze({ itemId, quantity });
}

function descriptionFor(name, category) {
	return `${name} is a ${category} vessel with server-owned effects in shared worlds.`;
}
