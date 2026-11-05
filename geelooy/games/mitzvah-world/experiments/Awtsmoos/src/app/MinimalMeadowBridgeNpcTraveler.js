// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBridgeNpcTraveler.js
 * @description Owns an independent GLB bridge villager without replacing the quest NPC.
 * The Awtsmoos renews the footstep and the bridge in each ray;
 * Awtsmoos.com keeps the quest giver at his post while a neighbor finds the way.
 */

import { createFriendlyChossidActor } from './MinimalMeadowFriendlyChossidActor.js';
import { MinimalMeadowBridgeNpcCrossing } from './MinimalMeadowBridgeNpcCrossing.js';

const BRIDGE_NEIGHBOR = Object.freeze({
	id: 'friendly-levi',
	position: Object.freeze({ x: 7.5, z: -3.5 }),
	weaponItemId: 'spark-blade'
});

/** Loads one existing canonical GLB in the bridge gameplay lifecycle. */
export class MinimalMeadowBridgeNpcTraveler {
	constructor(runtime, createActor = createFriendlyChossidActor) {
		this.runtime = runtime;
		this.actor = null;
		this.crossing = null;
		this.destroyed = false;
		this.status = 'loading';
		this.error = null;
		this.promise = Promise.resolve()
			.then(() => createActor(runtime, BRIDGE_NEIGHBOR))
			.then(actor => this.attachActor(actor))
			.catch(error => this.handleFailure(error));
	}

	/** Refuse late hydration from a world that was already destroyed. */
	attachActor(actor) {
		if (this.destroyed) {
			actor?.destroy?.();
			return null;
		}
		this.actor = actor;
		this.crossing = new MinimalMeadowBridgeNpcCrossing(this.runtime, [actor]);
		this.status = 'ready';
		this.runtime.bus?.emit?.('bridge:villager-ready', this.diagnostics());
		return actor;
	}

	/** Record a degraded optional visual without failing bridge construction. */
	handleFailure(error) {
		if (this.destroyed) return null;
		this.error = error?.message || String(error);
		this.status = 'failed';
		this.runtime.bus?.emit?.('bridge:villager-failed', { error: this.error });
		return null;
	}

	/** Advance one physically rendered actor only while its owning world runs. */
	update(deltaSeconds) {
		if (this.destroyed || !this.actor) return;
		this.actor.update?.(deltaSeconds);
		this.crossing?.update?.(deltaSeconds);
	}

	/** Report observed actor position and graph route without modifying world state. */
	diagnostics() {
		return {
			status: this.status,
			error: this.error,
			actorId: this.actor?.id || null,
			crossing: this.crossing?.diagnostics?.() || null
		};
	}

	/** Release this optional GLB and its event subscription, never the quest giver. */
	destroy() {
		if (this.destroyed) return;
		this.destroyed = true;
		this.status = 'destroyed';
		this.crossing?.destroy();
		this.actor?.destroy?.();
		this.crossing = null;
		this.actor = null;
	}
}
