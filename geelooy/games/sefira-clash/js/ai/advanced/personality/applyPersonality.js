//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the apply personality vessel in this instant, revealing
 * its focused js ai advanced personality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { personalityByIndex } from './personalityConfig.js';

/**
 * B"H
 * Deterministic personality seal.
 *
 * Chapter 5: the bot awakens with a name carved into its will. No dice are
 * thrown; the same arena seed yields the same temper, so fairness remains a
 * bright blade and every rematch can be studied like a sugya of motion.
 */
export function applyPersonality(bot, index = 0) {
	const personality = personalityByIndex(index);
	bot.personality = personality;
	bot.aiMind ||= {};
	bot.aiMind.personality = personality;
	bot.aiMind.personalityName = personality.name;
	return bot;
}
