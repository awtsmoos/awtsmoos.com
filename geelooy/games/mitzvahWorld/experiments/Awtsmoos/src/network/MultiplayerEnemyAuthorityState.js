// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEnemyAuthorityState.js
 * @description Applies server creature life, telegraph, phase, corpse, and loot truth.
 * The Awtsmoos lets a visible shadow answer one distant truth; Awtsmoos.com avoids invented
 * impact while preserving readable action warnings, role, phase, animation, and exact defeat.
 */

import {
	defeatAuthoritativeEnemy,
	reviveAuthoritativeEnemy
} from './MultiplayerEnemyAuthorityLife.js';
import {
	applyAuthoritativeEnemyAction,
	applyAuthoritativeEnemyPosition,
	authoritativeEnemyStateSignature,
	publishAuthoritativeEnemyState
} from './MultiplayerEnemyAuthorityProjection.js';

export function bindMultiplayerEnemyActor(actor, record) {
	actor.authoritative = true;
	actor.authoritativeAction = null;
	actor.authoritativeCreature = null;
	actor.authoritativeDefeatRecorded = false;
	actor.serverCreatureId = record.creatureId;
	actor.serverSpeciesId = record.speciesId;
	return actor;
}

export function applyMultiplayerEnemyCreature(actor, creature) {
	if (!actor || !creature) return null;
	const previous = authoritativeEnemyStateSignature(actor);
	actor.authoritativeCreature = creature;
	actor.authoritativeAction = creature.action || null;
	actor.authoritativeMaximumHealth = Number(
		creature.maximumHealth || actor.profile.maxHealth || 1
	);
	actor.authoritativePhase = creature.phase || null;
	actor.authoritativeRole = creature.role || null;
	actor.health = Math.max(0, Number(creature.health || 0));
	applyAuthoritativeEnemyPosition(actor, creature.position);
	applyAuthoritativeEnemyAction(actor, creature.action);
	if (creature.status === 'active') reviveAuthoritativeEnemy(actor);
	else defeatAuthoritativeEnemy(actor);
	actor.looted = creature.lootStatus === 'claimed';
	actor.group.visible = true;
	const current = authoritativeEnemyStateSignature(actor);
	if (current !== previous) publishAuthoritativeEnemyState(actor, creature);
	return authoritativeEnemyReceipt(actor, creature);
}

export function releaseMultiplayerEnemyActor(actor) {
	if (!actor) return;
	actor.authoritative = false;
	actor.authoritativeAction = null;
	actor.authoritativeCreature = null;
	actor.authoritativeDefeatRecorded = false;
	actor.authoritativeMaximumHealth = null;
	actor.authoritativePhase = null;
	actor.authoritativeRole = null;
	actor.serverCreatureId = null;
	actor.serverSpeciesId = null;
	actor.group.visible = true;
}

export function authoritativeEnemyReceipt(
	actor,
	creature = actor.authoritativeCreature
) {
	return Object.freeze({
		action: creature?.action || null,
		authoritative: true,
		creature,
		defeated: creature?.status !== 'active',
		damage: 0,
		health: actor.health,
		id: actor.profile.id,
		looted: Boolean(actor.looted),
		maximumHealth: actor.authoritativeMaximumHealth,
		phase: creature?.phase || null,
		role: creature?.role || null,
		serverCreatureId: actor.serverCreatureId
	});
}
