// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonMelee.js
 * @description Resolves one selected physical strike through range, armor, stagger, and defeat.
 * The Awtsmoos grants no blow independent existence; Awtsmoos.com measures one target directly,
 * applying bounded protection without a population scan or hidden repeated calculation.
 */

import { createCombatDamageEvent } from '../../gameplay/CombatDamageEvent.js';
import { mitigatePhysicalDamage } from '../../gameplay/combat/EnemyProgressionRules.js';
import { defeatShadow } from './ShadowDemonCombat.js';
import { planarDistance } from './ShadowDemonMotion.js';
import { ENEMY_STATE } from './EnemyStates.js';

export function applyMeleeStrike(actor, request, playerState, nowSeconds) {
	const attack = request?.attack;
	if (!attack || !playerState) return rejection(actor, attack, 'ATTACK_CONTEXT_UNAVAILABLE');
	if (actor.state === ENEMY_STATE.DEFEATED) return rejection(actor, attack, 'TARGET_DEFEATED');
	const distance = planarDistance(actor.group.position, playerState);
	if (distance > attack.range) return rejection(actor, attack, 'TARGET_OUT_OF_RANGE', distance);
	const armor = Math.max(0, Number(actor.profile.armor) || 0);
	const rawDamage = Math.max(0, Number(attack.damage) || 0);
	const damage = mitigatePhysicalDamage(rawDamage, armor);
	actor.engaged = true;
	actor.health = Math.max(0, actor.health - damage);
	actor.stagger += attack.stagger;
	const event = createCombatDamageEvent({
		abilityId: attack.id, amount: damage, damageType: 'physical-staff',
		sourceId: request.sourceId || 'player', staggerAmount: attack.stagger,
		targetId: actor.profile.id, worldPosition: actor.group.position
	});
	if (actor.health <= 0) defeatShadow(actor, nowSeconds);
	else applyStaggerThreshold(actor, nowSeconds);
	actor.bus.emit('combat:damage', event);
	actor.bus.emit('enemy:damaged', { ...actor.payload(), armor, attack, event, rawDamage });
	return {
		accepted: true, armor, attackId: attack.id, damage,
		defeated: actor.state === ENEMY_STATE.DEFEATED, distance,
		health: actor.health, rawDamage, targetId: actor.profile.id
	};
}

function applyStaggerThreshold(actor, nowSeconds) {
	const threshold = Number(actor.profile.staggerThreshold || Infinity);
	if (actor.stagger < threshold) return;
	actor.stagger = 0;
	actor.staggerUntil = nowSeconds + 0.55;
	actor.attackTimeline = null;
	actor.currentAttack = null;
	actor.state = ENEMY_STATE.STAGGER;
	actor.stateElapsed = 0;
	actor.bus.emit('enemy:staggered', actor.payload());
}

function rejection(actor, attack, reason, distance = null) {
	return { accepted: false, attackId: attack?.id || null, distance, reason, targetId: actor?.profile?.id || null };
}
