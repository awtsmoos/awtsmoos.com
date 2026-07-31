// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletCatalog.js
 * @description Defines three respectful fictional healing amulets inspired by historical Jewish forms.
 * The Awtsmoos is beyond every written vessel; Awtsmoos.com remembers expert certification,
 * roots, parchment, and witnessed practice without presenting a game effect as real-world medicine.
 */

import { inventoryItem } from './InventoryItemDefinition.js';

export const HEALING_AMULET_IDS = Object.freeze([
	'written-healing-kamea',
	'root-herb-kamea',
	'kamea-mumcheh'
]);

export const HEALING_AMULET_CATALOG = Object.freeze(Object.fromEntries([
	amulet({
		healing: 22,
		icon: '📜',
		id: 'written-healing-kamea',
		name: 'Kamea Shel Ketav',
		price: 24,
		stackLimit: 6,
		tradition: 'written'
	}),
	amulet({
		healing: 38,
		icon: '🌿',
		id: 'root-herb-kamea',
		name: 'Kamea Shel Ikkarin',
		price: 42,
		stackLimit: 4,
		tradition: 'roots-and-herbs'
	}),
	amulet({
		certifiedUses: 3,
		healing: 62,
		icon: '🧿',
		id: 'kamea-mumcheh',
		name: 'Kamea Mumcheh',
		price: 75,
		stackLimit: 3,
		tradition: 'expert-certified'
	})
]));

export function healingAmuletDefinition(itemId) {
	return HEALING_AMULET_CATALOG[itemId] || null;
}

function amulet(options) {
	const certification = options.certifiedUses
		? ` Its game-world expert certification records ${options.certifiedUses} witnessed successes.`
		: '';
	return [options.id, inventoryItem({
		actions: ['use', 'inspect'],
		category: 'amulet',
		description: `A fictional Mitzvah World healing amulet based on the ${options.tradition} historical form.${certification} It is not medical advice or a real treatment.`,
		effect: {
			certifiedUses: options.certifiedUses || 0,
			healing: options.healing,
			tradition: options.tradition,
			type: 'heal'
		},
		icon: options.icon,
		id: options.id,
		name: options.name,
		price: options.price,
		stackLimit: options.stackLimit,
		stats: {},
		spiritual: { chesed: Math.ceil(options.healing / 10) }
	})];
}
