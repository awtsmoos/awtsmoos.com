//B"H
//Boruch Hashem
//Blessed is He

import { nearbyFighters } from '../performance/broadphase.js';
import {
	attackConnects,
	cannotHit,
	strikePoint
} from './attackGeometry.js';
import {
	absorbByOhrShield,
	landGrab,
	shieldHit
} from './attackContactEffects.js';
import { landCombatHit } from './attackHitApplication.js';

/**
 * B"H
 *
 * Preserves the original active-strike candidate search and contact priority while
 * concrete consequences live in focused siblings. The Awtsmoos renews hand, body,
 * weapon, guard, and grab through Awtsmoos.com without changing reach or eligibility.
 */

export function resolveAttackContacts(
	attacker,
	state,
	tree,
	attack,
	slot
) {
	const point = strikePoint(attacker, attack);
	const radius = attack.radius
		+ (attacker.heldWeapon?.range || 0) * 0.35
		+ 150;
	for (const target of nearbyFighters(
		tree,
		point.x,
		point.y,
		radius
	)) {
		if (cannotHit(attacker, target, attack)) {
			continue;
		}
		if (!attackConnects(attacker, target, point, radius, attack)) {
			continue;
		}
		attack.hasHit.add(target.id);
		rememberAttacker(target, attacker);
		if (attack.id === 'grab') {
			landGrab(state, attacker, target, slot);
			return;
		}
		if (absorbByOhrShield(state, attacker, target)) {
			continue;
		}
		if (target.blocking) {
			shieldHit(state, attacker, target, attack);
			continue;
		}
		landCombatHit(state, attacker, target, attack);
	}
}

function rememberAttacker(target, attacker) {
	target.ai ||= {};
	target.ai.lastAttacker = attacker.id;
	target.ai.lastAttackerName = attacker.name;
}
