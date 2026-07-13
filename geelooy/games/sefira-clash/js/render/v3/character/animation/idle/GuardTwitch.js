//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the guard twitch vessel in this instant, revealing
 * its focused js render v3 character animation idle service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — hands remember danger before thought does. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';
/**
 * Reveals the guard twitch behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} guard The guard value entering this behavior.
 */
export function guardTwitch(p, f, guard = false) {
	const face = p.face,
		t = wave(f, 0.17),
		near = guard || f.nearEnemy,
		heat = f.aiMind?.combatHeat?.heat || 0;
	const lift = near ? -24 - Math.min(12, heat * 0.08) : -2;
	p.leftHand = add(p.leftHand, -face * (near ? 14 : 5) + t * (near ? 2 : 1), lift + t * 2);
	p.rightHand = add(p.rightHand, face * (near ? 16 : 6) - t * (near ? 2 : 1), lift - 3 - t * 2);
	p.leftElbow = add(p.leftElbow, -face * (near ? 8 : 2), near ? -12 : 0);
	p.rightElbow = add(p.rightElbow, face * (near ? 8 : 2), near ? -14 : 0);
	return p;
}
