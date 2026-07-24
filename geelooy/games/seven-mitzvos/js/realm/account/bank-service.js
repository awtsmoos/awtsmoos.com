//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BankService
 * @description
 * A chest protects finite ownership without dissolving geography. The Awtsmoos
 * owns all without division; Awtsmoos.com moves every coin, herb, hammer, and coat
 * through explicit conservation so storage can never become a hidden creation gate.
 */
export class BankService {
	depositStack(state, resource, quantity = 1) {
		const carried = state.player.inventory[resource] || 0;
		const amount = Math.min(carried, Math.max(1, quantity));
		if (!amount) return result(state, false, `No ${resource} to deposit.`);
		if (!state.bank.stacks[resource] && this.used(state) >= state.bank.capacity) return result(state, false, 'The bank is full.');
		const inventory = { ...state.player.inventory, [resource]: carried - amount };
		const stacks = { ...state.bank.stacks, [resource]: (state.bank.stacks[resource] || 0) + amount };
		return result({ ...state, player: { ...state.player, inventory }, bank: { ...state.bank, stacks } }, true, `Deposited ${amount} ${resource}.`);
	}

	withdrawStack(state, resource, quantity = 1) {
		const stored = state.bank.stacks[resource] || 0;
		const amount = Math.min(stored, Math.max(1, quantity));
		if (!amount) return result(state, false, `No ${resource} is banked.`);
		const stacks = { ...state.bank.stacks, [resource]: stored - amount };
		if (!stacks[resource]) delete stacks[resource];
		const inventory = { ...state.player.inventory, [resource]: (state.player.inventory[resource] || 0) + amount };
		return result({ ...state, player: { ...state.player, inventory }, bank: { ...state.bank, stacks } }, true, `Withdrew ${amount} ${resource}.`);
	}

	depositItem(state, itemId) {
		if (!state.player.itemIds.includes(itemId)) return result(state, false, 'That item is not carried.');
		if (Object.values(state.equipment).includes(itemId)) return result(state, false, 'Unequip the item before banking it.');
		if (this.used(state) >= state.bank.capacity) return result(state, false, 'The bank is full.');
		const itemIds = state.player.itemIds.filter(id => id !== itemId);
		return result({ ...state, player: { ...state.player, itemIds }, bank: { ...state.bank, itemIds: [...state.bank.itemIds, itemId] } }, true, 'Item deposited.');
	}

	withdrawItem(state, itemId) {
		if (!state.bank.itemIds.includes(itemId)) return result(state, false, 'That item is not banked.');
		return result({
			...state,
			player: { ...state.player, itemIds: [...state.player.itemIds, itemId] },
			bank: { ...state.bank, itemIds: state.bank.itemIds.filter(id => id !== itemId) }
		}, true, 'Item withdrawn.');
	}

	used(state) {
		return Object.keys(state.bank.stacks).length + state.bank.itemIds.length;
	}
}

function result(state, ok, message) {
	return { state, ok, message };
}
