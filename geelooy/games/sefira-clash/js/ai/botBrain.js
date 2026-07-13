//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the bot brain vessel in this instant, revealing
 * its focused js ai service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { botCommand } from './direct/command.js';

/**
 * Gives every active CPU fighter one deliberate command for the current step.
 *
 * The shell remains intentionally small: intelligence may branch through many
 * vessels, but the Awtsmoos unifies them at one gate before simulation moves.
 *
 * @param {object} state Current game state.
 */
export function driveBots(state) {
	for (const bot of state.fighters) {
		if (bot.human || bot.dead || bot.hidden || bot.respawnTimer) {
			continue;
		}
		bot.input = botCommand(bot, state);
	}
}
