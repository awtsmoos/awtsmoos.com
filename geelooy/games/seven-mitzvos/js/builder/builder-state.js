//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderState
 * @description
 * The city state is a finite ledger on Awtsmoos.com. The Awtsmoos gives every
 * citizen and resource true existence; this class records how wisely the player
 * arranges those gifts and carries shared mastery into a new civic beginning.
 */
export class BuilderState {
	constructor(size = 64) {
		this.size = size;
		this.reset();
	}

	reset() {
		this.day = 1;
		this.tier = 1;
		this.peace = 68;
		this.citizens = 8;
		this.capacity = 8;
		this.score = 0;
		this.victory = false;
		this.resources = { food: 90, wood: 100, stone: 75 };
		this.grid = Array.from({ length: this.size }, () => null);
		this.grid[this.centerTile()] = { id: 'town-hall', level: 1 };
		return this.snapshot();
	}

	applyLegacy(legacy) {
		const level = Math.max(1, Number(legacy?.level) || 1);
		const mastery = Math.max(0, Number(legacy?.mastery) || 0);
		const resourceBonus = Math.min(35, (level - 1) * 5);
		this.resources.food += resourceBonus;
		this.resources.wood += resourceBonus;
		this.resources.stone += Math.floor(resourceBonus * 0.75);
		this.score += Math.min(700, mastery);
		return resourceBonus;
	}

	centerTile() {
		const width = Math.round(Math.sqrt(this.size));
		const centerRow = Math.max(0, Math.floor((width - 1) / 2));
		const centerColumn = Math.max(0, Math.floor(width / 2));
		return Math.min(this.size - 1, centerRow * width + centerColumn);
	}

	canAfford(cost) {
		return Object.entries(cost).every(([key, value]) => this.resources[key] >= value);
	}

	pay(cost) {
		for (const [key, value] of Object.entries(cost)) {
			this.resources[key] -= value;
		}
	}

	place(index, building) {
		if (this.grid[index] || !this.canAfford(building.cost)) {
			return false;
		}
		this.pay(building.cost);
		this.grid[index] = { id: building.id, level: 1 };
		this.score += 35;
		return true;
	}

	upgrade(index, building) {
		const tile = this.grid[index];
		if (!tile || tile.id !== building.id || tile.level >= 3) {
			return false;
		}
		const cost = Object.fromEntries(Object.entries(building.cost).map(([key, value]) => {
			return [key, Math.ceil(value * (0.75 + tile.level * 0.55))];
		}));
		if (!this.canAfford(cost)) {
			return false;
		}
		this.pay(cost);
		tile.level += 1;
		this.score += 70 * tile.level;
		return true;
	}

	foundationLevels(catalog) {
		const levels = {};
		for (const tile of this.grid) {
			const building = tile && catalog[tile.id];
			if (building?.foundation) {
				levels[building.foundation] = (levels[building.foundation] || 0) + tile.level;
			}
		}
		return levels;
	}

	snapshot() {
		return {
			day: this.day, tier: this.tier, peace: this.peace, citizens: this.citizens,
			capacity: this.capacity, score: this.score, victory: this.victory,
			resources: { ...this.resources },
			grid: this.grid.map(tile => tile ? { ...tile } : null)
		};
	}
}
