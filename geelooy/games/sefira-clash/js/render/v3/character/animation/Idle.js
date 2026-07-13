//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the idle vessel in this instant, revealing
 * its focused js render v3 character animation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — idle is now breath, twitch, and weight. */
import { breath } from './idle/Breath.js';
import { guardTwitch } from './idle/GuardTwitch.js';
import { weightShift } from './idle/WeightShift.js';
/**
 * Reveals the idle behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} info The info value entering this behavior.
 */
export function idle(p, f, info = {}) {
	const guard = info.name === 'combatIdle' || f.nearEnemy || f.aiMind?.combatHeat?.forceEngage;
	p = breath(p, f, guard);
	p = guardTwitch(p, f, guard);
	p = weightShift(p, f, guard);
	return p;
}
