//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the predator goal vessel in this instant, revealing
 * its focused js ai advanced position service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { killPocket } from './killPocket.js';

/**
 * B"H
 * Predator goal.
 *
 * Chapter 201: pursuit becomes predation. The bot chooses the place from which
 * the next strike creates the desired death-shape, not merely the place where
 * the enemy currently stands.
 */
export function predatorGoal(bot, world) {
	const pocket = killPocket(bot, world);
	const dx = pocket.standX - bot.x;
	return {
		...pocket,
		x: pocket.standX,
		distance: Math.abs(dx),
		moveX: Math.abs(dx) < 18 ? 0 : Math.sign(dx)
	};
}
