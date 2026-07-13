//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the motion vessel in this instant, revealing
 * its focused js render fighter hero poses service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hero motion poses.
 *
 * Chapter 176: motion becomes authored rhythm. Idle, run, and air are calm,
 * readable, and heavy like a tiny action figure.
 */
import { add, clamp } from '../math.js';
import { HERO } from '../style.js';

/**
 * Reveals the apply hero motion behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function applyHeroMotion(p, f) {
	const speed = clamp(Math.abs(f.vx || 0) / 8, 0, 1);
	if (!f.grounded) return air(p, f);
	return speed > 0.08 ? run(p, f, speed) : idle(p, f);
}

function idle(p, f) {
	const b = Math.sin((f.motionClock || 0) * HERO.timing.idle) * 0.9;
	p.chest = add(p.chest, 0, b);
	p.neck = add(p.neck, 0, b);
	p.head = add(p.head, 0, b);
	return p;
}

function run(p, f, speed) {
	const face = p.face;
	const s = Math.sin((f.motionClock || 0) * HERO.timing.run) * speed;
	p.chest = add(p.chest, face * speed * 3, -speed * 2);
	p.neck = add(p.neck, face * speed * 3, -speed * 2);
	p.head = add(p.head, face * speed * 4, -speed * 2);
	p.leftHand = add(p.leftHand, -face * s * 18, 0);
	p.rightHand = add(p.rightHand, face * s * 18, 0);
	p.leftFoot = add(p.leftFoot, face * s * 18, -Math.max(0, s) * 7);
	p.rightFoot = add(p.rightFoot, -face * s * 18, -Math.max(0, -s) * 7);
	p.leftKnee = add(p.leftKnee, face * s * 13, -Math.max(0, s) * 5);
	p.rightKnee = add(p.rightKnee, -face * s * 13, -Math.max(0, -s) * 5);
	return p;
}

function air(p, f) {
	const lift = clamp(-(f.vy || 0) / 10, -1, 1);
	p.chest = add(p.chest, 0, -lift * 4);
	p.neck = add(p.neck, 0, -lift * 4);
	p.head = add(p.head, 0, -lift * 4);
	p.leftKnee = add(p.leftKnee, -8, -lift * 7);
	p.rightKnee = add(p.rightKnee, 8, -lift * 7);
	p.leftFoot = add(p.leftFoot, -8, -lift * 4);
	p.rightFoot = add(p.rightFoot, 8, -lift * 4);
	return p;
}
