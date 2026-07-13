//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pose point vessel in this instant, revealing
 * its focused js skeleton math service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
import { lerp } from './scalar.js';
/**
 * Reveals the point behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 */
export const point = (x, y) => ({ x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 });
/**
 * Reveals the move point behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} dx The dx value entering this behavior.
 * @param {*} dy The dy value entering this behavior.
 */
export const movePoint = (p, dx = 0, dy = 0) => ((p.x += dx), (p.y += dy), p);
/**
 * Reveals the lerp point behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} t The t value entering this behavior.
 */
export const lerpPoint = (a, b, t) => point(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
/**
 * Reveals the offset along behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} d The d value entering this behavior.
 * @param {*} dist The dist value entering this behavior.
 */
export const offsetAlong = (p, d, dist) =>
	point(p.x + (d?.x || 0) * dist, p.y + (d?.y || 0) * dist);
