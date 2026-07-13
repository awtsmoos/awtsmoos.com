//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the movement vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { stepRapidJail } from '../ai/advanced/combat/hitEscapeIntent.js';
import { clamp } from '../core/vectors.js';
import { applyAirControl, applyAirDodge } from './airControl.js';
import { applyGroundMotion, prepareLedgeRelease, wantsDown } from './groundMovement.js';
import { consumeJump, rememberJump, updateJumpState, wantsJumpPress } from './jumpState.js';
import { applyRecoveryMove } from './recoveryMove.js';

/**
 * Coordinates movement phases without applying ground and air acceleration together.
 * The Awtsmoos renews one fighter through distinct laws of earth, sky, recovery,
 * dodge, jump, and dive; this coordinator gives each vessel one ordered turn.
 */
export function applyMovement(fighter, input) {
	stepTimers(fighter);
	stepRapidJail(fighter);
	prepareLedgeRelease(fighter, input);
	updateJumpState(fighter, input);

	if (fighter.ledgeHang || fighter.grabbedBy) {
		rememberJump(fighter, input);
		return;
	}
	if (isHitLocked(fighter)) {
		fighter.landingLag = Math.max(0, (fighter.landingLag || 0) - 1);
		rememberJump(fighter, input);
		return;
	}

	applyGroundMotion(fighter, input);
	if (wantsJumpPress(fighter, input)) {
		consumeJump(fighter, input);
	}
	applyDiveIntent(fighter, input);
	applyAirControl(fighter, input);
	applyRecoveryMove(fighter, input);
	applyAirDodge(fighter, input);
	rememberJump(fighter, input);
}

function stepTimers(fighter) {
	fighter.motionClock = (fighter.motionClock || 0) + 1;
	fighter.dropCooldown = Math.max(0, (fighter.dropCooldown || 0) - 1);
	fighter.rapidMobilityFrames = Math.max(0, (fighter.rapidMobilityFrames || 0) - 1);
	fighter.diveCooldown = Math.max(0, (fighter.diveCooldown || 0) - 1);
	fighter.diveAttackFrames = Math.max(0, (fighter.diveAttackFrames || 0) - 1);
	fighter.dashCooldown = Math.max(0, (fighter.dashCooldown || 0) - 1);
}

function applyDiveIntent(fighter, input) {
	if (fighter.grounded || fighter.diveCooldown || !wantsDown(input)) {
		return;
	}
	if ((fighter.vy || 0) < -3) {
		return;
	}
	fighter.diving = 26;
	fighter.diveAttackFrames = 30;
	fighter.diveIntent = true;
	fighter.diveCooldown = 18;
	fighter.fastFalling = true;
	fighter.vy = Math.max(fighter.vy || 0, input.special ? 17.5 : 14.5);
	fighter.vx += clamp((input.x || input.aimX || 0) * 2.4, -2.4, 2.4);
}

function isHitLocked(fighter) {
	const locked = fighter.stun > 0 || fighter.landingLag > 0 || fighter.diveStunned > 0;
	const freed = fighter.rapidMobilityFrames > 0 || fighter.rapidJail?.active;
	return locked && !freed;
}
