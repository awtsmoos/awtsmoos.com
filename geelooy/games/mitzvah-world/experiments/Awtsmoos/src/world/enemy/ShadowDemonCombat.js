// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonCombat.js
 * @description Resolves readable attacks, Torah abilities, stagger, defeat, and respawn.
 * The Awtsmoos grants concealment no independent dominion; Awtsmoos.com records every
 * fictional impact as bounded evidence while sanctuary remains stronger than every attack.
 */

import { createCombatDamageEvent } from '../../gameplay/CombatDamageEvent.js';
import { torahAbilityFor } from '../../gameplay/TorahAbilityRules.js';
import { torahPassage } from '../../gameplay/TorahPassageCatalog.js';
import { markEnemyAttackDamage } from './EnemyAttackTimeline.js';
import { ENEMY_STATE } from './EnemyStates.js';
import { planarDistance } from './ShadowDemonMotion.js';
import {
	ensureShadowCombatCollections,
	resetShadowTransform,
	resolveShadowIncoming,
	shadowAttackDefinition,
	shadowSanctuaryBlock
} from './ShadowDemonCombatSupport.js';

const PLAYER_HURT_WINDOW_SECONDS = 0.18;

export function attackPlayerFromShadow(actor, playerState, now) {
	const attack = shadowAttackDefinition(actor);
	if (actor.attackTimeline?.damageApplied) return false;
	markEnemyAttackDamage(actor.attackTimeline);
	const sanctuaryReason = shadowSanctuaryBlock(actor, playerState);
	if (sanctuaryReason) return publishMiss(actor, attack, sanctuaryReason);
	const combat = playerState.combat || (playerState.combat = { nextShadowHitAt: 0 });
	if (now < combat.nextShadowHitAt) return false;
	if (planarDistance(actor.group.position, playerState) > attack.range * 1.2) {
		return publishMiss(actor, attack, 'out-of-range');
	}
	combat.nextShadowHitAt = now + PLAYER_HURT_WINDOW_SECONDS;
	const proposed = createCombatDamageEvent({
		amount: attack.damage,
		damageType: attack.damageType,
		hitDirection: hitDirection(actor.group.position, playerState),
		sourceId: actor.profile.id,
		staggerAmount: attack.stagger,
		targetId: 'player',
		worldPosition: playerState
	});
	const event = resolveShadowIncoming(actor, proposed, now);
	playerState.player.health = Math.max(0, playerState.player.health - event.amount);
	if (event.perfectWard) staggerShadow(actor, now, attack.stagger);
	actor.bus.emit('combat:damage', event);
	actor.bus.emit('enemy:attack', { attackId: attack.id, enemy: actor.payload(), event });
	return true;
}

export function applyTorahLight(actor, proposedPassage, playerState, now) {
	const passage = torahPassage(proposedPassage?.id);
	if (!passage) return rejection('UNKNOWN_PASSAGE');
	if (actor.state === ENEMY_STATE.DEFEATED) return rejection('TARGET_DEFEATED');
	const ability = torahAbilityFor(passage);
	if (!playerState || planarDistance(actor.group.position, playerState) > ability.range) {
		return rejection('TARGET_OUT_OF_RANGE');
	}
	ensureShadowCombatCollections(actor);
	actor.engaged = true;
	actor.health = Math.max(0, actor.health - ability.damage);
	actor.stagger += ability.stagger;
	actor.statusEffects.push(...ability.statusEffects.map(id => ({ id, until: now + 3 })));
	const event = torahDamageEvent(actor, ability, passage);
	if (actor.stagger >= Number(actor.profile.staggerThreshold || Infinity)) {
		staggerShadow(actor, now, actor.stagger);
	}
	if (actor.health <= 0) defeatShadow(actor, now);
	actor.bus.emit('combat:damage', event);
	actor.bus.emit('enemy:damaged', { ...actor.payload(), ability, event });
	if (actor.selected) actor.bus.emit('npc:target', actor.payload());
	return { accepted: true, ability, damage: ability.damage, defeated: actor.state === ENEMY_STATE.DEFEATED, event, health: actor.health };
}

export function defeatShadow(actor, now) {
	actor.state = ENEMY_STATE.DEFEATED;
	actor.stateElapsed = 0;
	actor.engaged = false;
	actor.respawnAt = now + actor.profile.respawnSeconds;
	actor.group.visible = false;
	actor.clear?.();
	actor.bus.emit('enemy:defeated', actor.payload());
}

export function updateShadowRespawn(actor, now) {
	if (now < actor.respawnAt) return false;
	actor.health = actor.profile.maxHealth;
	actor.state = ENEMY_STATE.SPAWN;
	actor.stateElapsed = 0;
	actor.engaged = false;
	actor.selected = false;
	actor.attackTimeline = null;
	actor.currentAttack = null;
	actor.nextAttackAt = now + Number(actor.profile.spawnSeconds || 0);
	actor.respawnAt = 0;
	actor.stagger = 0;
	actor.staggerUntil = 0;
	actor.statusEffects = [];
	actor.waypointIndex = 0;
	actor.forcedReturnReason = null;
	if (actor.cadence) actor.cadence.accumulated = 0;
	actor.group.visible = true;
	resetShadowTransform(actor);
	actor.bus.emit('enemy:respawn', actor.payload());
	return true;
}

function staggerShadow(actor, now, amount) {
	actor.stagger = 0;
	actor.staggerUntil = now + Math.min(1.2, 0.4 + amount / 50);
	actor.attackTimeline = null;
	actor.currentAttack = null;
	actor.state = ENEMY_STATE.STAGGER;
	actor.stateElapsed = 0;
	actor.bus.emit('enemy:staggered', actor.payload());
}

function torahDamageEvent(actor, ability, passage) {
	return createCombatDamageEvent({ abilityId: ability.id, amount: ability.damage, damageType: `torah-${passage.aspect}`, sourceId: 'player', staggerAmount: ability.stagger, statusEffects: ability.statusEffects, targetId: actor.profile.id, worldPosition: actor.group.position });
}

function publishMiss(actor, attack, reason) {
	actor.bus.emit('enemy:miss', { attackId: attack.id, enemy: actor.payload(), reason });
	return false;
}

function hitDirection(source, target) {
	const length = Math.max(0.001, planarDistance(source, target));
	return { x: (target.x - source.x) / length, y: 0, z: (target.z - source.z) / length };
}

function rejection(reason) {
	return { accepted: false, damage: 0, reason };
}
