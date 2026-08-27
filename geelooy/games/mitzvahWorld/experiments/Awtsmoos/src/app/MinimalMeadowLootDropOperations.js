// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLootDropOperations.js
 * @description Discovers corpses and commits exact local or authoritative pickup transactions.
 * The Awtsmoos joins fallen body and recoverable vessel through one truthful owner;
 * Awtsmoos.com waits for reconciled consequence before claim memory, visibility, and persistence advance.
 */

import {
	claimMinimalMeadowLootActor,
	minimalMeadowLootClaimAccepted,
	minimalMeadowLootClaimFailure
} from './MinimalMeadowLootClaimAuthority.js';
import {
	createMinimalMeadowLootDrop,
	minimalMeadowLootActor,
	minimalMeadowLootDropDistance,
	minimalMeadowLootDropInRange
} from './MinimalMeadowLootDropState.js';

export function spawnMinimalMeadowLootDrop(controller, actor) {
	const drop = createMinimalMeadowLootDrop(actor);
	if (!drop || controller.claimed.has(drop.id)) return null;
	controller.drops.set(drop.id, drop);
	actor.group.userData.AwtsmoosLootDrop = drop;
	controller.runtime.bus.emit('loot:drop-spawned', drop);
	return drop;
}

export async function pickupNearestMinimalMeadowLootDrop(controller) {
	if (controller.runtime.playerDefeat?.isDefeated?.()) {
		return rejectMinimalMeadowLootDrop(controller, 'PLAYER_DEFEATED');
	}
	const drop = nearestMinimalMeadowLootDrop(controller);
	if (!drop) return rejectMinimalMeadowLootDrop(controller, 'LOOT_OUT_OF_RANGE');
	if (controller.claimed.has(drop.id) || controller.claiming.has(drop.id)) {
		return rejectMinimalMeadowLootDrop(controller, 'LOOT_ALREADY_CLAIMED');
	}
	const actor = minimalMeadowLootActor(controller.runtime, drop.enemyId);
	if (!actor || actor.looted) {
		return rejectMinimalMeadowLootDrop(controller, 'LOOT_SOURCE_STALE');
	}
	controller.claiming.add(drop.id);
	controller.runtime.bus.emit('loot:pickup-pending', drop);
	try {
		const receipt = await claimMinimalMeadowLootActor(controller.runtime, actor);
		if (!minimalMeadowLootClaimAccepted(actor, receipt)) {
			return rejectMinimalMeadowLootDrop(controller, 'LOOT_NOT_RECONCILED');
		}
		controller.claimed.add(drop.id);
		controller.drops.delete(drop.id);
		const committed = Object.freeze({
			...receipt,
			accepted: true,
			dropId: drop.id
		});
		controller.runtime.bus.emit('loot:drop-claimed', committed);
		return committed;
	} catch (error) {
		return rejectMinimalMeadowLootDrop(
			controller,
			minimalMeadowLootClaimFailure(error)
		);
	} finally {
		controller.claiming.delete(drop.id);
	}
}

export function nearestMinimalMeadowLootDrop(controller) {
	return [...controller.drops.values()]
		.filter(drop => minimalMeadowLootDropInRange(controller.runtime, drop))
		.sort((first, second) => {
			return minimalMeadowLootDropDistance(controller.runtime, first)
				- minimalMeadowLootDropDistance(controller.runtime, second);
		})[0] || null;
}

export function discoverMinimalMeadowLootDrops(controller) {
	for (const actor of controller.runtime.enemies?.actors || []) {
		spawnMinimalMeadowLootDrop(controller, actor);
	}
}

export function applyRestoredMinimalMeadowLootClaims(controller) {
	for (const dropId of controller.claimed) {
		const enemyId = dropId.replace(/^corpse:/, '');
		const actor = minimalMeadowLootActor(controller.runtime, enemyId);
		if (!actor || actor.alive || actor.looted) continue;
		if (actor.authoritative) continue;
		actor.lootState?.takeAll?.();
		actor.looted = true;
		actor.group.visible = false;
		controller.drops.delete(dropId);
	}
}

export function markMinimalMeadowLooted(controller, event = {}) {
	if (event.looted === false) return;
	const enemyId = event.id || event.enemyId || event.profileId;
	if (!enemyId) return;
	const dropId = `corpse:${enemyId}`;
	controller.claimed.add(dropId);
	controller.drops.delete(dropId);
}

export function rejectMinimalMeadowLootDrop(controller, reason) {
	const receipt = Object.freeze({ accepted: false, reason });
	controller.runtime.bus.emit('loot:pickup-rejected', receipt);
	return receipt;
}
