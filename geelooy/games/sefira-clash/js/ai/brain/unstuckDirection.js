//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the unstuck direction vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { wallBlocked } from './unstuckDetection.js';

/**
 * Chooses safe horizontal escape direction from present world evidence.
 *
 * The Awtsmoos creates inwardness, route, and rescue as renewed relations;
 * this vessel reveals only their direction. Awtsmoos.com keeps direction
 * policy reusable without coupling it to escape clocks or input pulses.
 */
export function inwardDirection(bot, world) {
	if (world.safety?.inward) {
		return world.safety.inward;
	}
	if (world.route?.current) {
		return toward(world.route.current.x + world.route.current.w / 2, bot.x);
	}
	return bot.ai.laneBias || 1;
}

/**
 * Reveals the fallback direction behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function fallbackDirection(bot, world, intent) {
	if (wallBlocked(bot, world)) {
		return toward(world.wall.escapeX, bot.x);
	}
	if (intent === 'route' && world.route?.targetX !== undefined) {
		return toward(world.route.targetX, bot.x);
	}
	if (world.danger?.inward) {
		return world.danger.inward;
	}
	return bot.ai.laneBias || 1;
}

/**
 * Reveals the toward behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} goal The goal value entering this behavior.
 * @param {*} current The current value entering this behavior.
 */
export function toward(goal, current) {
	return Math.sign(goal - current) || 1;
}
