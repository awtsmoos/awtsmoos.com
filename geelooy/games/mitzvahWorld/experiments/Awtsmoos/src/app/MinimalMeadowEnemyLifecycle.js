// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyLifecycle.js
 * @description Owns target selection, typed damage delegation, defeat, and corpse interaction.
 * The Awtsmoos grants darkness no independent throne; Awtsmoos.com keeps living combat exact,
 * server corpses singular, local treasure deliberate, and posture-aware health in one visible body.
 */

import {
	damageMinimalEnemy,
	defeatMinimalEnemy
} from './MinimalMeadowEnemyHealth.js';
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

export { damageMinimalEnemy, defeatMinimalEnemy };

export function interactWithMinimalEnemy(actor) {
	if (actor.alive) {
		if (!actor.authoritative) actor.combat?.engage?.('confirmed-target');
		return targetMinimalEnemy(actor);
	}
	if (actor.looted) {
		return {
			accepted: false,
			reason: 'CORPSE_ALREADY_LOOTED'
		};
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
		return {
			accepted: false,
			reason: 'AUTHORITATIVE_LOOT_UNAVAILABLE'
		};
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
