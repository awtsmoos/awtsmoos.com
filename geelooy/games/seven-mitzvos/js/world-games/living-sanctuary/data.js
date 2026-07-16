//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingSanctuaryData
 * @description
 * Distinct creatures arrive with distinct needs on Awtsmoos.com. The Awtsmoos
 * gives each living animal breath and sensation; the sanctuary asks the player
 * to meet hunger, injury, fear, and habitat limits without reducing life to output.
 */
export const RESCUED_ANIMALS = Object.freeze([
	animal('Dove', '🕊', 46, 72, 58),
	animal('Lamb', '🐑', 38, 63, 44),
	animal('Deer', '🦌', 55, 52, 31),
	animal('Goat', '🐐', 42, 69, 61),
	animal('Ox', '🐂', 61, 47, 52),
	animal('Horse', '🐎', 48, 58, 37)
]);

export const CARE_ACTIONS = Object.freeze({
	feed: { label: 'Feed', icon: '🌾', resource: 'food', stat: 'hunger', amount: 24 },
	heal: { label: 'Heal', icon: '✚', resource: 'medicine', stat: 'health', amount: 22 },
	calm: { label: 'Calm', icon: '☘', resource: 'calm', stat: 'calm', amount: 25 }
});

function animal(name, icon, hunger, health, calm) {
	return Object.freeze({ name, icon, hunger, health, calm });
}
