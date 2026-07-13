//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the index vessel in this instant, revealing
 * its focused js render fighter capsule authored service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Authored pose selector.
 *
 * Chapter 166: one gate chooses the fighter's visible story. The Awtsmoos lets
 * idle, run, air, attack, and hit each speak in a clear order.
 */
import { basePose } from './basePose.js';
import { idlePose } from './idlePose.js';
import { runPose } from './runPose.js';
import { airPose } from './airPose.js';
import { attackPose } from './attackPose.js';
import { hitPose } from './hitPose.js';

/**
 * Reveals the authored pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function authoredPose(f) {
	let p = basePose(f);
	p = Math.abs(f.vx || 0) > 0.9 && f.grounded ? runPose(p, f) : idlePose(p, f);
	if (!f.grounded) p = airPose(p, f);
	p = attackPose(p, f);
	p = hitPose(p, f);
	return p;
}
