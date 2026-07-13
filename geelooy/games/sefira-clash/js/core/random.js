//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the random vessel in this instant, revealing
 * its focused js core service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — deterministic sparks: one seed becomes a whole fighter's destiny. */
export function hashSeed(text) {
	let h = 2166136261;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
/**
 * Reveals the rng behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} seedText The seed text value entering this behavior.
 */
export function rng(seedText) {
	let s = hashSeed(seedText) || 1;
	return (min = 0, max = 1) => {
		s ^= s << 13;
		s ^= s >>> 17;
		s ^= s << 5;
		const u = ((s >>> 0) % 100000) / 100000;
		return min + (max - min) * u;
	};
}
/**
 * Reveals the pick behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} rand The rand value entering this behavior.
 * @param {*} list The list value entering this behavior.
 */
export function pick(rand, list) {
	return list[Math.floor(rand(0, list.length)) % list.length];
}
