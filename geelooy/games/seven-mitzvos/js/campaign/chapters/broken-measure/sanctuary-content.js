//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrokenMeasureSanctuaryContent
 * @description
 * A short shipment becomes four unequal hungers on Awtsmoos.com. The Awtsmoos
 * gives each creature a singular life; no healthy average may erase the weakest
 * animal whose body carries the market's hidden deficit into the sanctuary.
 */
export const SANCTUARY_ANIMALS = Object.freeze([
	{ id: 'goat', name: 'Nuri the Goat', icon: '🐐', hunger: 42, health: 72, calm: 66 },
	{ id: 'donkey', name: 'Ari the Donkey', icon: '🫏', hunger: 58, health: 78, calm: 54 },
	{ id: 'sheep', name: 'Liora the Sheep', icon: '🐑', hunger: 35, health: 60, calm: 70 },
	{ id: 'hen', name: 'Tzipi the Hen', icon: '🐔', hunger: 64, health: 68, calm: 74 }
]);

export const SUPPLY_STRATEGIES = Object.freeze([
	{ id: 'ration', label: 'Ration feed carefully', description: 'Gain 4 food; trust falls unless records are verified.' },
	{ id: 'emergency-buy', label: 'Emergency feed purchase', description: 'Spend 24 remaining coins for 8 food.' },
	{ id: 'volunteers', label: 'Volunteer collection', description: 'Gain 6 food when public trust survived.' },
	{ id: 'delay-habitat', label: 'Delay habitat expansion', description: 'Convert planned materials into 7 food.' },
	{ id: 'fair-replacement', label: 'Fair replacement shipment', description: 'The protected honest merchant supplies 8 food.' }
]);
