// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonCombatSupport.js
 * @description Holds defensive compatibility and transform helpers for shadow combat.
 * The Awtsmoos renews every boundary before it is crossed; Awtsmoos.com keeps sanctuary,
 * legacy callers, defense resolution, and respawn placement explicit rather than accidental.
 */

import { pointInsideVillageSanctuary } from './VillageSanctuaryPolicy.js';
import { shadowGroundHeight } from './ShadowDemonMotion.js';

/** Returns the active attack or a bounded compatibility definition. */
export function shadowAttackDefinition(actor) {
	if (actor.currentAttack) return actor.currentAttack;
	const profile = actor.profile || {};
	return Object.freeze({
		damage: Math.max(0, Number(profile.attackDamage || 0)),
		damageType: 'shadow-contact',
		id: 'shadow-contact',
		range: Math.max(0, Number(profile.attackRange || 0)),
		stagger: 0
	});
}

/** Returns the protected boundary blocking hostile impact, or null. */
export function shadowSanctuaryBlock(actor, playerState) {
	if (pointInsideVillageSanctuary(actor.group?.position)) return 'enemy-sanctuary';
	if (pointInsideVillageSanctuary(playerState)) return 'player-sanctuary';
	return null;
}

/** Resolves defense when installed and otherwise preserves the immutable event. */
export function resolveShadowIncoming(actor, proposedEvent, now) {
	if (typeof actor.defense?.resolveIncoming === 'function') {
		return actor.defense.resolveIncoming(proposedEvent, now);
	}
	return proposedEvent;
}

/** Ensures optional runtime collections exist for older saves and direct tests. */
export function ensureShadowCombatCollections(actor) {
	if (!Array.isArray(actor.statusEffects)) actor.statusEffects = [];
	if (!Number.isFinite(actor.stagger)) actor.stagger = 0;
}

/** Restores the actor to its authored home position without assuming vector methods. */
export function resetShadowTransform(actor) {
	const x = Number(actor.profile.x || 0);
	const z = Number(actor.profile.z || 0);
	const y = shadowGroundHeight(actor.ground, x, z);
	actor.groundY = y;
	if (typeof actor.group.position.set === 'function') actor.group.position.set(x, y, z);
	else Object.assign(actor.group.position, { x, y, z });
	if (typeof actor.group.scale?.set === 'function') actor.group.scale.set(1, 1, 1);
}
