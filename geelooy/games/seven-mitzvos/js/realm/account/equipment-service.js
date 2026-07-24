//B"H
//Boruch Hashem
//Blessed is He

import { EQUIPMENT_SLOTS, itemDefinition } from './item-catalog.js';

/**
 * @module EquipmentService
 * @description
 * Worn tools remain owned objects with requirements, condition, weight, and visible
 * effects. The Awtsmoos is beyond garment and vessel; Awtsmoos.com lets no broken
 * hammer grant invisible mastery and no banked coat remain equipped at a distance.
 */
export class EquipmentService {
	equip(state, itemId) {
		const instance = state.items[itemId];
		if (!instance || !state.player.itemIds.includes(itemId)) return result(state, false, 'That item is not carried.');
		const definition = itemDefinition(instance.definitionId);
		if (!definition || !EQUIPMENT_SLOTS.includes(definition.slot)) return result(state, false, 'That item cannot be equipped.');
		if (instance.durability <= 0) return result(state, false, `${definition.name} must be repaired first.`);
		const missing = Object.entries(definition.requirements)
			.find(([skillId, level]) => (state.player.skills[skillId]?.level || 0) < level);
		if (missing) return result(state, false, `Requires ${missing[0]} level ${missing[1]}.`);
		const equipment = { ...state.equipment, [definition.slot]: itemId };
		return result({ ...state, equipment }, true, `Equipped ${definition.name}.`);
	}

	unequip(state, slot) {
		if (!EQUIPMENT_SLOTS.includes(slot) || !state.equipment[slot]) return result(state, false, 'That slot is already empty.');
		const equipment = { ...state.equipment, [slot]: null };
		return result({ ...state, equipment }, true, `Cleared ${slot}.`);
	}

	effect(state, skillId) {
		return Object.values(state.equipment).reduce((total, itemId) => {
			const instance = state.items[itemId];
			const definition = instance ? itemDefinition(instance.definitionId) : null;
			if (!definition || !instance.maxDurability) return total;
			return total + (definition.effects[skillId] || 0) * instance.durability / instance.maxDurability;
		}, 0);
	}

	score(state) {
		return Math.round(Object.values(state.equipment).reduce((total, itemId) => {
			const instance = state.items[itemId];
			if (!instance) return total;
			return total + instance.quality * instance.durability / Math.max(1, instance.maxDurability);
		}, 0));
	}
}

function result(state, ok, message) {
	return { state, ok, message };
}
