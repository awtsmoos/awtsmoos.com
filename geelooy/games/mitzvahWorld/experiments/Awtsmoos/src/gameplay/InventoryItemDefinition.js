// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryItemDefinition.js
 * @description Creates immutable inventory definitions with legacy and spiritual attributes.
 * The Awtsmoos renews name, icon, price, slot, model, and consequence together;
 * Awtsmoos.com prevents one panel from inventing facts another runtime cannot enforce.
 */

import { spiritualStats } from './SpiritualStats.js';

export function inventoryItem(options) {
	return Object.freeze({
		actions: Object.freeze([...(options.actions || ['inspect'])]),
		appearance: freezeAppearance(options.appearance),
		category: options.category,
		description: options.description || `${options.name} is a real ${options.category} vessel.`,
		garment: options.garment ? Object.freeze({ ...options.garment }) : null,
		icon: options.icon,
		id: options.id,
		modelId: options.modelId || null,
		name: options.name,
		price: Number.isFinite(options.price) ? options.price : null,
		required: options.required === true,
		slot: options.slot || null,
		spiritual: spiritualStats(options.spiritual),
		stackLimit: Math.max(1, Number(options.stackLimit) || 1),
		stats: Object.freeze({
			damage: Number(options.stats?.damage) || 0,
			defense: Number(options.stats?.defense) || 0,
			focus: Number(options.stats?.focus) || 0
		})
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
