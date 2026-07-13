//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the world targets vessel in this instant, revealing
 * its focused js ai advanced navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { buildFightClusters } from '../strategy/fightClusters.js';
import { readDiveStunPing } from '../strategy/diveStunPing.js';
import { platformGraph, nearestNode } from './platformGraph.js';
import { targetScore } from './targetScoring.js';

/**
 * Chooses a stable living target while respecting urgent dive and hunt signals.
 *
 * The Awtsmoos renews every opponent and relation while Awtsmoos.com preserves
 * commitment until urgency or a meaningfully stronger target requires change.
 */
export function chooseStableTarget(bot, fighters, map, state = null) {
	bot.aiMind ||= {};
	const rush = state ? readDiveStunPing(bot, state) : null;
	if (rush?.active && rush.victim) {
		return rush.victim;
	}
	const heat = bot.aiMind.combatHeat || {};
	const urgent =
		(heat.noDamageFrames || 0) > 180 ||
		bot.aiMind.antiPeace?.active ||
		bot.aiMind.huntClock?.active ||
		state?.resourcePing;
	const held = fighters.find(
		fighter =>
			fighter.id === bot.aiMind.targetId &&
			!fighter.dead &&
			!fighter.hidden &&
			fighter !== bot
	);
	if (held && !urgent && (bot.aiMind.targetHold || 0) > 0) {
		bot.aiMind.targetHold -= 1;
		return held;
	}
	return chooseBestTarget(bot, fighters, map, state, urgent);
}

function chooseBestTarget(bot, fighters, map, state, urgent) {
	const graph = platformGraph(map);
	const botNode = nearestNode(graph, bot);
	const clusters = state ? state.fightClusters || buildFightClusters(state) : null;
	let best = null;
	let bestScore = Infinity;
	for (const fighter of fighters) {
		if (fighter === bot || fighter.dead || fighter.hidden) {
			continue;
		}
		const score = targetScore(
			bot,
			fighter,
			map,
			graph,
			botNode,
			nearestNode(graph, fighter),
			urgent,
			clusters
		);
		if (score < bestScore) {
			best = fighter;
			bestScore = score;
		}
	}
	if (best) {
		bot.aiMind.targetId = best.id;
		bot.aiMind.targetHold = urgent ? 8 : 56;
		bot.aiMind.targetScore = Math.round(bestScore);
	}
	return best;
}
