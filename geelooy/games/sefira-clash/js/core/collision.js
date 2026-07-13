//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the collision vessel in this instant, revealing
 * its focused js core service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — collision is the saying: this soul has reached that boundary. */
export function pointInRect(p, r) {
	return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
/**
 * Reveals the circle hit behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} radius The radius value entering this behavior.
 */
export function circleHit(a, b, radius) {
	return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= radius * radius;
}
/**
 * Reveals the platform landing behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} p The p value entering this behavior.
 */
export function platformLanding(f, p) {
	return f.x > p.x && f.x < p.x + p.w && f.vy >= 0 && f.prevY <= p.y && f.y >= p.y - 9;
}
