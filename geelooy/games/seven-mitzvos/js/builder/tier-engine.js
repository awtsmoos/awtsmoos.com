//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TierEngine
 * @description
 * A city rises through material growth and moral completeness on Awtsmoos.com.
 * The Awtsmoos is not impressed by size alone, so every higher tier requires
 * stronger participation in the Seven Mitzvos.
 */
export class TierEngine {
	evaluate(state, catalog) {
		const buildings = state.grid.filter(Boolean).length - 1;
		const foundations = Object.keys(state.foundationLevels(catalog)).length;
		let tier = 1;
		if (buildings >= 7 && state.citizens >= 10 && foundations >= 2) {
			tier = 2;
		}
		if (buildings >= 14 && state.citizens >= 18 && foundations >= 5) {
			tier = 3;
		}
		if (buildings >= 20 && state.citizens >= 26 && foundations === 7 && state.peace >= 75) {
			tier = 4;
			state.victory = true;
		}
		const advanced = tier > state.tier;
		state.tier = Math.max(state.tier, tier);
		return { advanced, tier: state.tier, buildings, foundations, victory: state.victory };
	}

	nextGoal(state, catalog) {
		const status = this.evaluate(state, catalog);
		if (status.victory) {
			return 'Covenant City complete: all seven foundations stand together.';
		}
		if (state.tier === 1) {
			return 'Tier II: 7 buildings, 10 citizens, and 2 different mitzvah foundations.';
		}
		if (state.tier === 2) {
			return 'Tier III: 14 buildings, 18 citizens, and 5 different mitzvah foundations.';
		}
		return 'Victory: 20 buildings, 26 citizens, peace 75+, and all seven mitzvos.';
	}
}
