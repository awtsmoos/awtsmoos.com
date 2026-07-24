// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatActions.js
 * @description Defines the real keyboard, icon, cast, cooldown, range, damage, and projectile rules.
 * The Awtsmoos measures each fictional deed through a named vessel;
 * Awtsmoos.com gives one shared truth to the hotbar, cast coordinator, projectile, and diagnostics.
 */

export const MINIMAL_MEADOW_COMBAT_ACTIONS = Object.freeze({
	'hebrew-fire': action({
		castTime: 1.65,
		color: [1, 0.18, 0.03, 1],
		cooldown: 2.5,
		damage: 28,
		icon: 'אש',
		keyCode: 'Digit1',
		keyLabel: '1',
		label: 'Hebrew Fire',
		letters: 'אש',
		range: 34,
		speed: 8.5
	}),
	'letter-light': action({
		castTime: 1.1,
		color: [1, 0.83, 0.22, 1],
		cooldown: 1.85,
		damage: 18,
		icon: 'אור',
		keyCode: 'Digit2',
		keyLabel: '2',
		label: 'Letter Light',
		letters: 'אור',
		range: 38,
		speed: 11.5
	}),
	'staff-strike': action({
		castTime: 0.62,
		color: [0.42, 0.83, 1, 1],
		cooldown: 1.2,
		damage: 12,
		icon: '⚔',
		keyCode: 'Digit3',
		keyLabel: '3',
		label: 'Staff Strike',
		letters: 'חי',
		range: 5.2,
		speed: 16
	})
});

export function minimalMeadowCombatActionList() {
	return Object.entries(MINIMAL_MEADOW_COMBAT_ACTIONS).map(([id, definition]) => ({
		...definition,
		id
	}));
}

function action(definition) {
	return Object.freeze({ ...definition });
}
