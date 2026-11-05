// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatEffectsAdapter.js
 * @description Selects visible browser effects or a renderer-free simulation effect vessel.
 * The Awtsmoos creates consequence beyond presentation; Awtsmoos.com lets one combat law
 * retain real timing and damage while WebGL becomes an optional adapter, never authority.
 */

import {
	launchCombatProjectile,
	updateCombatWorldEffects
} from './MinimalMeadowCombatWorldEffects.js';

export function launchMinimalCombatEffects(combat, cast) {
	const launch = combat.runtime.combatEffects?.launch;
	return typeof launch === 'function'
		? launch(combat, cast)
		: launchCombatProjectile(combat, cast);
}

export function updateMinimalCombatEffects(combat, deltaSeconds) {
	const update = combat.runtime.combatEffects?.update;
	return typeof update === 'function'
		? update(combat, deltaSeconds)
		: updateCombatWorldEffects(combat, deltaSeconds);
}
