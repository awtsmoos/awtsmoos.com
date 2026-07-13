// B"H
// Boruch Hashem
// Blessed is He

/** Awtsmoos.com preserves six proven districts as anchors inside the larger revelation. */
export const LEGACY_ANCHORS = Object.freeze({
	0: anchor(7701, 42, 1900, 100, 390, 4, 0.86,
		{ letter: 24, stone: 17, scroll: 12, bollard: 10, bench: 9, planter: 8, streetSign: 7, streetLamp: 5, kiosk: 4, car: 6, townhouse: 3, shop: 3, timeOrb: 1 },
		bonus('street', 16, 'Clear 16 street vessels')),
	20: anchor(7702, 188, 2150, 108, 570, 5, 0.98,
		{ letter: 10, stone: 8, bench: 9, planter: 8, streetLamp: 8, marketCart: 13, kiosk: 10, car: 8, taxi: 6, van: 4, shop: 5, magnetOrb: 1 },
		bonus('vehicle', 8, 'Swallow 8 vehicles')),
	80: anchor(7703, 302, 2350, 114, 780, 6, 1.08,
		{ planter: 13, hedge: 14, tree: 18, bench: 9, streetLamp: 8, fountain: 7, townhouse: 7, shop: 4, car: 6, taxi: 4, surgeOrb: 1 },
		bonus('nature', 22, 'Gather 22 garden forms')),
	100: anchor(7704, 4, 2550, 120, 1080, 7, 1.18,
		{ bollard: 6, streetSign: 7, streetLamp: 7, kiosk: 7, car: 12, taxi: 8, van: 7, bus: 5, truck: 4, townhouse: 13, shop: 12, tower: 5, timeOrb: 1 },
		bonus('vehicle', 18, 'Consume 18 moving vehicles')),
	140: anchor(7705, 224, 2800, 126, 1480, 8, 1.24,
		{ planter: 5, streetLamp: 6, fountain: 7, townhouse: 9, shop: 9, studyHall: 11, tower: 10, monument: 8, palace: 5, bus: 5, truck: 5, magnetOrb: 1 },
		bonus('building', 16, 'Reveal 16 structures')),
	160: anchor(7706, 52, 3100, 132, 2050, 9, 1.3,
		{ streetLamp: 4, fountain: 5, car: 10, taxi: 9, van: 7, bus: 7, truck: 7, townhouse: 8, shop: 9, studyHall: 10, tower: 13, monument: 9, palace: 7, surgeOrb: 1 },
		bonus('landmark', 8, 'Consume 8 great landmarks'))
});

function anchor(seed, hue, bounds, time, targetMass, rivals, density, weights, mission) {
	return Object.freeze({ seed, hue, bounds, time, targetMass, rivals, density, weights: Object.freeze(weights), bonus: mission });
}

function bonus(category, target, label) {
	return Object.freeze({ category, target, label });
}
