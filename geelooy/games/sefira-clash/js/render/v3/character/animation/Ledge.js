//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ledge vessel in this instant, revealing
 * its focused js render v3 character animation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — ledge gateway: hang, climb, drop, attack. */
import { hangPose } from './ledge/HangPose.js';
import { climbPose } from './ledge/ClimbPose.js';
import { dropPose } from './ledge/DropPose.js';
import { attackPose } from './ledge/AttackPose.js';
/**
 * Reveals the ledge behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} info The info value entering this behavior.
 */
export function ledge(p, f, info = {}) {
	p = hangPose(p, f);
	const input = f.input || f.lastInput || {};
	if (input.jump) return climbPose(p, f);
	if (input.down || input.y > 0.42 || input.aimY > 0.42) return dropPose(p, f);
	if (input.punch || input.kick) return attackPose(p, f);
	return p;
}
