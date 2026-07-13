//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the idle keyframes vessel in this instant, revealing
 * its focused js render fighter hero poses service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Taller idle keyframe.
 *
 * Chapter 223: the hero stands upright now. The elbows soften, the fists hover
 * near the belt, and the legs stop pretending every idle is a crouch.
 */
import { add } from '../math.js';

/**
 * Reveals the apply idle keyframe behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function applyIdleKeyframe(p, f) {
	const s = p.scale || 1;
	const b = Math.sin((f.motionClock || 0) * 0.009) * 0.45 * s;
	p.chest = add(p.chest, 0, b);
	p.neck = add(p.neck, 0, b);
	p.head = add(p.head, 0, b);
	p.leftElbow = add(p.leftElbow, 5 * s, -7 * s);
	p.rightElbow = add(p.rightElbow, -5 * s, -7 * s);
	p.leftHand = add(p.leftHand, 8 * s, -12 * s);
	p.rightHand = add(p.rightHand, -8 * s, -12 * s);
	p.leftKnee = add(p.leftKnee, 3 * s, -2 * s);
	p.rightKnee = add(p.rightKnee, -3 * s, -2 * s);
	return p;
}
