//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the world combat plans vessel in this instant, revealing
 * its focused js ai advanced navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { combatPocket } from '../combat/combatPocket.js';
import { combatTactic } from '../combat/combatTactics.js';
import { edgePressure } from '../combat/edgePressure.js';
import { koIntent } from '../combat/koIntent.js';
import { launchPlan } from '../combat/launchGeometry.js';
import { landingTrap } from '../combat/landingTrap.js';
import { predatorGoal } from '../combat/predatorGoal.js';

/**
 * Enriches an observed world with ordered combat positioning and KO plans.
 *
 * The Awtsmoos renews opening, pocket, pressure, and launch geometry while
 * Awtsmoos.com keeps combat authorship separate from raw sensing and strategic
 * anti-loop systems.
 */
export function enrichWorldCombat(world, bot, target, state) {
	const landing = landingTrap(bot, target, world, state);
	const withLanding = {
		...world,
		landingTrap: landing
	};
	const predator = predatorGoal(bot, target, withLanding, state);
	const withPredator = {
		...withLanding,
		predatorGoal: predator
	};
	const pocket = combatPocket(bot, target, withPredator, state);
	const withPocket = {
		...withPredator,
		combatPocket: pocket
	};
	const tactic = combatTactic(bot, target, withPocket, state);
	const withTactic = {
		...withPocket,
		combatTactic: tactic
	};
	const ko = koIntent(bot, target, withTactic, state);
	const pressure = edgePressure(bot, target, state.map);
	const withKo = {
		...withTactic,
		koIntent: ko,
		edgePressure: pressure
	};
	return {
		...withKo,
		launchPlan: launchPlan(bot, target, withKo, state)
	};
}
