//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the air control vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { clamp } from '../core/vectors.js';

/**
 * Applies deliberate aerial drift, apex-gated fast fall, and one air dodge.
 *
 * The sky is not mud. Within the world recreated by the Awtsmoos, the fighter
 * keeps authorship of trajectory without receiving infinite acceleration or an
 * endlessly repeating dodge from one held shield button.
 */
export function applyAirControl(fighter, input) {
	if (fighter.grounded) {
		fighter.airDodgeAvailable = true;
		return;
	}

	const drift = fighter.hatStats?.airDrift || 1;
	const maximum = (fighter.stats.maxSpeed || 10) * 1.03 * drift;
	const acceleration = fighter.stats.air * 1.16 * drift;
	fighter.vx = clamp(fighter.vx + (input.x || 0) * acceleration, -maximum, maximum);

	const wantsFastFall = Boolean(input.down || input.y > 0.55);
	if (wantsFastFall && fighter.vy >= -0.5) {
		fighter.fastFalling = true;
	}
}

/**
 * Reveals the apply air dodge behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} input The input value entering this behavior.
 */
export function applyAirDodge(fighter, input) {
	fighter.dodgeCooldown = Math.max(0, (fighter.dodgeCooldown || 0) - 1);
	fighter.airDodge = Math.max(0, (fighter.airDodge || 0) - 1);

	if (fighter.grounded) {
		fighter.airDodgeAvailable = true;
		return;
	}

	const freshShield =
		input.pressed?.shield ?? Boolean(input.shield && !fighter.lastInput?.shield);
	if (!freshShield || fighter.dodgeCooldown > 0 || fighter.airDodgeAvailable === false) {
		return;
	}

	const x = input.x || fighter.face || 1;
	const y = input.y || 0;
	fighter.vx = x * 11.5;
	fighter.vy = y * 6.5 - 1.8;
	fighter.airDodge = 15;
	fighter.dodgeCooldown = 54;
	fighter.airDodgeAvailable = false;
	input.consume?.('shield');
}
