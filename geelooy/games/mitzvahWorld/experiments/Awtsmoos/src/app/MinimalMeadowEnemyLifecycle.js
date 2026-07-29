// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyLifecycle.js
 * @description Owns living selection, local defeat, and local-or-server corpse interaction.
 * The Awtsmoos grants darkness no independent throne; Awtsmoos.com keeps living combat exact,
 * server corpses singular, and solo treasure deliberate through the whole fallen visible body.
 */

import {
	minimalMeadowEnemyPointerHit
} from './MinimalMeadowEnemyPointerPolicy.js';
import { openMinimalEnemyCorpseLoot } from './MinimalMeadowEnemyLoot.js';
import {
	clearMinimalMeadowEnemyVisual,
	selectMinimalMeadowEnemyVisual
} from './MinimalMeadowEnemySelectionVisual.js';

export function minimalEnemyPointerHit(actor, event) {
	return minimalMeadowEnemyPointerHit(actor, event);
}

export function targetMinimalEnemy(actor) {
	if (actor.looted) return false;
	actor.selected = true;
	selectMinimalMeadowEnemyVisual(actor);
	actor.bus.emit('npc:target', actor.payload());
	return true;
}

export function clearMinimalEnemy(actor, silent = false) {
	actor.selected = false;
	clearMinimalMeadowEnemyVisual(actor);
	if (!silent) actor.bus.emit('npc:clear', actor.payload());
}

export function damageMinimalEnemy(actor, amount) {
	if (!actor.alive) return { damage: 0, defeated: true, health: 0 };
	const damage = Math.max(0, Math.round(Number(amount) || 0));
	actor.health = Math.max(0, actor.health - damage);
	actor.hitTime = 0.46;
	actor.action = 'hit';
	if (damage > 0 && actor.health > 0) {
		actor.combat?.engage?.('struck-by-player');
	}
	if (actor.health === 0) defeatMinimalEnemy(actor);
	const result = { ...actor.payload(), damage, defeated: !actor.alive };
	actor.bus.emit('enemy:damaged', result);
	if (actor.selected) actor.bus.emit('npc:target', result);
	return result;
}

export function defeatMinimalEnemy(actor) {
	if (!actor.alive) return;
	actor.alive = false;
	actor.moving = false;
	actor.action = 'death';
	actor.deathTime = 0;
	if (actor.selected) selectMinimalMeadowEnemyVisual(actor);
	actor.bus.emit('enemy:defeated', actor.payload());
}

export function interactWithMinimalEnemy(actor) {
	if (actor.alive) {
		if (!actor.authoritative) actor.combat?.engage?.('confirmed-target');
		return targetMinimalEnemy(actor);
	}
	if (actor.looted) {
		return { accepted: false, reason: 'CORPSE_ALREADY_LOOTED' };
	}
	if (!actor.selected) {
		targetMinimalEnemy(actor);
		return {
			accepted: false,
			reason: 'CORPSE_SELECTED',
			target: actor.payload()
		};
	}
	if (actor.authoritative) return claimAuthoritativeCorpse(actor);
	return openMinimalEnemyCorpseLoot(actor);
}

function claimAuthoritativeCorpse(actor) {
	const authority = actor.runtime?.enemyAuthority;
	if (!authority?.controls(actor)) {
		return { accepted: false, reason: 'AUTHORITATIVE_LOOT_UNAVAILABLE' };
	}
	authority.claimLoot(actor).catch(error => {
		actor.bus.emit('enemy:loot-rejected', {
			code: error?.code || error?.message || 'LOOT_FAILED',
			message: error?.message || String(error),
			target: actor.payload()
		});
	});
	return {
		accepted: true,
		authoritative: true,
		pending: true,
		target: actor.payload()
	};
}
