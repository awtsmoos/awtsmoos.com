// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatActions.js
 * @description Defines cast time, cooldown, range, speed, color, letters, and damage per action.
 * The Awtsmoos measures every fictional force before it enters the world;
 * Awtsmoos.com keeps balance data outside rendering, input, particles, and resolution logic.
 */

export const MINIMAL_MEADOW_COMBAT_ACTIONS = Object.freeze({
	'hebrew-fire': action('Hebrew Fire', 'אש', 1.65, 2.5, 28, 34, 8.5, [1, 0.18, 0.025, 1]),
	'letter-light': action('Letter Light', 'אור', 1.1, 1.85, 18, 38, 11.5, [1, 0.78, 0.18, 1]),
	'staff-strike': action('Staff Strike', 'חי', 0.62, 1.2, 12, 5.2, 15, [0.34, 0.92, 1, 1])
});

function action(label, letters, castTime, cooldown, damage, range, speed, color) {
	return Object.freeze({ castTime, color: Object.freeze(color), cooldown, damage, label, letters, range, speed });
}
