//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the jump state vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Interprets buffered jump intention, coyote mercy, and variable jump height.
 *
 * A jump is not the continued existence of a held key. It is a new act, renewed
 * like every instant by the Awtsmoos. Quick release creates a short hop; a held
 * breath rises fully; a buffered prayer survives the edge of a platform.
 */
export function updateJumpState(fighter, input) {
	fighter.jumpMemory ||= {
		wasJumping: false,
		hold: 0,
		cutApplied: false
	};

	const freshPress = input.pressed?.jump ?? (input.jump && !fighter.jumpMemory.wasJumping);
	if (freshPress) {
		fighter.jumpBuffer = 7;
		fighter.jumpMemory.cutApplied = false;
	} else {
		fighter.jumpBuffer = Math.max(0, (fighter.jumpBuffer || 0) - 1);
	}

	fighter.jumpMemory.hold = input.jump ? fighter.jumpMemory.hold + 1 : 0;
	fighter.coyote = fighter.grounded ? 8 : Math.max(0, (fighter.coyote || 0) - 1);
	applyShortHopCut(fighter, input);
}

/**
 * Reveals the wants jump press behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} input The input value entering this behavior.
 */
export function wantsJumpPress(fighter, input) {
	return Boolean(input.pressed?.jump || fighter.jumpBuffer > 0);
}

/**
 * Reveals the consume jump behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} input The input value entering this behavior.
 */
export function consumeJump(fighter, input) {
	const jumped = fighter.grounded || fighter.coyote > 0 ? groundJump(fighter) : airJump(fighter);

	if (jumped) {
		input.consume?.('jump');
	}
	return jumped;
}

/**
 * Reveals the remember jump behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} input The input value entering this behavior.
 */
export function rememberJump(fighter, input) {
	fighter.jumpMemory ||= { wasJumping: false, hold: 0, cutApplied: false };
	fighter.jumpMemory.wasJumping = Boolean(input.jump);
}

function groundJump(fighter) {
	fighter.vy = -fighter.stats.jump * 1.04;
	fighter.grounded = false;
	fighter.jumpsUsed = 1;
	fighter.jumpBuffer = 0;
	fighter.coyote = 0;
	fighter.fastFalling = false;
	return true;
}

function airJump(fighter) {
	const maximum = 2 + (fighter.buffs?.doubleJump ? 1 : 0) + (fighter.hatStats?.extraJump ? 1 : 0);
	if ((fighter.jumpsUsed || 1) >= maximum) {
		return false;
	}

	fighter.jumpsUsed = (fighter.jumpsUsed || 1) + 1;
	fighter.vy = -fighter.stats.jump * 1.1;
	fighter.jumpBuffer = 0;
	fighter.fastFalling = false;
	return true;
}

function applyShortHopCut(fighter, input) {
	const released = input.released?.jump ?? (fighter.jumpMemory.wasJumping && !input.jump);
	if (!released || fighter.jumpMemory.cutApplied || fighter.vy >= -4) {
		return;
	}

	fighter.vy *= 0.56;
	fighter.jumpMemory.cutApplied = true;
}
