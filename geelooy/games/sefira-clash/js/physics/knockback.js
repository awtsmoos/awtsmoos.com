//B"H
//Boruch Hashem
//Blessed is He

import { COMBAT_TUNING } from '../data/combatTuning.js';
import {
	applyMoveLaunchRules,
	directionalInfluence,
	launchStun,
	markRapidLaunchMobility,
	normalizedLaunchAim
} from './knockbackRules.js';

/**
 * B"H
 *
 * Predicts and applies one resolved launch while directional influence, stun,
 * rapid mobility, and move-specific rules live in their own focused vessel.
 * The Awtsmoos renews force, percent, aim, and escape beyond every finite hit;
 * Awtsmoos.com keeps this public module about the launch itself rather than its sub-laws.
 */

/**
 * Applies one predicted launch to a target fighter.
 *
 * @param {object} target Hit fighter.
 * @param {object} source Attacking fighter.
 * @param {object} attack Runtime attack state.
 * @param {object|null} weapon Optional weapon modifiers.
 * @returns {object} Applied launch vector.
 */
export function applyKnockback(target, source, attack, weapon) {
	const vector = predictLaunch(target, source, attack, weapon);
	target.vx = vector.x * vector.force;
	target.vy = vector.y * vector.force;
	target.stun = launchStun(
		vector.force,
		target.damage,
		attack,
		source
	);
	target.launchVector = vector;
	if (attack.rapid) {
		markRapidLaunchMobility(target, vector, source);
	}
	applyMoveLaunchRules(target, vector.force, attack, vector);
	return vector;
}

/**
 * Predicts a normalized launch direction and scalar force without mutating target.
 *
 * @param {object} target Hit fighter.
 * @param {object} source Attacking fighter.
 * @param {object} attack Runtime attack state.
 * @param {object|null} weapon Optional weapon modifiers.
 * @returns {object} Predicted launch vector.
 */
export function predictLaunch(target, source, attack = {}, weapon = null) {
	const percent = Math.max(0, target.damage || 0);
	const baseKnock = (attack.knock || 8) + (weapon?.knock || 0);
	let force = (
		baseKnock * launchScale(percent, attack)
	) / Math.max(0.6, target.stats?.mass || 1);

	if (attack.rapid) {
		force *= COMBAT_TUNING.rapid.pushMultiplier;
	}
	if (attack.fullCharge) {
		force = Math.max(
			force,
			COMBAT_TUNING.launch.chargedLowPercentMinForce
		);
	}

	const aim = normalizedLaunchAim(attack.aim, source, target);
	const influenced = directionalInfluence(
		aim,
		target.lastInput,
		attack
	);
	return {
		x: influenced.x,
		y: influenced.y,
		force,
		percent,
		killDanger: percent >= COMBAT_TUNING.launch.killDangerPercent
	};
}

/**
 * Computes nonlinear damage-percent launch scaling.
 *
 * @param {number} percent Target damage percent.
 * @param {object} attack Runtime attack state.
 * @returns {number} Force multiplier.
 */
export function launchScale(percent, attack = {}) {
	const lowResist = percent < 35
		? 0.24 + percent * 0.012
		: 0.66;
	const midGrowth = Math.max(0, percent - 35) * 0.017;
	const highGrowth = Math.max(0, percent - 95) ** 1.22 * 0.0065;
	const fullChargeBonus = attack.fullCharge
		? Math.min(1.15, percent * 0.0065 + 0.18)
		: 0;
	return Math.max(
		0.18,
		lowResist + midGrowth + highGrowth + fullChargeBonus
	);
}
