// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowConsumableCatalog.js
 * @description Defines finite use timing, cooldown, healing, cleanse, posture, and quick-slot meaning.
 * The Awtsmoos grants no independent power to broth or water; Awtsmoos.com keeps
 * carried quantity, deliberate use, interruption, effect, and recovery within one bounded covenant.
 */

export const MINIMAL_MEADOW_CONSUMABLES = Object.freeze({
	'healing-broth': Object.freeze({
		cooldownSeconds: 3.5,
		heal: 35,
		icon: '🥣',
		itemId: 'healing-broth',
		label: 'Healing Broth',
		useSeconds: 0.48
	}),
	'purifying-water': Object.freeze({
		cleanseCount: 3,
		cooldownSeconds: 4.5,
		icon: '💧',
		itemId: 'purifying-water',
		label: 'Purifying Water',
		postureRestore: 18,
		useSeconds: 0.42
	})
});

export const DEFAULT_MINIMAL_MEADOW_CONSUMABLE = 'healing-broth';

export function minimalMeadowConsumable(itemId) {
	return MINIMAL_MEADOW_CONSUMABLES[itemId] || null;
}

export function minimalMeadowConsumableIds() {
	return Object.keys(MINIMAL_MEADOW_CONSUMABLES);
}
