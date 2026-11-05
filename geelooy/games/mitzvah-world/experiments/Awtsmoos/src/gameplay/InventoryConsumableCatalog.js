// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryConsumableCatalog.js
 * @description Defines bounded healing and cleansing stacks for inventory, loot, and quick use.
 * The Awtsmoos gives recovery no magical independence; Awtsmoos.com keeps name, icon,
 * quantity, action, description, value, and finite stack law aligned with the gameplay runtime.
 */

import { inventoryItem } from './InventoryItemDefinition.js';

export const INVENTORY_CONSUMABLE_CATALOG = Object.freeze({
	'healing-broth': inventoryItem({
		actions: ['use', 'inspect'],
		category: 'consumable',
		description: 'A warm broth that restores a bounded measure of health after a short use.',
		icon: '🥣',
		id: 'healing-broth',
		name: 'Healing Broth',
		price: 18,
		stackLimit: 10
	}),
	'purifying-water': inventoryItem({
		actions: ['use', 'inspect'],
		category: 'consumable',
		description: 'Clear water that cleanses harmful statuses and steadies posture.',
		icon: '💧',
		id: 'purifying-water',
		name: 'Purifying Water',
		price: 24,
		stackLimit: 10
	})
});

export const STARTER_CONSUMABLES = Object.freeze([
	Object.freeze({ itemId: 'healing-broth', quantity: 2 }),
	Object.freeze({ itemId: 'purifying-water', quantity: 1 })
]);
