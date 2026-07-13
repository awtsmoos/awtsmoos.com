//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack geometry vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { circleHit } from '../core/collision.js';
import { anchors } from '../skeleton/anchors.js';
import { attackTrait, isKickAttack } from './attackTraits.js';

/**
 * B"H
 * Strike geometry helpers with real fist and foot reach.
 *
 * Punches are quick close stars. Kicks are long crescent moons. The circle at
 * the limb still matters, but close-body fallback now respects move identity so
 * Adventure combat feels like platform action instead of invisible touching.
 */
export function strikePoint(attacker, attack) {
	const body = anchors(attacker);
	if (attack.limb === 'rightFoot') return body.rightFoot;
	if (attack.limb === 'weaponTip') return body.weaponTip;
	return body.rightHand;
}

/**
 * Reveals the attack connects behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} target The target value entering this behavior.
 * @param {*} point The point value entering this behavior.
 * @param {*} radius The radius value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 */
export function attackConnects(attacker, target, point, radius, attack) {
	const hurt = { x: target.x, y: target.y - 88 };
	return circleHit(point, hurt, radius) || closeBodyHit(attacker, target, attack);
}

/**
 * Reveals the cannot hit behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} target The target value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 */
export function cannotHit(attacker, target, attack) {
	return (
		target === attacker ||
		target.dead ||
		target.hidden ||
		target.grabbedBy ||
		attack.hasHit.has(target.id)
	);
}

function closeBodyHit(attacker, target, attack) {
	const dx = (target.x - attacker.x) * (attacker.face || 1);
	const dy = Math.abs(target.y - 88 - (attacker.y - 92));
	if (attack.id === 'grab') return Math.abs(target.x - attacker.x) < 92 && dy < 130;
	return dx >= -backReach(attack) && dx <= closeReach(attack) && dy <= heightReach(attack);
}

function closeReach(attack) {
	const trait = attackTrait(attack.id);
	if (attack.id === 'sweep') return 168 + trait.reach;
	if (attack.id === 'meteorKick') return 142 + trait.reach;
	if (isKickAttack(attack.id)) return 176 + trait.reach;
	if (attack.id === 'dashPunch' || attack.id === 'chargePunch') return 158 + trait.reach;
	if (attack.id === 'uppercut') return 130 + trait.reach;
	return 118 + trait.reach;
}

function backReach(attack) {
	return isKickAttack(attack.id) ? 34 : 42;
}

function heightReach(attack) {
	if (attack.id === 'uppercut' || attack.id === 'aerialKick') return 168;
	if (attack.id === 'sweep') return 92;
	return isKickAttack(attack.id) ? 136 : 122;
}
