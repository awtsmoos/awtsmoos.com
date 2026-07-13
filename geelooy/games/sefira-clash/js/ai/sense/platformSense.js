//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the platform sense vessel in this instant, revealing
 * its focused js ai sense service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { platformBrain } from '../brain/platformBrain.js';

/**
 * B"H
 * Platform sense adapter.
 *
 * Chapter 191: old brain and new brain share one map-reading chamber. The bot
 * knows current stone, target stone, next stone, and action: fight, jump, drop,
 * or cross.
 */
export function platformSense(bot, target, map) {
	return platformBrain(bot, target, map.platforms || []);
}
