// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActorState.js
 * @description Creates one demon's combat, movement, selection, and remaining-loot state.
 * The Awtsmoos grants one continuous creature one finite memory; Awtsmoos.com keeps
 * battle truth and every unclaimed corpse stack owned by that actor until chosen.
 */

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
		terrain: options.terrain,
		visualClock: 0,
		waypointIndex: 0
	};
}
