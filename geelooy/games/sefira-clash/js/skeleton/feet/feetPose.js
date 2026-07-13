//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the feet pose vessel in this instant, revealing
 * its focused js skeleton feet service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
import { footPhase } from './footPhase.js';
import { heelStrike } from './heelStrike.js';
import { toePush } from './toePush.js';
import { pivotFoot } from './pivotFoot.js';
import { brakingFoot } from './brakingFoot.js';
import { footLock } from './footLock.js';
import { footSlip } from './footSlip.js';
/**
 * Reveals the feet pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} metrics The metrics value entering this behavior.
 * @param {*} body The body value entering this behavior.
 */
export function feetPose(p, f, metrics, body) {
	const phase = footPhase(metrics);
	heelStrike(p, f, metrics, body, phase);
	toePush(p, f, metrics, body, phase);
	pivotFoot(p, f, metrics, body, phase);
	brakingFoot(p, f, metrics, body);
	footLock(p, f, metrics, body, phase);
	footSlip(p, f, metrics, body, phase);
	f.visualFeet = phase;
	return p;
}
