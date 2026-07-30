// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActorState.js
 * @description Creates one enemy's bounded combat, movement, status, selection, and loot state.
 * The Awtsmoos renews every changing condition without letting memory become a sea;
 * Awtsmoos.com keeps source, expiry, corpse treasure, and living motion bounded faithfully.
 */
import { CombatStatusLedger } from '../gameplay/affinity/CombatStatusLedger.js';
import { MinimalMeadowCorpseLootState } from './MinimalMeadowCorpseLootState.js';

export function createMinimalMeadowEnemyActorState(options, profile) {
	return {
		action: 'idle',
		actionProgress: 0,
		alive: true,
		bus: options.bus,
		camera: options.camera,
		canvas: options.canvas,
		deathTime: 0,
		hitTime: 0,
		looted: false,
		lootState: new MinimalMeadowCorpseLootState(profile.loot),
		moving: false,
		pack: options.pack,
		runtime: options.runtime,
		selected: false,
		statusLedger: new CombatStatusLedger(),
		terrain: options.terrain,
		visualClock: 0,
		waypointIndex: 0
	};
}
