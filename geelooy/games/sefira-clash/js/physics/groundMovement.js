//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ground movement vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { clamp } from '../core/vectors.js';
import { moveBuff } from '../fighters/applyHatStats.js';

/**
 * Applies grounded dash, acceleration, facing, and intentional ledge release.
 * The earth is one vessel among many; the Awtsmoos renews traction and direction
 * while this module keeps ground law separate from the freedom of the air.
 */
export function applyGroundMotion(fighter, input) {
	if (!fighter.grounded) {
		return;
	}
	const axis = input.x || 0;
	const huntBoost = input.hunt ? (input.special ? 2.05 : 1.72) : 1;
	const speedBuff = moveBuff(fighter) * huntBoost;
	const maximum = (fighter.stats.maxSpeed || 10) * speedBuff;
	if (input.dashX && fighter.dashCooldown <= 0) {
		fighter.vx = input.dashX * maximum * 1.04;
		fighter.dashCooldown = 8;
	} else {
		fighter.vx = clamp(fighter.vx + axis * fighter.stats.accel * speedBuff, -maximum, maximum);
	}
	if (Math.abs(axis) > 0.05) {
		fighter.face = axis < 0 ? -1 : 1;
	}
}

/**
 * Reveals the prepare ledge release behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} input The input value entering this behavior.
 */
export function prepareLedgeRelease(fighter, input) {
	if (!fighter.grounded || !wantsDown(input)) {
		return;
	}
	const width = fighter.currentPlatform?.w || fighter.platformWidth || 0;
	const left = fighter.currentPlatform?.x;
	const atLip = left != null && width && (fighter.x < left + 48 || fighter.x > left + width - 48);
	if (Math.abs(input.x || 0) <= 0.28 && !atLip) {
		return;
	}
	fighter.noLedgeTimer = Math.max(fighter.noLedgeTimer || 0, 26);
	fighter.dropCooldown = Math.max(fighter.dropCooldown || 0, 6);
}

/**
 * Reveals the wants down behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} input The input value entering this behavior.
 */
export function wantsDown(input) {
	return Boolean(input.down || input.y > 0.45 || input.aimY > 0.45);
}
