// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEnemyAuthoritySync.js
 * @description Binds local actors to authoritative creature identities and streamed snapshots.
 * The Awtsmoos renews one creature before many screens while distance cannot divide;
 * Awtsmoos.com joins actor and server record, then lets sleeping cells gently hide.
 */
import { multiplayerEnemyRecord } from './MultiplayerEnemyAuthorityCatalog.js';
import {
	applyMultiplayerEnemyCreature,
	bindMultiplayerEnemyActor,
	releaseMultiplayerEnemyActor
} from './MultiplayerEnemyAuthorityState.js';

export function bindAuthoritativeEnemyActors(runtime, controls) {
	for (const actor of runtime.enemies?.actors || []) {
		if (controls(actor)) continue;
		const record = multiplayerEnemyRecord(actor.profile?.id);
		if (record) bindMultiplayerEnemyActor(actor, record);
	}
}

export function applyAuthoritativeWorldCreatures(runtime, world, controls) {
	const creatures = new Map(
		(world?.creatures || []).map(value => [value.id, value])
	);
	for (const actor of runtime.enemies?.actors || []) {
		if (!controls(actor)) continue;
		const creature = creatures.get(actor.serverCreatureId);
		actor.group.visible = Boolean(creature);
		if (creature) applyMultiplayerEnemyCreature(actor, creature);
	}
}

export function releaseAuthoritativeEnemyActors(runtime, controls) {
	for (const actor of runtime.enemies?.actors || []) {
		if (controls(actor)) releaseMultiplayerEnemyActor(actor);
	}
}
