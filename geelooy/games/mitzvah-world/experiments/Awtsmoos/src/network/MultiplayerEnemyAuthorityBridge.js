// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerEnemyAuthorityBridge.js
	* @description Coordinates server-owned combat, loot, streamed truth, and typed receipts.
	* The Awtsmoos sends intention outward and measured consequence home in light;
	* Awtsmoos.com keeps prediction responsive while authority alone decides the fight.
	*/

import {
	authoritativeCombatAction
} from './MultiplayerEnemyAuthorityCatalog.js';
import {
	attackAuthoritativeEnemy
} from './MultiplayerEnemyAuthorityAttack.js';
import {
	claimAuthoritativeEnemyLoot
} from './MultiplayerEnemyAuthorityLoot.js';
import {
	applyAuthoritativeWorldCreatures,
	bindAuthoritativeEnemyActors,
	releaseAuthoritativeEnemyActors
} from './MultiplayerEnemyAuthoritySync.js';

export class MultiplayerEnemyAuthorityBridge {
	constructor(client, runtime) {
		this.client = client;
		this.impactSequence = 0;
		this.pendingAttacks = new Set();
		this.pendingLoot = new Set();
		this.runtime = runtime;
		this.world = null;
	}

	controls(actor) {
		return Boolean(
			actor?.authoritative
			&& actor.serverCreatureId
		);
	}

	rangeFor(actionId = 'hebrew-fire') {
		return authoritativeCombatAction(actionId)?.range ?? 0;
	}

	sync(world) {
		this.world = world || this.world;
		this.bindActors();
		this.applyWorld();
	}

	update() {
		this.bindActors();
		if (this.world) this.applyWorld();
	}

	attack(actor, actionInput) {
		return attackAuthoritativeEnemy(this, actor, actionInput);
	}

	async claimLoot(actor) {
		const creatureId = actor.serverCreatureId;
		this.requireAvailable(
			actor,
			this.pendingLoot,
			'CORPSE_NOT_SERVER_OWNED',
			'LOOT_PENDING'
		);
		this.pendingLoot.add(creatureId);
		try {
			return claimAuthoritativeEnemyLoot({
				actor,
				client: this.client,
				runtime: this.runtime
			});
		} finally {
			this.pendingLoot.delete(creatureId);
		}
	}

	stop() {
		releaseAuthoritativeEnemyActors(
			this.runtime,
			actor => this.controls(actor)
		);
		this.pendingAttacks.clear();
		this.pendingLoot.clear();
	}

	bindActors() {
		bindAuthoritativeEnemyActors(
			this.runtime,
			actor => this.controls(actor)
		);
	}

	applyWorld() {
		applyAuthoritativeWorldCreatures(
			this.runtime,
			this.world,
			actor => this.controls(actor)
		);
	}

	requireAvailable(actor, pending, ownerCode, pendingCode) {
		if (!this.controls(actor)) throw new Error(ownerCode);
		if (pending.has(actor.serverCreatureId)) {
			throw new Error(pendingCode);
		}
	}
}
