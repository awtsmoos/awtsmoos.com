// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEnemyAuthorityBridge.js
 * @description Joins actors to server combat, corpse, loot, interest, and reconnect truth.
 * The Awtsmoos lets many eyes behold one consequence; Awtsmoos.com sends stable action,
 * measured active time, exact weapon, and unique impact token before authority replies.
 */
import { authoritativeCombatAction, multiplayerEnemyRecord } from './MultiplayerEnemyAuthorityCatalog.js';
import { applyAuthoritativeAdventures, reconcileAuthoritativeLoot } from './MultiplayerEnemyAuthorityReceipts.js';
import { applyMultiplayerEnemyCreature, authoritativeEnemyReceipt, bindMultiplayerEnemyActor, releaseMultiplayerEnemyActor } from './MultiplayerEnemyAuthorityState.js';

export class MultiplayerEnemyAuthorityBridge {
	constructor(client, runtime) {
		Object.assign(this, { client, impactSequence: 0, pendingAttacks: new Set(), pendingLoot: new Set(), runtime, world: null });
	}
	controls(actor) { return Boolean(actor?.authoritative && actor.serverCreatureId); }
	rangeFor(actionId) { return authoritativeCombatAction(actionId)?.range ?? 0; }
	sync(world) { this.world = world || this.world; this.bindActors(); this.applyWorldCreatures(); }
	update() { this.bindActors(); if (this.world) this.applyWorldCreatures(); }
	async attack(actor, actionInput) {
		const creatureId = actor.serverCreatureId;
		this.requireAvailable(actor, this.pendingAttacks, 'ENEMY_NOT_SERVER_OWNED', 'ATTACK_PENDING');
		const action = this.authorityAction(actionInput);
		this.pendingAttacks.add(creatureId);
		try {
			const response = await this.client.mmorpg.rpg.attack(creatureId, action);
			const payload = response.payload || {};
			applyMultiplayerEnemyCreature(actor, payload.creature);
			applyAuthoritativeAdventures(this.runtime, payload.adventures);
			return { ...authoritativeEnemyReceipt(actor, payload.creature), damage: Number(payload.damage || 0), refinedSparks: Number(payload.refinedSparks || 0) };
		} finally {
			this.pendingAttacks.delete(creatureId);
		}
	}
	async claimLoot(actor) {
		const creatureId = actor.serverCreatureId;
		this.requireAvailable(actor, this.pendingLoot, 'CORPSE_NOT_SERVER_OWNED', 'LOOT_PENDING');
		this.pendingLoot.add(creatureId);
		try {
			const response = await this.client.mmorpg.rpg.loot(creatureId);
			const payload = response.payload || {};
			applyMultiplayerEnemyCreature(actor, payload.creature);
			reconcileAuthoritativeLoot(this.runtime, payload.inventory, payload.loot);
			applyAuthoritativeAdventures(this.runtime, payload.adventures);
			const receipt = { ...authoritativeEnemyReceipt(actor, payload.creature), items: payload.loot ? [payload.loot] : [] };
			this.runtime.bus?.emit?.('enemy:looted', receipt);
			return receipt;
		} finally { this.pendingLoot.delete(creatureId); }
	}
	authorityAction(input) {
		const requested = typeof input === 'string' ? { actionId: input } : input || {};
		const mapped = authoritativeCombatAction(requested.actionId);
		if (!mapped) throw new Error('UNKNOWN_COMBAT_ACTION');
		this.impactSequence += 1;
		return {
			actionId: mapped.actionId,
			elapsedSeconds: Number(requested.elapsedSeconds ?? mapped.elapsedSeconds),
			impactToken: `${this.client.playerId || 'player'}:${Date.now()}:${this.impactSequence}`,
			intent: requested.intent || 'defense',
			weaponId: mapped.weaponId
		};
	}
	stop() {
		for (const actor of this.runtime.enemies?.actors || []) if (this.controls(actor)) releaseMultiplayerEnemyActor(actor);
		this.pendingAttacks.clear();
		this.pendingLoot.clear();
	}
	bindActors() {
		for (const actor of this.runtime.enemies?.actors || []) {
			if (this.controls(actor)) continue;
			const record = multiplayerEnemyRecord(actor.profile?.id);
			if (record) bindMultiplayerEnemyActor(actor, record);
		}
	}
	applyWorldCreatures() {
		const creatures = new Map((this.world?.creatures || []).map(value => [value.id, value]));
		for (const actor of this.runtime.enemies?.actors || []) {
			if (!this.controls(actor)) continue;
			const creature = creatures.get(actor.serverCreatureId);
			actor.group.visible = Boolean(creature);
			if (creature) applyMultiplayerEnemyCreature(actor, creature);
		}
	}
	requireAvailable(actor, pending, ownerCode, pendingCode) {
		if (!this.controls(actor)) throw new Error(ownerCode);
		if (pending.has(actor.serverCreatureId)) throw new Error(pendingCode);
	}
}
