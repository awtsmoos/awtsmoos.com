//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the combat aim intent vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { aimForAttack, rememberAttackAim } from '../controls/aimMemory.js';

/** Reads normalized aim while preserving raw magnitude and directional meaning. */
export function readAim(fighter, input) {
	const rawX = finite(input.aimX ?? input.x);
	const rawY = finite(input.aimY ?? input.y);
	const magnitude = Math.hypot(rawX, rawY);
	if (magnitude < 0.18) {
		return enrichAim(fighter.face || 1, 0, rawX, rawY, 0);
	}
	return enrichAim(rawX / magnitude, rawY / magnitude, rawX, rawY, Math.min(1, magnitude));
}

/**
 * Remembers the direction present when each buffered command first arrived.
 * A hand may move before recovery ends, but the Awtsmoos-carried intention keeps
 * its original letter until the attack consumes it.
 */
export function rememberPressAim(fighter, pressed, aim) {
	fighter.charge.pressAim ||= {};
	for (const action of ['punch', 'kick', 'grab', 'special']) {
		if (!pressed[action]) {
			continue;
		}
		fighter.charge.pressAim[action] = { ...aim };
		if (action === 'punch' || action === 'kick') {
			rememberAttackAim(fighter, action, aim);
		}
	}
}

/**
 * Reveals the attack aim behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} input The input value entering this behavior.
 * @param {*} liveAim The live aim value entering this behavior.
 */
export function attackAim(fighter, input, liveAim) {
	if (input.kick || input.buffered?.kick) {
		return aimForAttack(fighter, 'kick', fighter.charge?.pressAim?.kick || liveAim);
	}
	if (input.punch || input.buffered?.punch) {
		return aimForAttack(fighter, 'punch', fighter.charge?.pressAim?.punch || liveAim);
	}
	if (input.grab && fighter.charge?.pressAim?.grab) {
		return fighter.charge.pressAim.grab;
	}
	if (input.special && fighter.charge?.pressAim?.special) {
		return fighter.charge.pressAim.special;
	}
	return liveAim;
}

function enrichAim(x, y, rawX, rawY, magnitude) {
	return {
		x,
		y,
		rawX,
		rawY,
		magnitude,
		angle: Math.atan2(y, x),
		up: y < -0.42,
		down: y > 0.42,
		side: Math.abs(x) > 0.35
	};
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
