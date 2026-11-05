// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyHealth.js
 * @description Applies typed defense, health, engagement, defeat, and selected-target publication.
 * The Awtsmoos gives every strike a lawful passage through posture before life;
 * Awtsmoos.com keeps guarded, broken, damaged, defeated, and boss-phase receipts united.
 */

import {
	resolveMinimalEnemyDefense
} from './MinimalMeadowEnemyDefense.js';
import {
	selectMinimalMeadowEnemyVisual
} from './MinimalMeadowEnemySelectionVisual.js';

export function damageMinimalEnemy(actor, amount, detail = {}) {
	if (!actor.alive) {
		return {
			damage: 0,
			defeated: true,
			health: 0,
			posture: actor.defense
		};
	}
	const defense = resolveMinimalEnemyDefense(actor, amount, detail);
	const damage = defense.healthDamage;
	actor.health = Math.max(0, actor.health - damage);
	actor.hitTime = 0.46;
	actor.action = defense.broken ? 'posture-broken' : 'hit';
	if (damage > 0 && actor.health > 0) {
		actor.combat?.engage?.('struck-by-player');
	}
	if (actor.health === 0) defeatMinimalEnemy(actor);
	const result = {
		...actor.payload(),
		damage,
		defeated: !actor.alive,
		guarded: defense.guarded,
		posture: defense,
		receivedDamage: defense.incoming
	};
	actor.bus.emit('enemy:damaged', result);
	if (actor.selected) actor.bus.emit('npc:target', result);
	return result;
}

export function defeatMinimalEnemy(actor) {
	if (!actor.alive) return false;
	actor.alive = false;
	actor.moving = false;
	actor.action = 'death';
	actor.deathTime = 0;
	if (actor.selected) selectMinimalMeadowEnemyVisual(actor);
	actor.bus.emit('enemy:defeated', actor.payload());
	return true;
}
