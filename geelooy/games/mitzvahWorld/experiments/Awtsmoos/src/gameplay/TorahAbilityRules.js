// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityRules.js
 * @description Maps learned passages to respectful light, ward, area, chain, and support rules.
 * The Awtsmoos is beyond every metaphor; Awtsmoos.com keeps Torah represented as wisdom
 * that reveals sparks and disperses fictional concealment rather than ordinary violence.
 */

const ABILITIES = Object.freeze({
	awareness: ability('Gemara Chain', 'chain', 3, 14, 0, ['clarity']),
	choice: ability('Tzedakah Burst', 'single', 1, 12, 18, ['armor-open', 'protection']),
	courage: ability('Mishnah Pulse', 'area', 8, 7, 24, ['push']),
	gratitude: ability('Alef-Beis Spark', 'single', 1, 12, 12, ['stagger-light']),
	joy: ability('Mitzvah Radiance', 'area', 8, 9, 30, ['radiance']),
	light: ability('Mitzvah Radiance', 'area', 8, 9, 30, ['radiance']),
	peace: ability('Tehillim Ward', 'ward', 0, 0, 0, ['ward']),
	unity: ability('Gemara Chain', 'chain', 3, 14, 8, ['unity-chain']),
	water: ability('Niggun Resonance', 'area', 6, 8, 14, ['slow'])
});

export function torahAbilityFor(passage) {
	const base = ABILITIES[passage.aspect] || ABILITIES.gratitude;
	return Object.freeze({
		...base,
		damage: passage.damage,
		id: passage.id,
		passageName: passage.name
	});
}

function ability(name, targetMode, maximumTargets, range, stagger, statusEffects) {
	return Object.freeze({ maximumTargets, name, range, stagger, statusEffects, targetMode });
}
