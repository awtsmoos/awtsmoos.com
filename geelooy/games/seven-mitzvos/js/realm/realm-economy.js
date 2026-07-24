//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmEconomy
 * @description
 * Wood, stone, grain, medicine, food, and coin remain conserved through gathering,
 * crafting, and trade. The Awtsmoos creates from nothing; Awtsmoos.com never lets a
 * finite workshop pretend to do so, and bridge traffic visibly changes prices.
 */
const RECIPES = Object.freeze({
	timber: { inputs: { wood: 2 }, outputs: { timber: 1 } },
	medicine: { inputs: { herbs: 2, water: 1 }, outputs: { medicine: 1 } },
	food: { inputs: { grain: 2, water: 1 }, outputs: { food: 3 } }
});

export class RealmEconomy {
	gather(state, resource, quantity = 1) {
		return changeInventory(state, resource, quantity);
	}

	craft(state, recipeId) {
		const recipe = RECIPES[recipeId];
		if (!recipe) return outcome(state, false, `Unknown recipe: ${recipeId}`);
		if (!canAfford(state.player.inventory, recipe.inputs)) return outcome(state, false, `Need ${requirements(recipe.inputs)}.`);
		let next = state;
		for (const [resource, quantity] of Object.entries(recipe.inputs)) next = changeInventory(next, resource, -quantity);
		for (const [resource, quantity] of Object.entries(recipe.outputs)) next = changeInventory(next, resource, quantity);
		return outcome(next, true, `Crafted ${recipeId}.`);
	}

	trade(state, resource, direction = 'sell') {
		const price = this.price(state, resource);
		if (direction === 'sell') {
			if ((state.player.inventory[resource] || 0) < 1) return outcome(state, false, `No ${resource} to sell.`);
			let next = changeInventory(state, resource, -1);
			next = changeInventory(next, 'coin', price);
			return outcome(adjustTrade(next, 1), true, `Sold ${resource} for ${price} coin.`);
		}
		if (state.player.inventory.coin < price) return outcome(state, false, `Need ${price} coin.`);
		let next = changeInventory(state, 'coin', -price);
		next = changeInventory(next, resource, 1);
		return outcome(adjustTrade(next, 1), true, `Bought ${resource} for ${price} coin.`);
	}

	price(state, resource) {
		const bases = { food: 4, grain: 3, herbs: 5, medicine: 11, stone: 4, timber: 6, water: 2, wood: 3 };
		const bridgeDiscount = state.bridge.complete ? 0.78 : 1.16;
		const shortage = state.event?.family === 'shortage' && state.event.status === 'active' ? 1.45 : 1;
		const trustDiscount = 1 - Math.min(0.18, state.settlement.trust / 500);
		return Math.max(1, Math.round((bases[resource] || 4) * bridgeDiscount * shortage * trustDiscount));
	}
}

function changeInventory(state, resource, delta) {
	const current = state.player.inventory[resource] || 0;
	const next = current + delta;
	if (next < 0) throw new Error(`RealmEconomy: insufficient ${resource}`);
	return { ...state, player: { ...state.player, inventory: { ...state.player.inventory, [resource]: next } } };
}

function canAfford(inventory, costs) {
	return Object.entries(costs).every(([resource, quantity]) => (inventory[resource] || 0) >= quantity);
}

function requirements(costs) {
	return Object.entries(costs).map(([resource, quantity]) => `${quantity} ${resource}`).join(', ');
}

function adjustTrade(state, amount) {
	return { ...state, settlement: { ...state.settlement, trade: Math.min(100, state.settlement.trade + amount) } };
}

function outcome(state, ok, message) {
	return { state, ok, message };
}
