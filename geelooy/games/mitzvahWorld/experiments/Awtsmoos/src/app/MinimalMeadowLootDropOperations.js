// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLootDropOperations.js
 * @description Discovers, ranges, awaits, claims, and restores corpse drops through existing authority.
 * The Awtsmoos joins fallen body and recoverable vessel without duplicate treasure truth;
 * Awtsmoos.com keeps local and server claims, exact-once memory, retry, inventory, and receipts aligned.
 */

import {
	createMinimalMeadowLootDrop,
	minimalMeadowLootActor,
	minimalMeadowLootDropDistance,
	minimalMeadowLootDropInRange
} from './MinimalMeadowLootDropState.js';

export function spawnMinimalMeadowLootDrop(owner, actor) {
	const drop = createMinimalMeadowLootDrop(actor);
	if (!drop || owner.claimed.has(drop.id)) return null;
	owner.drops.set(drop.id, drop);
	actor.group.userData.AwtsmoosLootDrop = drop;
	owner.runtime.bus.emit('loot:drop-spawned', drop);
	return drop;
}

export function nearestMinimalMeadowLootDrop(owner) {
	return [...owner.drops.values()]
		.filter(drop => minimalMeadowLootDropInRange(owner.runtime, drop))
		.sort((first, second) => {
			return minimalMeadowLootDropDistance(owner.runtime, first)
				- minimalMeadowLootDropDistance(owner.runtime, second);
		})[0] || null;
}

export async function claimNearestMinimalMeadowLootDrop(owner) {
	if (owner.runtime.playerDefeat?.isDefeated?.()) {
		return owner.reject('PLAYER_DEFEATED');
	}
	const drop = nearestMinimalMeadowLootDrop(owner);
	if (!drop) return owner.reject('LOOT_OUT_OF_RANGE');
	if (owner.claimed.has(drop.id) || owner.claiming.has(drop.id)) {
		return owner.reject('LOOT_ALREADY_CLAIMED');
	}
	const actor = minimalMeadowLootActor(owner.runtime, drop.enemyId);
	if (!actor || actor.looted) return owner.reject('LOOT_SOURCE_STALE');
	owner.claiming.add(drop.id);
	try {
		const receipt = await claimThroughAuthority(owner.runtime, actor);
		if (!receipt?.accepted) {
			return owner.reject(receipt?.reason || 'LOOT_FAILED');
		}
		owner.claimed.add(drop.id);
		owner.drops.delete(drop.id);
		const reconciled = Object.freeze({ ...receipt, dropId: drop.id });
		owner.runtime.bus.emit('loot:drop-claimed', reconciled);
		return reconciled;
	} catch (error) {
		return owner.reject(error?.code || error?.message || 'LOOT_FAILED');
	} finally {
		owner.claiming.delete(drop.id);
	}
}

export function discoverMinimalMeadowLootDrops(owner) {
	for (const actor of owner.runtime.enemies?.actors || []) {
		spawnMinimalMeadowLootDrop(owner, actor);
	}
}

export function applyMinimalMeadowLootClaims(owner) {
	for (const dropId of owner.claimed) {
		const actor = minimalMeadowLootActor(
			owner.runtime,
			dropId.replace(/^corpse:/, '')
		);
		if (!actor || actor.alive || actor.looted) continue;
		actor.lootState?.takeAll?.();
		actor.looted = true;
		actor.group.visible = false;
		owner.drops.delete(dropId);
	}
}

async function claimThroughAuthority(runtime, actor) {
	const authority = runtime.enemyAuthority;
	if (authority?.controls?.(actor)) {
		const receipt = await authority.claimLoot(actor);
		return Object.freeze({ accepted: true, ...receipt });
	}
	return actor.takeAllLoot();
}
