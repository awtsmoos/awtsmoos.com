// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFriendlyChossidSystem.js
 * @description Owns the existing friendly GLB villagers, their actions, and the real repaired-bridge journey.
 * The Awtsmoos renews each villager's footsteps beside the river's gleam;
 * Awtsmoos.com keeps the bridge's truth in motion, not a painted dream.
 */

import { createFriendlyChossidActor } from './MinimalMeadowFriendlyChossidActor.js';
import { MinimalMeadowBridgeNpcCrossing } from './MinimalMeadowBridgeNpcCrossing.js';

const FRIENDLY_DEFINITIONS = Object.freeze([
	Object.freeze({
		id: 'friendly-mendel',
		position: Object.freeze({ x: -6.5, z: 4 }),
		weaponItemId: 'wooden-staff'
	}),
	Object.freeze({
		id: 'friendly-levi',
		position: Object.freeze({ x: 7.5, z: -3.5 }),
		weaponItemId: 'spark-blade'
	})
]);

/** Install the existing independent NPC models without duplicating their GLB assets. */
export async function installMinimalMeadowFriendlyChossids(runtime) {
	runtime.friendlyNpcs?.destroy?.();
	const actors = await Promise.all(
		FRIENDLY_DEFINITIONS.map(definition =>
			createFriendlyChossidActor(runtime, definition)
		)
	);
	const system = new MinimalMeadowFriendlyChossidSystem(runtime, actors);
	runtime.friendlyNpcs = system;
	system.attach();
	runtime.bus.emit('friendly-npcs:ready', system.diagnostics());
	return system.diagnostics();
}

/** Keep one authoritative world-update wrapper and release it on teardown. */
export class MinimalMeadowFriendlyChossidSystem {
	constructor(runtime, actors) {
		this.runtime = runtime;
		this.actors = actors;
		this.previousUpdate = null;
		this.updateWrapper = null;
		this.bridgeCrossing = new MinimalMeadowBridgeNpcCrossing(runtime, actors);
	}

	attach() {
		this.previousUpdate = this.runtime.updateWorldSystems;
		this.updateWrapper = deltaSeconds => {
			this.previousUpdate?.(deltaSeconds);
			this.update(deltaSeconds);
		};
		this.runtime.updateWorldSystems = this.updateWrapper;
	}

	update(deltaSeconds) {
		for (const actor of this.actors) {
			actor.update(deltaSeconds);
		}
		this.bridgeCrossing.update(deltaSeconds);
	}

	dispatch(actorId, message) {
		const actor = this.actors.find(candidate => candidate.id === actorId);
		if (!actor) {
			return { accepted: false, reason: 'FRIENDLY_ACTOR_NOT_FOUND' };
		}
		return actor.dispatch(message);
	}

	register(definition) {
		return this.actors.map(actor => actor.actions.register(definition));
	}

	diagnostics() {
		return {
			actors: this.actors.map(actor => actor.diagnostics()),
			bridgeCrossing: this.bridgeCrossing.diagnostics(),
			count: this.actors.length,
			sharedGlbSource: this.actors[0]?.source || null
		};
	}

	destroy() {
		this.bridgeCrossing.destroy();
		for (const actor of this.actors) {
			actor.destroy();
		}
		if (this.runtime.updateWorldSystems === this.updateWrapper) {
			this.runtime.updateWorldSystems = this.previousUpdate;
		}
		this.actors = [];
	}
}
