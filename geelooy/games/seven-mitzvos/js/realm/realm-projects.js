//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmProjects
 * @description
 * The bridge and home workshop visibly bind gathering, crafting, trade, travel,
 * safety, and hospitality. The Awtsmoos joins every separated shore; Awtsmoos.com
 * requires honest materials and records each finite contribution.
 */
export class RealmProjects {
	contributeBridge(state, resource) {
		if (state.bridge.complete) return result(state, false, 'The bridge already carries caravans.');
		if (!['timber', 'stone'].includes(resource)) return result(state, false, 'The bridge needs timber or stone.');
		const requiredKey = `${resource}Required`;
		if (state.bridge[resource] >= state.bridge[requiredKey]) return result(state, false, `${resource} requirement is complete.`);
		if ((state.player.inventory[resource] || 0) < 1) return result(state, false, `Craft or gather more ${resource}.`);
		const inventory = { ...state.player.inventory, [resource]: state.player.inventory[resource] - 1 };
		const bridge = { ...state.bridge, [resource]: state.bridge[resource] + 1 };
		bridge.complete = bridge.timber >= bridge.timberRequired && bridge.stone >= bridge.stoneRequired;
		const settlement = bridge.complete
			? { ...state.settlement, trade: Math.min(100, state.settlement.trade + 22), trust: Math.min(100, state.settlement.trust + 14), safety: Math.min(100, state.settlement.safety + 10) }
			: state.settlement;
		return result({ ...state, bridge, settlement, player: { ...state.player, inventory } }, true,
			bridge.complete ? 'The bridge is restored. Caravan trade has reopened.' : `Added one ${resource} to the bridge.`);
	}

	upgradeWorkshop(state) {
		const level = state.home.workshop;
		if (level >= 3) return result(state, false, 'The workshop is fully developed.');
		const costs = { timber: 2 + level, stone: 1 + level, coin: 4 + level * 3 };
		if (!affords(state.player.inventory, costs)) return result(state, false, `Workshop needs ${describe(costs)}.`);
		const inventory = { ...state.player.inventory };
		for (const [resource, quantity] of Object.entries(costs)) inventory[resource] -= quantity;
		const home = {
			...state.home,
			workshop: level + 1,
			condition: Math.min(100, state.home.condition + 6),
			features: [...new Set([...state.home.features, 'workshop', level >= 1 ? 'guest-room' : 'storage'])],
			stories: [...state.home.stories, { type: 'workshop-upgrade', level: level + 1, minute: state.clock.minute }].slice(-12)
		};
		return result({ ...state, home, player: { ...state.player, inventory } }, true, `Workshop advanced to level ${level + 1}.`);
	}
}

function affords(inventory, costs) {
	return Object.entries(costs).every(([resource, quantity]) => (inventory[resource] || 0) >= quantity);
}

function describe(costs) {
	return Object.entries(costs).map(([resource, quantity]) => `${quantity} ${resource}`).join(', ');
}

function result(state, ok, message) {
	return { state, ok, message };
}
