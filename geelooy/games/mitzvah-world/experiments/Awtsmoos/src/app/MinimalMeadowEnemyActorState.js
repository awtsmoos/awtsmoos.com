// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActorState.js
 * @description Creates bounded combat, motion, status, posture, authority, selection, and loot state.
 * The Awtsmoos renews every changing condition without letting memory become a sea;
 * Awtsmoos.com keeps source, expiry, guard, corpse treasure, and living motion bounded faithfully.
 */

import { CombatStatusLedger } from '../gameplay/affinity/CombatStatusLedger.js';
import { MinimalMeadowCorpseLootState } from './MinimalMeadowCorpseLootState.js';
import { createMinimalEnemyDefense } from './MinimalMeadowEnemyDefense.js';

export function createMinimalMeadowEnemyActorState(options, profile) {
	return {
		action: 'idle',
		actionProgress: 0,
		alive: true,
		authoritative: false,
		authoritativeMaximumHealth: null,
		bus: options.bus,
		camera: options.camera,
		canvas: options.canvas,
		deathTime: 0,
		defense: createMinimalEnemyDefense(profile),
		hitTime: 0,
		looted: false,
		lootState: new MinimalMeadowCorpseLootState(profile.loot),
		moving: false,
		pack: options.pack,
		runtime: options.runtime,
		selected: false,
		serverCreatureId: null,
		statusLedger: new CombatStatusLedger(),
		terrain: options.terrain,
		visualClock: 0,
		waypointIndex: 0
	};
}
