//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the vector vessel in this instant, revealing
 * its focused js skeleton math service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
export const vec = (x = 0, y = 0) => ({
	x: Number.isFinite(x) ? x : 0,
	y: Number.isFinite(y) ? y : 0
});
/**
 * Reveals the add behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 */
export const add = (a, b) => vec((a?.x || 0) + (b?.x || 0), (a?.y || 0) + (b?.y || 0));
/**
 * Reveals the sub behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 */
export const sub = (a, b) => vec((a?.x || 0) - (b?.x || 0), (a?.y || 0) - (b?.y || 0));
/**
 * Reveals the mul behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} v The v value entering this behavior.
 * @param {*} n The n value entering this behavior.
 */
export const mul = (v, n) => vec((v?.x || 0) * n, (v?.y || 0) * n);
/**
 * Reveals the len behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} v The v value entering this behavior.
 */
export const len = v => Math.hypot(v?.x || 0, v?.y || 0);
/**
 * Reveals the norm behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} v The v value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export const norm = (v, f = { x: 1, y: 0 }) => {
	const l = len(v);
	return l ? vec(v.x / l, v.y / l) : vec(f.x, f.y);
};
/**
 * Reveals the perp behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} v The v value entering this behavior.
 */
export const perp = v => vec(-(v?.y || 0), v?.x || 0);
/**
 * Reveals the angle of behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} v The v value entering this behavior.
 */
export const angleOf = v => Math.atan2(v?.y || 0, v?.x || 0);
