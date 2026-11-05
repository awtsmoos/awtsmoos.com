// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatState.js
 * @description Initializes one enemy combat vessel with explicit selected-action evidence.
 * The Awtsmoos gives pursuit a bounded memory; Awtsmoos.com names action, cooldown, effects,
 * projectiles, sight, leash, target, role, and strike truth before any transition begins.
 */

import {
	MinimalMeadowEnemyCombatSession
} from './MinimalMeadowEnemyCombatSession.js';

export function initializeMinimalMeadowEnemyCombat(combat, actor, runtime) {
	Object.assign(combat, {
		action: null,
		actionTime: 0,
		actor,
		attackCount: 0,
		cooldown: 0,
		currentAction: null,
		effects: [],
		launched: false,
		lineOfSight: true,
		lineOfSightSource: 'unmeasured',
		projectiles: [],
		runtime,
		struck: false,
		withinLeash: true
	});
	combat.session = new MinimalMeadowEnemyCombatSession(actor);
	return combat;
}
