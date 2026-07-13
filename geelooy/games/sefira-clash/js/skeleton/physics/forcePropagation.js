//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the force propagation vessel in this instant, revealing
 * its focused js skeleton physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import { clamp } from '../poseMath.js';
/**
 * Reveals the force propagation behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} metrics The metrics value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function forcePropagation(f, metrics, intent) {
	const hit = f.stun > 0 ? clamp((f.stun || 0) / 30) : 0,
		attack = f.attack ? 1 : 0,
		land = metrics.landingImpact || 0,
		run = clamp(metrics.horizontalSpeed / 12);
	return {
		footToHip: run * 0.35 + land * 0.8,
		hipToChest: run * 0.28 + attack * 0.4 + land * 0.6,
		chestToHead: attack * 0.28 + hit * 0.65 + land * 0.35,
		shoulderWhip: attack * 0.9 + intent.charge * 0.35,
		damageWave: hit + intent.damageCurl * 0.35
	};
}
