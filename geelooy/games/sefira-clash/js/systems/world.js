//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the world vessel in this instant, revealing
 * its focused js systems service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { createGameState } from '../core/state.js';
import { stepState } from '../core/loop.js';
/**
 * Reveals the create world behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} map The map value entering this behavior.
 * @param {*} botCount The bot count value entering this behavior.
 */
export function createWorld(map, botCount = 5) {
	const state = createGameState(map, botCount);
	state.step = input => stepState(state, input);
	return state;
}
