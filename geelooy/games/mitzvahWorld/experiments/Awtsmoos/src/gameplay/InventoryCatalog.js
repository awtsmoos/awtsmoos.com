// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryCatalog.js
 * @description Composes core, material, reward, garment, amulet, and consumable definitions.
 * The Awtsmoos unites many carried vessels without erasing their responsibilities;
 * Awtsmoos.com keeps starter ownership, recovery quantities, and every later lookup stable and inspectable.
 */

import { GARMENT_CATALOG, GARMENT_ITEM_IDS } from './GarmentCatalog.js';
import { HEALING_AMULET_CATALOG } from './HealingAmuletCatalog.js';
import {
	INVENTORY_CONSUMABLE_CATALOG,
	STARTER_CONSUMABLES
} from './InventoryConsumableCatalog.js';
import { INVENTORY_CORE_CATALOG } from './InventoryCoreCatalog.js';
import { INVENTORY_MATERIAL_CATALOG } from './InventoryMaterialCatalog.js';
import { INVENTORY_REWARD_CATALOG } from './InventoryRewardCatalog.js';

export const INVENTORY_CATALOG = Object.freeze({
	...INVENTORY_CORE_CATALOG,
	...INVENTORY_MATERIAL_CATALOG,
	...INVENTORY_REWARD_CATALOG,
	...HEALING_AMULET_CATALOG,
	...INVENTORY_CONSUMABLE_CATALOG,
	...GARMENT_CATALOG
});

export const STARTER_INVENTORY = Object.freeze([
	stack('perutas', 120),
	...starterToolsAndBooks().map(itemId => stack(itemId, 1)),
	...STARTER_CONSUMABLES.map(entry => stack(entry.itemId, entry.quantity)),
	...starterGarments().map(itemId => stack(itemId, 1))
]);

export function inventoryDefinition(itemId) {
	return INVENTORY_CATALOG[itemId] || null;
}

function starterToolsAndBooks() {
	return [
		'siddur',
		'wooden-staff',
		'spark-blade',
		'chalaf',
		'quest-scroll'
	];
}

function starterGarments() {
	const excluded = new Set([
		'blue-scholar-glasses',
		'velvet-top-hat',
		'brown-kapote',
		'linen-outer-shirt'
	]);
	return GARMENT_ITEM_IDS.filter(itemId => !excluded.has(itemId));
}

function stack(itemId, quantity) {
	return Object.freeze({ itemId, quantity });
}
