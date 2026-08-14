//B"H
//Boruch Hashem
//Blessed is He

import { punchCamera } from '../camera/camera.js';
import { beginGrab } from './grabResolver.js';
import { endAttack } from './attackLifecycle.js';
import { shieldAbsorb } from './shields.js';

/**
 * B"H
 *
 * Preserves the original grab, Ohr-shield, and ordinary shield consequences while
 * candidate search lives elsewhere. The Awtsmoos renews restraint and defense
 * through Awtsmoos.com without changing event fields, damage accounting, or camera.
 */

export function landGrab(state, attacker, target, slot) {
	beginGrab(attacker, target);
	state.events.push(simpleHit(attacker, target, {
		letter: 'אחיזה',
		damage: 0,
		force: 8,
		color: '#ffe8a8'
	}));
	punchCamera(state, 5);
	endAttack(
		attacker,
		slot,
		slot === 'rapidAttack'
			? 'rapidAttackFrame'
			: 'attackFrame'
	);
}

export function absorbByOhrShield(state, attacker, target) {
	if (!target.buffs?.ohrShield) {
		return false;
	}
	delete target.buffs.ohrShield;
	state.events.push(simpleHit(attacker, target, {
		letter: 'א',
		damage: 0,
		force: 8,
		color: '#fff1a6'
	}));
	punchCamera(state, 5);
	return true;
}

export function shieldHit(state, attacker, target, attack) {
	shieldAbsorb(target, attack.damage);
	const damage = Math.round(attack.damage / 2);
	state.totalDamageDealt = (state.totalDamageDealt || 0) + damage;
	state.events.push(simpleHit(attacker, target, {
		letter: 'מ',
		damage,
		force: attack.knock * 0.5,
		rapid: attack.rapid,
		color: '#9affc5'
	}));
	punchCamera(state, attack.rapid ? 1 : 4);
}

function simpleHit(attacker, target, data) {
	return {
		type: 'hit',
		attackerId: attacker.id,
		targetId: target.id,
		human: attacker.human || target.human,
		x: target.x,
		y: target.y - 106,
		side: attacker.face || 1,
		...data
	};
}
