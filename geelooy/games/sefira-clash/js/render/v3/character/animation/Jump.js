//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the jump vessel in this instant, revealing
 * its focused js render v3 character animation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — jump gateway: ground, double, apex, fall, dive. */
import { groundJump } from './jump/GroundJump.js';
import { doubleJump } from './jump/DoubleJump.js';
import { apexHang } from './jump/ApexHang.js';
import { fallPanic } from './jump/FallPanic.js';
import { divePose } from './jump/DivePose.js';
/**
 * Reveals the jump behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} info The info value entering this behavior.
 */
export function jump(p, f, info = {}) {
	if (info.name === 'doubleJump') return doubleJump(p, f);
	if (info.name === 'peak') return apexHang(p, f);
	if (info.name === 'falling' || info.name === 'fastFall')
		return fallPanic(p, f, info.name === 'fastFall');
	if (info.name === 'dive' || f.diveAttackFrames > 0 || f.diving > 0) return divePose(p, f);
	return groundJump(p, f);
}
