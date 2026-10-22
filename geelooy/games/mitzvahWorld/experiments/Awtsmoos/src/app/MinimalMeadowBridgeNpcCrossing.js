// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBridgeNpcCrossing.js
 * @description Walks an existing rendered villager across the canonical repaired stone bridge.
 * The Awtsmoos renews the river and the footsteps with each passing ray;
 * Awtsmoos.com witnesses a true repaired crossing, never a phantom way.
 */

import { npcRoadJourney, sampleNpcRoadJourney } from '../world/npc/NpcRoadJourney.js';
import { minimalMeadowBridgeNpcElevation } from './MinimalMeadowBridgeNpcElevation.js';

const BRIDGE_ID = 'BRIDGE01';
const WALK_SPEED = 1.45;
const EAST_GOAL = Object.freeze({ x: 25.6, z: 7 });

/** Observes a committed repair before assigning a continuous graph journey. */
export class MinimalMeadowBridgeNpcCrossing {
	constructor(runtime, actors) {
		this.runtime = runtime;
		this.actor = actors.find(actor => actor.id === 'friendly-levi') || null;
		this.state = 'awaiting-bridge';
		this.distance = 0;
		this.journey = null;
		this.crossedEmitted = false;
		this.unsubscribe = runtime.bus?.on?.('bridge:restored', detail => {
			if (!detail?.id || detail.id === BRIDGE_ID) this.activate();
		});
		if (runtime.bridgeRestoration?.built === true) this.activate();
	}

	/** Recheck the authoritative build state, never giving passage from an event alone. */
	activate() {
		if (!this.actor || this.state !== 'awaiting-bridge') return;
		if (this.runtime.bridgeRestoration?.built !== true) return;
		const position = this.actor.model.position;
		const from = { x: Number(position.x), z: Number(position.z) };
		const journey = npcRoadJourney(from, EAST_GOAL, true);
		if (journey.totalLength <= 0.001) return;
		this.journey = journey;
		this.distance = 0;
		this.state = 'walking';
	}

	/** Move the actual GLB along graph nodes and within the physical deck footprint. */
	update(deltaSeconds) {
		if (this.runtime.bridgeRestoration?.built !== true) return;
		if (this.state === 'awaiting-bridge') this.activate();
		if (this.state !== 'walking' || !this.journey) return;
		const delta = Math.max(0, Math.min(0.1, Number(deltaSeconds) || 0));
		this.distance = Math.min(this.journey.totalLength, this.distance + delta * WALK_SPEED);
		const progress = this.distance / this.journey.totalLength;
		const waypoint = {};
		sampleNpcRoadJourney(this.journey, progress, waypoint);
		const x = waypoint.routeCenterX;
		const z = waypoint.routeCenterZ;
		const terrainY = Number(this.runtime.terrain?.heightAt?.(x, z)) || 0;
		const surfaceY = minimalMeadowBridgeNpcElevation(x, z, terrainY);
		this.actor.model.position.set(x, surfaceY, z);
		if (this.actor.model.rotation) {
			this.actor.model.rotation.y = Math.atan2(
				waypoint.routeDirectionX,
				waypoint.routeDirectionZ
			);
		}
		if (progress >= 1 && !this.crossedEmitted) {
			this.crossedEmitted = true;
			this.state = 'crossed';
			this.runtime.bus?.emit?.('bridge:npc-crossed', {
				bridgeId: BRIDGE_ID,
				actorId: this.actor.id
			});
		}
	}

	/** Expose genuine model motion without implying quest rewards were granted. */
	diagnostics() {
		return {
			actorId: this.actor?.id || null,
			state: this.state,
			bridgeBuilt: this.runtime.bridgeRestoration?.built === true,
			distance: this.distance,
			totalLength: this.journey?.totalLength || 0,
			x: this.actor?.model.position.x ?? null,
			z: this.actor?.model.position.z ?? null
		};
	}

	/** Release only the subscription owned by this bridge journey. */
	destroy() {
		this.unsubscribe?.();
		this.unsubscribe = null;
	}
}
