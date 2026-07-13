//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the scalar vessel in this instant, revealing
 * its focused js skeleton math service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
export const clamp = (v, min = 0, max = 1) =>
	Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));
/**
 * Reveals the lerp behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} t The t value entering this behavior.
 */
export const lerp = (a, b, t) => a + (b - a) * clamp(t);
/**
 * Reveals the smoothstep behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} x The x value entering this behavior.
 */
export const smoothstep = (a, b, x) => {
	const t = clamp((x - a) / (b - a || 1));
	return t * t * (3 - 2 * t);
};
/**
 * Reveals the approach behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} v The v value entering this behavior.
 * @param {*} t The t value entering this behavior.
 * @param {*} a The a value entering this behavior.
 */
export const approach = (v, t, a) => (v < t ? Math.min(t, v + a) : Math.max(t, v - a));
/**
 * Reveals the sign or behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} v The v value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export const signOr = (v, f = 1) => (v < 0 ? -1 : v > 0 ? 1 : f);
/**
 * Reveals the spring value behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} value The value value entering this behavior.
 * @param {*} target The target value entering this behavior.
 * @param {*} velocity The velocity value entering this behavior.
 * @param {*} stiffness The stiffness value entering this behavior.
 * @param {*} damping The damping value entering this behavior.
 */
export function springValue(value, target, velocity = 0, stiffness = 0.18, damping = 0.72) {
	const next = (velocity + (target - value) * stiffness) * damping;
	return { value: value + next, velocity: next };
}
