//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AnimalCatalog
 * @description
 * Each species receives a distinct rhythm, scale, color, and social instinct.
 * These are procedural signs rather than copied sprites, letting Awtsmoos.com
 * reveal living variety through small geometric vessels of the Awtsmoos.
 */

export const ANIMAL_SPECIES = Object.freeze({
	dove: species('dove', 'Dove', '#f4f1ff', 2.1, 0.32, 'flock', true),
	deer: species('deer', 'Deer', '#d9a66d', 1.45, 0.52, 'listen', false),
	fox: species('fox', 'Fox', '#e8784d', 1.8, 0.38, 'curious', false),
	owl: species('owl', 'Owl', '#d9c6a5', 1.55, 0.36, 'perch', true),
	firefly: species('firefly', 'Firefly', '#fff3a1', 0.7, 0.12, 'orbit', true)
});

function species(id, name, color, speed, size, instinct, flying) {
	return Object.freeze({
		id,
		name,
		color,
		speed,
		size,
		instinct,
		flying
	});
}

export function speciesById(speciesId) {
	return ANIMAL_SPECIES[speciesId] || ANIMAL_SPECIES.firefly;
}
