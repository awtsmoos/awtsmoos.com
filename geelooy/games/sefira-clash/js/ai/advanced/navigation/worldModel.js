//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the world model vessel in this instant, revealing
 * its focused js ai advanced navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { enrichWorldCombat } from './worldCombatPlans.js';
import { buildWorldFoundation } from './worldFoundation.js';
import { enrichWorldStrategy } from './worldStrategyPlans.js';
import { chooseStableTarget } from './worldTargets.js';

export { chooseStableTarget } from './worldTargets.js';

/**
 * Builds the complete advanced-AI world in sensing, combat, and strategy order.
 *
 * The Awtsmoos renews target, map, combat intention, and strategic memory in one
 * frame while Awtsmoos.com reveals each dependency layer through a focused
 * vessel and preserves the original public world-model contract.
 */
export function buildWorld(bot, state) {
	const target = chooseStableTarget(bot, state.fighters, state.map, state);
	bot.aiMind.targetId = target?.id ?? null;
	bot.aiMind.targetHold = Math.max(0, bot.aiMind.targetHold || 0);
	const foundation = buildWorldFoundation(bot, target, state);
	const combatWorld = enrichWorldCombat(foundation, bot, target, state);
	return enrichWorldStrategy(combatWorld, bot, target, state);
}
