//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the launch vessel in this instant, revealing
 * its focused js render v3 character animation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — launch gateway: normal flight, wall refusal, ground thunder. */
import { clamp } from './Math.js';
import { baseLaunch } from './launch/BaseLaunch.js';
import { wallBounce } from './launch/WallBounce.js';
import { groundBounce } from './launch/GroundBounce.js';

/**
 * Reveals the launch behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} info The info value entering this behavior.
 */
export function launch(p, f, info = {}) {
	const x = Math.sign(f.vx || p.face || 1);
	const y = clamp((f.vy || -8) / 14, -1, 1);
	if (info.name === 'wallBounce') return wallBounce(p, f, x);
	if (info.name === 'groundBounce') return groundBounce(p, f, x);
	return baseLaunch(p, x, y);
}
