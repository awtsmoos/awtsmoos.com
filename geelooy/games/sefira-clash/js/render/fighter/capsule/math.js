//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the math vessel in this instant, revealing
 * its focused js render fighter capsule service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Capsule math helpers.
 *
 * Chapter 126: every point is a small spark of order. The Awtsmoos gives us
 * clamp, lerp, and distance so the visual body can become calm and exact.
 */
export function point(x, y) {
	return { x, y };
}

/**
 * Reveals the good behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 */
export function good(p) {
	return p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

/**
 * Reveals the clamp behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} n The n value entering this behavior.
 * @param {*} lo The lo value entering this behavior.
 * @param {*} hi The hi value entering this behavior.
 */
export function clamp(n, lo, hi) {
	return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

/**
 * Reveals the lerp behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} t The t value entering this behavior.
 */
export function lerp(a, b, t) {
	return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Reveals the mix behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} t The t value entering this behavior.
 */
export function mix(a, b, t) {
	return point(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
}

/**
 * Reveals the add behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 */
export function add(a, x, y) {
	return point(a.x + x, a.y + y);
}

/**
 * Reveals the dist behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 */
export function dist(a, b) {
	return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Reveals the toward behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} len The len value entering this behavior.
 */
export function toward(a, b, len) {
	const d = dist(a, b) || 1;
	return point(a.x + ((b.x - a.x) / d) * len, a.y + ((b.y - a.y) / d) * len);
}
