//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the base pose vessel in this instant, revealing
 * its focused js skeleton service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import { baseAnchors } from './base/baseAnchors.js';
import { baseLimbs } from './base/baseLimbs.js';
import { bodyArchetype } from './style/bodyArchetype.js';
/**
 * Reveals the base pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} metricsOrFacing The metrics or facing value entering this behavior.
 * @param {*} bodyOrWalk The body or walk value entering this behavior.
 * @param {*} balanceOrScale The balance or scale value entering this behavior.
 * @param {*} anim The anim value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function basePose(f, metricsOrFacing, bodyOrWalk, balanceOrScale, anim, intent) {
	const legacy = typeof metricsOrFacing === 'number',
		m = legacy
			? {
					facing: metricsOrFacing,
					horizontalSpeed: Math.abs(f.vx || 0),
					movingDirection: Math.sign(f.vx || metricsOrFacing || 1),
					footPhase: (f.motionClock || 0) * 0.067
				}
			: metricsOrFacing,
		body = legacy ? bodyArchetype(f) : bodyOrWalk,
		balance = legacy
			? { balanceLean: intent?.lean || 0, recoveryLean: 0, panicBackLean: 0 }
			: balanceOrScale;
	return baseLimbs(f, baseAnchors(f, m, body, balance, anim, intent), m, body);
}
