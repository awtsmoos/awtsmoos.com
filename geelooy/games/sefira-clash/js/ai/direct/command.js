//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the command vessel in this instant, revealing
 * its focused js ai direct service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — direct bot command orchestrator with anti-silence pressure. */
import { blank } from './blankInput.js';
import { chooseTarget } from './targeting.js';
import { remember } from './memory.js';
import { movementX, recover, shouldJump } from './movement.js';
import { chooseAttack } from './attacks.js';
import { mark } from './mark.js';
/**
 * Reveals the bot command behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} state The state value entering this behavior.
 */
export function botCommand(bot, state) {
	const target = chooseTarget(bot, state.fighters);
	if (!target) return mark(bot, blank(), 'Idle', 'none', 'NoTarget');
	const dx = target.x - bot.x,
		dy = target.y - bot.y,
		adx = Math.abs(dx),
		ady = Math.abs(dy);
	const close = adx < 128 && ady < 104,
		veryClose = adx < 74 && ady < 76;
	const offstage =
		bot.y > (state.map.blast?.bottom || state.map.h + 500) - 260 ||
		bot.x < 40 ||
		bot.x > state.map.w - 40;
	const brain = remember(bot, target, close),
		out = blank();
	out.aimX = norm(dx);
	out.aimY = norm(dy);
	out.hunt = true;
	out.x = movementX(bot, state, dx, offstage, brain);
	if (offstage) return mark(bot, recover(out, bot, state), 'Recover', 'Recovery', 'Recover');
	if (shouldJump(bot, dy, adx, brain)) out.jump = true;
	const stale = brain.noPressure > 90 || brain.sameLane > 130;
	if (close || (stale && adx < 260)) chooseAttack(out, bot, brain, veryClose, dy, stale);
	else if (adx < 320 && bot.grounded && brain.clock % 70 < 12) probePunch(out, brain);
	if (stale && !out.punch && !out.kick && !out.grab && brain.clock % 42 < 9)
		probePunch(out, brain);
	const stateName = close
		? 'Attack'
		: stale
			? 'ForceApproach'
			: ady > 140
				? 'PlatformSeek'
				: 'Chase';
	const opportunity = close
		? 'GuaranteedAttack'
		: stale
			? 'ForceEngage'
			: ady > 140
				? 'LandingIntercept'
				: 'Chase';
	return mark(bot, out, stateName, opportunity, out.tactic || 'Move');
}
function probePunch(out, brain) {
	out.punch = true;
	out.chargePunch = brain.noPressure > 150;
	out.rapidPunch = brain.noPressure < 150;
	out.tactic = out.chargePunch ? 'PressureChargePunch' : 'PressureRapidPunch';
	return out;
}
function norm(v) {
	return Math.max(-1, Math.min(1, v / 120));
}
