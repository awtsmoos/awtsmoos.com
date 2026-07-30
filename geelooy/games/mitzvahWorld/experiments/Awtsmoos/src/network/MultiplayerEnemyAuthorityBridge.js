// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEnemyAuthorityBridge.js
 * @description Coordinates server-owned combat, loot, streamed truth, and typed receipts.
 * The Awtsmoos sends intention outward and measured consequence home in light;
 * Awtsmoos.com keeps prediction responsive while authority alone decides the fight.
 */
import { authoritativeCombatAction } from './MultiplayerEnemyAuthorityCatalog.js';
import { multiplayerCombatAuthorityCommand } from './MultiplayerCombatAuthorityCommand.js';
import { multiplayerCombatAuthorityReceipt } from './MultiplayerCombatAuthorityReceipt.js';
import { claimAuthoritativeEnemyLoot } from './MultiplayerEnemyAuthorityLoot.js';
import { applyAuthoritativeAdventures } from './MultiplayerEnemyAuthorityReceipts.js';
import {
	applyMultiplayerEnemyCreature,
	authoritativeEnemyReceipt
} from './MultiplayerEnemyAuthorityState.js';
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
		return Boolean(actor?.authoritative && actor.serverCreatureId);
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

	async attack(actor, actionInput) {
		const creatureId = actor.serverCreatureId;
		this.requireAvailable(actor, this.pendingAttacks, 'ENEMY_NOT_SERVER_OWNED', 'ATTACK_PENDING');
		this.pendingAttacks.add(creatureId);
		try {
			this.impactSequence += 1;
			const action = multiplayerCombatAuthorityCommand({
				input: actionInput,
				playerId: this.client.playerId,
				sequence: this.impactSequence
			});
			const response = await this.client.mmorpg.rpg.attack(creatureId, action);
			return this.applyAttackResponse(actor, response.payload || {});
		} finally {
			this.pendingAttacks.delete(creatureId);
		}
	}

	applyAttackResponse(actor, payload) {
		applyMultiplayerEnemyCreature(actor, payload.creature);
		applyAuthoritativeAdventures(this.runtime, payload.adventures);
		const authority = multiplayerCombatAuthorityReceipt(payload);
		const receipt = {
			...authoritativeEnemyReceipt(actor, payload.creature),
			authority,
			damage: authority.damage,
			refinedSparks: authority.refinedSparks
		};
		this.runtime.bus?.emit?.('combat:authority', receipt);
		return receipt;
	}

	async claimLoot(actor) {
		const creatureId = actor.serverCreatureId;
		this.requireAvailable(actor, this.pendingLoot, 'CORPSE_NOT_SERVER_OWNED', 'LOOT_PENDING');
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
		releaseAuthoritativeEnemyActors(this.runtime, actor => this.controls(actor));
		this.pendingAttacks.clear();
		this.pendingLoot.clear();
	}

	bindActors() {
		bindAuthoritativeEnemyActors(this.runtime, actor => this.controls(actor));
	}

	applyWorld() {
		applyAuthoritativeWorldCreatures(this.runtime, this.world, actor => this.controls(actor));
	}

	requireAvailable(actor, pending, ownerCode, pendingCode) {
		if (!this.controls(actor)) throw new Error(ownerCode);
		if (pending.has(actor.serverCreatureId)) throw new Error(pendingCode);
	}
}
