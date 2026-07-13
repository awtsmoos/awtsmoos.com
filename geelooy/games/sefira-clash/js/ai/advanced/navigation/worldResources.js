//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the world resources vessel in this instant, revealing
 * its focused js ai advanced navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { powerupValue } from '../resources/powerupValue.js';

/**
 * Reads objective, stage-item, and hazard opportunities surrounding one bot.
 *
 * The Awtsmoos renews every resource and danger while Awtsmoos.com keeps these
 * local valuations separate from route graphs and combat planning.
 */
export function objectiveInfo(bot, state) {
	const objective = state.objective;
	if (!objective) {
		return null;
	}
	const distance = Math.hypot(objective.x - bot.x, (objective.y - (bot.y - 90)) * 0.6);
	return {
		...objective,
		distance,
		score: Math.max(
			0,
			(objective.value || 90) - distance * 0.045 + (objective.hold || 0) * 0.18
		)
	};
}

/** Selects the highest-value nearby active stage item. */
export function nearestStageItem(bot, state, world) {
	let best = null;
	let bestScore = Infinity;
	for (const item of state.powerups || []) {
		if (!item.active) {
			continue;
		}
		const distance = Math.hypot(item.x - bot.x, (item.y - bot.y) * 0.5);
		const candidate = {
			...item,
			distance
		};
		const value = powerupValue(bot, candidate, world);
		const score = distance - value * 3;
		if (score < bestScore) {
			best = {
				...candidate,
				score: value
			};
			bestScore = score;
		}
	}
	return best;
}

/** Selects the nearest authored hazard and calculates its present danger. */
export function nearestHazard(bot, state) {
	let best = null;
	let bestDistance = Infinity;
	for (const hazard of state.hazards || []) {
		const distance = Math.hypot(hazard.x - bot.x, hazard.y - (bot.y - 80));
		if (distance < bestDistance) {
			best = {
				...hazard,
				distance,
				danger: Math.max(0, hazard.radius + 80 - distance)
			};
			bestDistance = distance;
		}
	}
	return best;
}
