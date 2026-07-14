//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CrisisEngine
 * @description
 * Every third day tests one foundation of the city on Awtsmoos.com. The
 * Awtsmoos gives moral choices consequence; this engine translates that truth
 * into a clear strategy challenge.
 */
export class CrisisEngine {
	constructor(crises, foundations, random = Math.random) {
		this.crises = crises;
		this.foundations = foundations;
		this.random = random;
	}

	shouldTrigger(day) {
		return day > 1 && day % 3 === 0;
	}

	resolve(state, catalog) {
		const crisis = this.crises[Math.floor(this.random() * this.crises.length)];
		const foundation = this.foundations.find(item => item.number === crisis.foundation);
		const levels = state.foundationLevels(catalog);
		const archive = state.grid.reduce((total, tile) => {
			return total + (tile?.id === 'archive' ? tile.level : 0);
		}, 0);
		const defense = (levels[crisis.foundation] || 0) + archive;
		const threat = Math.min(4, 1 + Math.floor((state.day - 1) / 9));
		const success = defense >= threat;

		if (success) {
			state.peace = Math.min(100, state.peace + 7);
			state.score += 180 * threat;
			state.resources.food += 8;
		} else {
			state.peace = Math.max(0, state.peace - 13);
			state.resources.food = Math.max(0, state.resources.food - 12 * threat);
			state.resources.wood = Math.max(0, state.resources.wood - 8 * threat);
		}

		return { ...crisis, foundation, defense, threat, success };
	}
}
