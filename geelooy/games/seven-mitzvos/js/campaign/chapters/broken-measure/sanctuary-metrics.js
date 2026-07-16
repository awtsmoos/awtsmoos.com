//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrokenMeasureSanctuaryMetrics
 * @description
 * Welfare on Awtsmoos.com is measured without allowing the crowd to hide one
 * collapsing life. The Awtsmoos holds every creature distinctly; both the whole
 * sanctuary and its weakest value remain visible in result and interface.
 */
export function sanctuaryWelfare(state) {
	const values = state.animals.flatMap(animal => [animal.hunger, animal.health, animal.calm]);
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function weakestSanctuaryValue(state) {
	return Math.min(...state.animals.flatMap(animal => [animal.hunger, animal.health, animal.calm]));
}

export function updateSanctuaryEnd(state) {
	const weakest = weakestSanctuaryValue(state);
	state.ended = state.day > state.totalDays || weakest <= 0;
	state.won = state.ended && weakest > 0 && state.animals.every(animal => animal.hunger >= 18);
	if (state.ended) {
		state.score += Math.round(sanctuaryWelfare(state) * 15 + weakest * 8);
	}
}

export function sanctuaryResult(state) {
	const weakest = weakestSanctuaryValue(state);
	return {
		completed: state.ended,
		animalsMaintained: weakest > 0 && state.animals.every(animal => animal.hunger >= 18),
		habitatDelayed: state.habitatDelayed,
		sanctuaryWelfare: Math.round(sanctuaryWelfare(state)),
		publicTrustProtected: state.publicTrustProtected,
		inventoryRecordCreated: state.inventoryRecordCreated,
		weakestAnimal: weakest
	};
}

export function sanctuarySnapshot(state, strategies) {
	return {
		animals: state.animals.map(animal => ({ ...animal })),
		day: state.day,
		totalDays: state.totalDays,
		habitat: state.habitat,
		capacity: state.capacity,
		actions: state.actions,
		resources: { ...state.resources },
		rescued: state.rescued,
		reserve: 0,
		welfare: sanctuaryWelfare(state),
		weakest: weakestSanctuaryValue(state),
		strategies,
		strategyId: state.strategyId,
		score: state.score,
		ended: state.ended,
		won: state.won
	};
}
