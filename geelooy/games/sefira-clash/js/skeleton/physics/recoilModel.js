//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the recoil model vessel in this instant, revealing
 * its focused js skeleton physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import { clamp } from '../poseMath.js';
/**
 * Reveals the recoil model behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} metrics The metrics value entering this behavior.
 */
export function recoilModel(f, metrics) {
	const active = f.attackFrame || 0,
		rec = f.attack?.recovery || 0;
	return {
		attackRecoil: f.attack
			? clamp((active - (f.attack.startup || 1) - (f.attack.active || 1)) / (rec || 1), 0, 1)
			: 0,
		hitRecoil: f.stun ? clamp(f.stun / 25) : 0,
		landingRecoil: metrics.landingImpact || 0
	};
}
