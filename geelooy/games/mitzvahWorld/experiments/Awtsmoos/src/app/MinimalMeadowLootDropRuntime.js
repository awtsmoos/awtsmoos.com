// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLootDropRuntime.js
 * @description Owns corpse-drop state, nearby feedback, exact-once pickup events, restore, and teardown.
 * The Awtsmoos joins fallen body and recoverable vessel without hidden vacuuming;
 * Awtsmoos.com keeps deliberate pickup, claim memory, corpse visibility, and one lifecycle explicit.
 */

import { minimalMeadowLootActor } from './MinimalMeadowLootDropState.js';
import {
	applyMinimalMeadowLootClaims,
	claimNearestMinimalMeadowLootDrop,
	discoverMinimalMeadowLootDrops,
	nearestMinimalMeadowLootDrop,
	spawnMinimalMeadowLootDrop
} from './MinimalMeadowLootDropOperations.js';

export class MinimalMeadowLootDropRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.drops = new Map();
		this.claimed = new Set();
		this.claiming = new Set();
		this.nearbyId = null;
		this.unsubscribers = [
			runtime.bus.on('enemy:defeated', event => this.spawnFromEvent(event)),
			runtime.bus.on('core:pickup', () => this.pickupNearest()),
			runtime.bus.on('enemy:looted', event => this.onLooted(event))
		];
	}

	update() {
		discoverMinimalMeadowLootDrops(this);
		applyMinimalMeadowLootClaims(this);
		const nearby = this.nearestDrop();
		const nextId = nearby?.id || null;
		if (nextId !== this.nearbyId) {
			this.nearbyId = nextId;
			this.runtime.bus.emit('loot:nearby', nearby || { id: null });
		}
		return nearby;
	}

	spawnFromEvent(event = {}) {
		const enemyId = event.id || event.enemyId || event.profileId;
		return this.spawn(minimalMeadowLootActor(this.runtime, enemyId));
	}

	spawn(actor) {
		return spawnMinimalMeadowLootDrop(this, actor);
	}

	pickupNearest() {
		return claimNearestMinimalMeadowLootDrop(this);
	}

	nearestDrop() {
		return nearestMinimalMeadowLootDrop(this);
	}

	restore(value = {}) {
		this.claimed = new Set(
			Array.isArray(value.claimedDropIds) ? value.claimedDropIds : []
		);
		applyMinimalMeadowLootClaims(this);
		return this.snapshot();
	}

	snapshot() {
		return Object.freeze({
			claimedDropIds: Object.freeze([...this.claimed]),
			drops: Object.freeze([...this.drops.values()]),
			nearbyId: this.nearbyId
		});
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
		this.drops.clear();
		this.claiming.clear();
	}

	onLooted(event = {}) {
		const enemyId = event.id || event.enemyId || event.profileId;
		if (!enemyId) return;
		const dropId = `corpse:${enemyId}`;
		this.claimed.add(dropId);
		this.drops.delete(dropId);
	}

	reject(reason) {
		const receipt = Object.freeze({ accepted: false, reason });
		this.runtime.bus.emit('loot:pickup-rejected', receipt);
		return receipt;
	}
}
