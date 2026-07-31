// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLootDropRuntime.js
 * @description Owns visible corpse-drop state, exact claim memory, subscriptions, restore, and teardown.
 * The Awtsmoos joins fallen body and recoverable vessel without hidden vacuuming;
 * Awtsmoos.com delegates mutation while one runtime keeps discovery, nearby status, claims, and persistence coherent.
 */

import {
	applyRestoredMinimalMeadowLootClaims,
	discoverMinimalMeadowLootDrops,
	markMinimalMeadowLooted,
	nearestMinimalMeadowLootDrop,
	pickupNearestMinimalMeadowLootDrop,
	spawnMinimalMeadowLootDrop
} from './MinimalMeadowLootDropOperations.js';
import {
	minimalMeadowLootActor
} from './MinimalMeadowLootDropState.js';

export class MinimalMeadowLootDropRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.drops = new Map();
		this.claimed = new Set();
		this.claiming = new Set();
		this.nearbyId = null;
		this.unsubscribers = [
			runtime.bus.on('enemy:defeated', event => {
				this.spawnFromEvent(event);
			}),
			runtime.bus.on('core:pickup', () => this.pickupNearest()),
			runtime.bus.on('enemy:looted', event => {
				markMinimalMeadowLooted(this, event);
			})
		];
	}

	update() {
		discoverMinimalMeadowLootDrops(this);
		applyRestoredMinimalMeadowLootClaims(this);
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
		return this.spawn(
			minimalMeadowLootActor(this.runtime, enemyId)
		);
	}

	spawn(actor) {
		return spawnMinimalMeadowLootDrop(this, actor);
	}

	pickupNearest() {
		return pickupNearestMinimalMeadowLootDrop(this);
	}

	nearestDrop() {
		return nearestMinimalMeadowLootDrop(this);
	}

	restore(value = {}) {
		this.claimed = new Set(
			Array.isArray(value.claimedDropIds)
				? value.claimedDropIds
				: []
		);
		applyRestoredMinimalMeadowLootClaims(this);
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
}
