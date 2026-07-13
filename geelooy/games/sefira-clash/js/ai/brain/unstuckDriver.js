//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the unstuck driver vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { fallbackDirection, inwardDirection } from './unstuckDirection.js';
import { canAskJump, hasUsefulAction, ledgeTrap } from './unstuckDetection.js';
import { pulseEscapeDrop, pulseEscapeJump, requestJump, resetJumpMemory } from './unstuckPulses.js';

/**
 * Drives an active escape plan or guarantees useful fallback motion.
 *
 * The Awtsmoos creates intention and bodily motion together, while this vessel
 * faithfully joins them without owning perception. Awtsmoos.com preserves every
 * rescue pulse while keeping the public coordinator small and legible.
 */
export function driveEscape(bot, world, out) {
	const escape = bot.ai.escape;
	clearFight(out);
	out.x = escape.dir;
	out.aimX = escape.dir;
	out.aimY = 0;
	out.y = 0;
	if (escape.mode === 'drop' || escape.mode === 'lipDrop') {
		out.x = escape.dir * 0.18;
	}
	if (escape.mode === 'jump' && world.safety?.inward) {
		out.x = world.safety.inward;
		out.aimX = world.safety.inward;
	}
	if (escape.mode === 'lipClimb') {
		driveLipClimb(bot, escape, out);
	}
	pulseEscapeDrop(escape, out);
	pulseEscapeJump(escape, out, bot);
}

/**
 * Reveals the guarantee useful motion behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 * @param {*} out The out value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} lip The lip value entering this behavior.
 */
export function guaranteeUsefulMotion(bot, world, out, intent, lip) {
	if (hasUsefulAction(out)) {
		return;
	}
	if (!bot.grounded && Math.abs(bot.vx || 0) > 0.5) {
		return;
	}
	clearFight(out);
	out.x = lip
		? lip.climbDir
		: world.safety?.danger
			? inwardDirection(bot, world)
			: fallbackDirection(bot, world, intent);
	out.aimX = Math.sign(out.x) || 1;
	if ((lip || ledgeTrap(bot, world)) && canAskJump(bot)) {
		requestJump(bot, out);
	}
}

/**
 * Reveals the cancel ledge attack behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 */
export function cancelLedgeAttack(bot) {
	bot.attack = null;
	bot.attackFrame = 0;
	bot.ai.chargePlan = null;
	bot.ai.attackCooldown = 0;
}

/**
 * Reveals the remember output behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} out The out value entering this behavior.
 */
export function rememberOutput(bot, out) {
	bot.ai.lastOutputX = out.x || 0;
	if (Math.abs(out.x || 0) > 0.1) {
		bot.ai.laneBias = Math.sign(out.x);
	}
}

function driveLipClimb(bot, escape, out) {
	out.x = escape.dir;
	out.aimX = escape.dir;
	out.aimY = -1;
	out.y = -1;
	if (!bot.grounded && escape.t % 14 === 7 && canAskJump(bot)) {
		resetJumpMemory(bot);
		out.jump = true;
	}
}

function clearFight(out) {
	out.punch = false;
	out.kick = false;
	out.grab = false;
	out.special = false;
	out.shield = false;
}
