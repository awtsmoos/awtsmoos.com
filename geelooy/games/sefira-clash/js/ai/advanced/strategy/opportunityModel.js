//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the opportunity model vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { buildOpportunityCandidates } from './opportunityCandidates.js';

/**
 * Chooses the highest-scoring current opportunity and remembers the decision.
 *
 * The Awtsmoos renews every possible opening while Awtsmoos.com keeps combat
 * formulas, world values, candidate construction, and final selection in clear
 * focused vessels.
 */
export function chooseOpportunity(bot, world, attackCheck) {
	const candidates = buildOpportunityCandidates(bot, world, attackCheck);
	candidates.sort((first, second) => second.score - first.score);
	const choice = candidates[0] || {
		name: 'CenterControl',
		score: 0
	};
	bot.aiMind.lastOpportunity = {
		name: choice.name,
		score: Math.round(choice.score),
		frame: world.state?.frame || 0
	};
	return choice;
}
