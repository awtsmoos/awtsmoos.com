// B"H
// Boruch Hashem
// Blessed is He

/**
 * Awtsmoos.com reveals ten campaign climates through one stable arena contract.
 * Botanical weights now change ecology and progression rather than merely hue.
 */
export const CHAPTERS = Object.freeze([
	chapter('malchus', 'Malchus', 'Kingdom of grounded sparks', 28, 1900, 96, 390, 4, 0.86,
		weights({ letter: 18, daisy: 10, grass: 8, stone: 15, scroll: 10, bollard: 9, bench: 8, planter: 7, streetSign: 7, streetLamp: 5, kiosk: 4, car: 6, townhouse: 3, shop: 3 }),
		['street', 'small', 'botanical'], 'Foundation Guardian'),
	chapter('yesod', 'Yesod', 'Foundation of motion and reflection', 190, 2100, 100, 560, 4, 0.92,
		weights({ letter: 8, iris: 10, hosta: 7, hydrangea: 6, stone: 7, bench: 7, planter: 6, streetLamp: 7, marketCart: 12, kiosk: 9, car: 9, taxi: 8, van: 5, shop: 5, willow: 4 }),
		['vehicle', 'street', 'botanical'], 'Moonlit Conductor'),
	chapter('hod', 'Hod', 'Splendor of language and measured echoes', 38, 2250, 102, 700, 5, 0.97,
		weights({ letter: 15, scroll: 13, rose: 7, flowerSpike: 6, stone: 6, bench: 8, streetSign: 12, streetLamp: 9, kiosk: 8, car: 7, taxi: 5, townhouse: 7, studyHall: 4 }),
		['small', 'street', 'building'], 'Archive Colossus'),
	chapter('netzach', 'Netzach', 'Victory of gardens, roads, and endurance', 122, 2380, 104, 850, 5, 1.01,
		weights({ daisy: 10, iris: 8, grass: 10, rose: 8, hosta: 7, fern: 7, flowerSpike: 7, hydrangea: 8, planter: 9, hedge: 8, cypress: 6, pine: 7, oak: 5, bench: 6, streetLamp: 6, fountain: 4, car: 7, taxi: 5, van: 4, townhouse: 6 }),
		['botanical', 'nature', 'landmark'], 'Unfading Engine'),
	chapter('tiferes', 'Tiferes', 'Harmony at the radiant heart', 304, 2500, 106, 1020, 6, 1.06,
		weights({ daisy: 8, rose: 10, hydrangea: 9, hosta: 6, floweringCherry: 8, olive: 5, planter: 8, hedge: 7, tree: 8, bench: 8, streetLamp: 7, fountain: 7, townhouse: 8, shop: 5, car: 7, taxi: 5 }),
		['botanical', 'landmark', 'building'], 'Heart of Balance'),
	chapter('gevurah', 'Gevurah', 'Strength restrained inside living law', 4, 2620, 108, 1220, 6, 1.11,
		weights({ stone: 7, grass: 5, pine: 6, cypress: 5, bollard: 8, streetSign: 8, streetLamp: 7, kiosk: 7, car: 12, taxi: 9, van: 7, bus: 5, truck: 4, townhouse: 12, tower: 5 }),
		['vehicle', 'building', 'street'], 'Burning Scale'),
	chapter('chesed', 'Chesed', 'Mercy overflowing through open gates', 214, 2740, 110, 1450, 7, 1.16,
		weights({ letter: 7, iris: 6, hosta: 6, fern: 6, hydrangea: 8, willow: 7, floweringCherry: 6, planter: 8, tree: 8, fountain: 9, marketCart: 7, kiosk: 7, car: 8, taxi: 6, bus: 5, townhouse: 9, shop: 10, studyHall: 6 }),
		['building', 'botanical', 'landmark'], 'Overflowing Cup'),
	chapter('binah', 'Binah', 'Understanding shaped into vast chambers', 226, 2860, 112, 1710, 7, 1.2,
		weights({ stone: 7, scroll: 8, fern: 5, hosta: 4, oak: 5, planter: 5, streetLamp: 6, fountain: 7, townhouse: 9, shop: 9, studyHall: 11, tower: 10, monument: 8, palace: 5, bus: 5, truck: 5 }),
		['building', 'landmark', 'vehicle'], 'Mother of Forms'),
	chapter('chochmah', 'Chochmah', 'Wisdom flashing before language', 54, 3000, 114, 2010, 8, 1.25,
		weights({ letter: 11, flowerSpike: 5, cypress: 5, olive: 4, streetLamp: 5, fountain: 6, car: 10, taxi: 9, van: 7, bus: 7, truck: 7, townhouse: 8, shop: 9, studyHall: 10, tower: 13, monument: 9, palace: 7 }),
		['landmark', 'building', 'vehicle'], 'Primal Point'),
	chapter('keter', 'Keter', 'Crown beyond every measurable crown', 272, 3140, 116, 2380, 9, 1.3,
		weights({ letter: 9, scroll: 7, rose: 5, floweringCherry: 5, cypress: 4, fountain: 8, car: 8, taxi: 8, bus: 8, truck: 8, townhouse: 8, shop: 10, studyHall: 12, tower: 14, monument: 12, palace: 10 }),
		['landmark', 'building', 'botanical'], 'Crownless Crown')
]);

export function chapterAt(index = 0) {
	return CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, index))];
}

function chapter(id, name, summary, hue, bounds, time, targetMass, rivals, density, chapterWeights, bonusPool, bossName) {
	return Object.freeze({ id, name, summary, hue, bounds, time, targetMass, rivals, density, weights: chapterWeights, bonusPool, bossName });
}

function weights(value) {
	return Object.freeze({ ...value });
}
