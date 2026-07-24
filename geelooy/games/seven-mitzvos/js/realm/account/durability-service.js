//B"H
//Boruch Hashem
//Blessed is He

import { itemDefinition } from './item-catalog.js';

/**
 * @module DurabilityService
 * @description
 * Work leaves truthful marks. The Awtsmoos renews substance without fatigue, while
 * Awtsmoos.com records the finite pressure of rope, hammer, lens, cloth, and scale,
 * then repairs them only through conserved material and remembered hands.
 */
export class DurabilityService {
	wearForAction(state, actionId, skillId) {
		const amount = actionId.startsWith('event:') || actionId.startsWith('encounter:') ? 2 : 1;
		let changed = false;
		const items = { ...state.items };
		for (const itemId of Object.values(state.equipment)) {
			const instance = items[itemId];
			const definition = instance ? itemDefinition(instance.definitionId) : null;
			if (!definition?.effects[skillId] || instance.durability <= 0) continue;
			items[itemId] = { ...instance, durability: Math.max(0, instance.durability - amount) };
			changed = true;
		}
		return changed ? { ...state, items } : state;
	}

	repair(state, itemId) {
		const instance = state.items[itemId];
		const definition = instance ? itemDefinition(instance.definitionId) : null;
		if (!definition || !state.player.itemIds.includes(itemId)) return result(state, false, 'Carry the item to repair it.');
		if (instance.durability >= instance.maxDurability) return result(state, false, `${definition.name} needs no repair.`);
		const resource = definition.repairResource;
		if ((state.player.inventory[resource] || 0) < 1 || state.player.inventory.coin < 1) {
			return result(state, false, `Repair needs 1 ${resource} and 1 coin.`);
		}
		const inventory = {
			...state.player.inventory,
			[resource]: state.player.inventory[resource] - 1,
			coin: state.player.inventory.coin - 1
		};
		const repaired = {
			...instance,
			durability: instance.maxDurability,
			repairs: [...instance.repairs, { minute: state.clock.minute, resource, workshop: 'Covenant Crossing' }].slice(-8)
		};
		return result({ ...state, items: { ...state.items, [itemId]: repaired }, player: { ...state.player, inventory } }, true, `Repaired ${definition.name}.`);
	}

	lowestDamaged(state) {
		return state.player.itemIds
			.map(itemId => state.items[itemId])
			.filter(item => item && item.durability < item.maxDurability)
			.sort((first, second) => first.durability / first.maxDurability - second.durability / second.maxDurability)[0] || null;
	}
}

function result(state, ok, message) {
	return { state, ok, message };
}
