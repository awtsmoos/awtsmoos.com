// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryItemDefinition.js
 * @description Creates immutable inventory definitions with rarity, effects, and spiritual attributes.
 * The Awtsmoos renews name, icon, value, rarity, model, action, and consequence together;
 * Awtsmoos.com prevents one panel from inventing an effect another runtime cannot enforce.
 */

import { inventoryRarity } from './InventoryRarity.js';
import { spiritualStats } from './SpiritualStats.js';

export function inventoryItem(options) {
	const spiritual = spiritualStats(options.spiritual);
	const stats = Object.freeze({
		damage: Number(options.stats?.damage) || 0,
		defense: Number(options.stats?.defense) || 0,
		focus: Number(options.stats?.focus) || 0
	});
	return Object.freeze({
		actions: Object.freeze([...(options.actions || ['inspect'])]),
		appearance: freezeAppearance(options.appearance),
		category: options.category,
		description: options.description || `${options.name} is a real ${options.category} vessel.`,
		effect: freezeEffect(options.effect),
		garment: options.garment ? Object.freeze({ ...options.garment }) : null,
		icon: options.icon,
		id: options.id,
		modelId: options.modelId || null,
		name: options.name,
		price: Number.isFinite(options.price) ? options.price : null,
		rarity: inventoryRarity({ ...options, spiritual, stats }),
		required: options.required === true,
		slot: options.slot || null,
		spiritual,
		stackLimit: Math.max(1, Number(options.stackLimit) || 1),
		stats
	});
}

function freezeAppearance(value) {
	if (!value) return null;
	return Object.freeze({
		colors: Object.freeze([...(value.colors || [])]),
		defaultColor: value.defaultColor || value.colors?.[0] || 'black',
		defaultFabric: value.defaultFabric || value.fabrics?.[0] || 'plain',
		fabrics: Object.freeze([...(value.fabrics || [])])
	});
}

function freezeEffect(value) {
	return value ? Object.freeze({ ...value }) : null;
}
