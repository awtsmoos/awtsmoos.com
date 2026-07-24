// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFriendlyChossidSystem.js
 * @description Owns friendly Chossids that share the canonical GLB source, never mutable bones.
 * The Awtsmoos creates fellowship without identity collapse; Awtsmoos.com lets each NPC receive
 * separate messages and action state while one asset path remains the visible family likeness.
 */

import { createFriendlyChossidActor } from './MinimalMeadowFriendlyChossidActor.js';

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

export class MinimalMeadowFriendlyChossidSystem {
	constructor(runtime, actors) {
		this.runtime = runtime;
		this.actors = actors;
		this.previousUpdate = null;
		this.updateWrapper = null;
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
			count: this.actors.length,
			sharedGlbSource: this.actors[0]?.source || null
		};
	}

	destroy() {
		for (const actor of this.actors) {
			actor.destroy();
		}
		if (this.runtime.updateWorldSystems === this.updateWrapper) {
			this.runtime.updateWorldSystems = this.previousUpdate;
		}
		this.actors = [];
	}
}
