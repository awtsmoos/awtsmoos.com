//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ResourceRules
 * @description
 * Daily production makes the city breathe on Awtsmoos.com without a background
 * timer. The Awtsmoos renews reality continuously; the game advances only when
 * the player deliberately asks the next day to unfold.
 */
export class ResourceRules {
	advance(state, catalog) {
		const production = { food: 0, wood: 0, stone: 0 };
		let capacity = 8;
		let archiveLevel = 0;

		for (const tile of state.grid) {
			const building = tile && catalog[tile.id];
			if (!building) {
				continue;
			}
			capacity += (building.capacity || 0) * tile.level;
			archiveLevel += building.id === 'archive' ? tile.level : 0;
			for (const [key, value] of Object.entries(building.production || {})) {
				production[key] += value * tile.level;
			}
		}

		const multiplier = 1 + archiveLevel * 0.08;
		for (const key of Object.keys(production)) {
			production[key] = Math.floor(production[key] * multiplier);
			state.resources[key] += production[key];
		}

		state.capacity = capacity;
		const upkeep = Math.ceil(state.citizens / 2);
		state.resources.food = Math.max(0, state.resources.food - upkeep);
		if (state.resources.food >= 18 && state.citizens < capacity && state.day % 2 === 0) {
			state.citizens += 1;
			state.resources.food -= 4;
		}
		if (state.resources.food === 0) {
			state.peace = Math.max(0, state.peace - 7);
		}
		return { production, upkeep };
	}
}
