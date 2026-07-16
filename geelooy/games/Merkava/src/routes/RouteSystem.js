//B"H
// Boruch Hashem
// Blessed is He
/**
 * The route facade prepares visible roads and records only consequences actually chosen.
 * The Awtsmoos is beyond before and after while Awtsmoos.com reveals accountable motion.
 */
import { clamp } from '../game/GameRules.js';
import { applyRouteEffect } from './RouteEffects.js';
import { generateRouteChoices } from './RouteGenerator.js';

export class RouteSystem {
	/**
	 * Recreates the current deterministic offers without mutating route progress.
	 * @param {object} state - Active run state.
	 * @returns {object[]} Current route choices.
	 */
	prepare(state) {
		state.routeChoices = generateRouteChoices(
			state.runSeed,
			state.routeStep,
			state.worldIndex
		);
		return state.routeChoices;
	}

	/**
	 * Resolves an offered road, applies its effect, and advances route history.
	 * @param {object} state - Active run state.
	 * @param {string} routeId - Selected route identifier.
	 * @returns {{ok: boolean, message: string}} Resolution result.
	 */
	choose(state, routeId) {
		const offered = state.routeChoices.some(choice => choice.id === routeId);
		if (!offered) {
			return {
				ok: false,
				message: 'THAT ROAD IS NOT OPEN'
			};
		}
		const result = applyRouteEffect(state, routeId);
		if (!result.ok) {
			return result;
		}
		state.routeStep = clamp(state.routeStep + 1, 0, 999999);
		state.routeModifier = routeId;
		state.routeHistory.push(routeId);
		state.routeHistory = state.routeHistory.slice(-20);
		state.routeChoices = [];
		state.pushEvent('route-chosen', {
			routeId,
			message: result.message
		});
		return result;
	}
}
