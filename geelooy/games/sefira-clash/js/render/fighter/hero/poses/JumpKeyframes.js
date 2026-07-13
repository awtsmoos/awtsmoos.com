//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the jump keyframes vessel in this instant, revealing
 * its focused js render fighter hero poses service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — Jump/fall keyframes: lifted but readable. */
import { add } from '../math.js';
/**
 * Reveals the apply jump keyframe behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function applyJumpKeyframe(p, f) {
	return air(p, f, 1);
}
/**
 * Reveals the apply fall keyframe behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function applyFallKeyframe(p, f) {
	return air(p, f, -1);
}
function air(p, f, dir) {
	const s = p.scale || 1,
		lift = dir * Math.min(1, Math.abs(f.vy || 8) / 10);
	p.chest = add(p.chest, 0, -4 * lift * s);
	p.neck = add(p.neck, 0, -4 * lift * s);
	p.head = add(p.head, 0, -4 * lift * s);
	p.leftKnee = add(p.leftKnee, -8 * s, -7 * lift * s);
	p.rightKnee = add(p.rightKnee, 8 * s, -7 * lift * s);
	p.leftFoot = add(p.leftFoot, -8 * s, -4 * lift * s);
	p.rightFoot = add(p.rightFoot, 8 * s, -4 * lift * s);
	return p;
}
