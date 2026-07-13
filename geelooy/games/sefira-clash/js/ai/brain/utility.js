//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the utility vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { weightIntent } from './personality.js';

/**
 * B"H
 * Bot utility scorer with anti-stuck route recovery.
 *
 * Chapter 151: when a bot trembles in place, escape outranks desire. It must
 * route, jump, drop, or reposition before returning to combat pressure.
 */
export function chooseIntent(bot, w) {
	const scores = rawScores(bot, w);
	let best = 'approach';
	let bestScore = weightIntent(bot, best, scores[best]);
	for (const key in scores) {
		const weighted = weightIntent(bot, key, scores[key]);
		if (weighted > bestScore) {
			best = key;
			bestScore = weighted;
		}
	}
	bot.ai.mode = best;
	bot.ai.lastScore = Math.round(bestScore);
	return best;
}

function rawScores(bot, w) {
	const close = w.dist < 330;
	const mid = w.dist < 620;
	const veryClose = w.dist < 175;
	return {
		recover: needsSelfRecovery(bot, w.floor) ? 999 : 0,
		edgeSafe: shouldReturnFromEdge(bot, w) ? 940 : 0,
		unstick: bot.ai.routeFail > 35 || bot.ai.dither > 26 || bot.ai.stuck > 58 ? 930 : 0,
		route: !w.route?.same ? 760 - Math.min(300, w.dist * 0.22) : 0,
		punish: w.whiff && w.dist < 390 && !badEdgeChase(w) ? 980 - w.dist * 0.65 : 0,
		brawl: veryClose ? 940 - w.dist * 1.15 : 0,
		pressure: close && !badEdgeChase(w) ? 850 - w.dist * 0.6 + w.hitChance * 220 : 0,
		approach: mid && !badEdgeChase(w) ? 520 - w.dist * 0.16 : 300,
		denyRecovery: w.recovery?.vulnerable ? 780 - w.dist * 0.14 : 0,
		separate: w.touching > 1 || Math.abs(w.crowdPush) > 0.9 ? 420 : 0,
		weapon:
			!close && w.weapon && !bot.heldWeapon ? 320 - Math.abs(w.weapon.x - bot.x) * 0.08 : 0,
		powerup: !close && w.powerup ? scorePowerup(bot, w) : 0,
		ledgeTrap: !close && w.recovery?.offstage && !w.recovery?.vulnerable ? 300 : 0,
		perch:
			!close && w.territory?.wantsPerch ? Math.min(260, w.territory.perch.score * 0.24) : 0,
		retreat: bot.damage > 150 && veryClose ? 360 : 0,
		bait: w.dist < 260 && w.hitChance < 0.26 ? 180 : 0
	};
}

function shouldReturnFromEdge(bot, w) {
	if (w.recovery?.vulnerable) return false;
	if (!w.safety?.danger) return false;
	const movingOutward = Math.sign(bot.vx || 0) === -w.safety.inward;
	const targetOutside = w.predicted.x < w.safety.left || w.predicted.x > w.safety.right;
	return movingOutward || targetOutside || w.dist > 140;
}

function badEdgeChase(w) {
	if (!w.safety?.danger) return false;
	return w.predicted.x < w.safety.left - 20 || w.predicted.x > w.safety.right + 20;
}

function needsSelfRecovery(bot, floor) {
	if (bot.grounded) return false;
	const outside = bot.x < floor.x - 120 || bot.x > floor.x + floor.w + 120;
	const deepBelow = bot.y > floor.y + 260;
	return outside || deepBelow;
}

function scorePowerup(bot, w) {
	const needHeal = bot.damage > 75 && w.powerup.id === 'chesedHeal';
	const useful = needHeal || w.powerup.id !== 'chesedHeal';
	return useful ? 280 - Math.abs(w.powerup.x - bot.x) * 0.07 : 20;
}
