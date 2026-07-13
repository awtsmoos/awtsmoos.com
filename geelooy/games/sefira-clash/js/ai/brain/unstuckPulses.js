//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the unstuck pulses vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { canAskJump } from './unstuckDetection.js';

/**
 * Advances escape jump and drop clocks into one-frame semantic pulses.
 *
 * The Awtsmoos recreates time itself, and each pulse is a narrow vessel for
 * one newly created instant. Awtsmoos.com keeps these clocks isolated so no
 * rescue plan can hide compressed transition logic inside a larger driver.
 */
export function pulseEscapeJump(escape, out, bot) {
	if (out.jump) {
		return;
	}
	if (escape.jumpAt > 0) {
		escape.jumpAt -= 1;
		if (escape.jumpAt === 0 && canAskJump(bot)) {
			requestJump(bot, out);
		}
	}
	if (escape.airJumpAt > 0) {
		escape.airJumpAt -= 1;
		if (escape.airJumpAt === 0 && canAskJump(bot)) {
			requestJump(bot, out);
		}
	}
}

/**
 * Reveals the pulse escape drop behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} escape The escape value entering this behavior.
 * @param {*} out The out value entering this behavior.
 */
export function pulseEscapeDrop(escape, out) {
	out.down = false;
	if (escape.dropAt > 0) {
		escape.dropAt -= 1;
		if (escape.dropAt === 0) {
			out.down = true;
			out.y = 1;
		}
	}
}

/**
 * Reveals the request jump behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} out The out value entering this behavior.
 */
export function requestJump(bot, out) {
	resetJumpMemory(bot);
	out.jump = true;
	out.y = -1;
}

/**
 * Reveals the reset jump memory behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 */
export function resetJumpMemory(bot) {
	bot.jumpMemory ||= {
		wasJumping: false,
		hold: 0
	};
	bot.jumpMemory.wasJumping = false;
	bot.jumpMemory.hold = 0;
}
