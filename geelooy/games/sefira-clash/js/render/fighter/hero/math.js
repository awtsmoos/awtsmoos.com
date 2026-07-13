//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the math vessel in this instant, revealing
 * its focused js render fighter hero service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hero renderer math.
 *
 * Chapter 173: the hero body begins with tiny points of certainty. The
 * Awtsmoos gives clamp, point, and blend so the mockup can enter canvas.
 */
export const point = (x, y) => ({ x, y });
/**
 * Reveals the clamp behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} n The n value entering this behavior.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 */
export const clamp = (n, a, b) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
/**
 * Reveals the mix behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} t The t value entering this behavior.
 */
export const mix = (a, b, t) =>
	point(a.x + (b.x - a.x) * clamp(t, 0, 1), a.y + (b.y - a.y) * clamp(t, 0, 1));
/**
 * Reveals the add behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 */
export const add = (p, x, y) => point(p.x + x, p.y + y);
/**
 * Reveals the dist behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 */
export const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
/**
 * Reveals the smooth behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} t The t value entering this behavior.
 */
export function smooth(t) {
	const x = clamp(t, 0, 1);
	return x * x * (3 - 2 * x);
}
