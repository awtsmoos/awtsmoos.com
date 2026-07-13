//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the locomotion vessel in this instant, revealing
 * its focused js render fighter capsule service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Slower mobile-safe locomotion offsets.
 *
 * Chapter 155: the fighter breathes like a warrior, not a flickering bug. Run
 * stride is now half as violent and much slower to the eye.
 */
import { add, clamp } from './math.js';
import { LIMB_BOUNDS } from './limbBounds.js';

/**
 * Reveals the apply locomotion pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function applyLocomotionPose(p, f) {
	const speed = clamp(Math.abs(f.vx || 0) / 9, 0, 1);
	const clock = f.motionClock || 0;
	const phase = Math.sin(clock * LIMB_BOUNDS.timing.run);
	const grounded = !!f.grounded;
	const breathe = Math.sin(clock * LIMB_BOUNDS.timing.idle) * 0.85;
	const run = grounded ? speed : 0;
	p.chest = add(p.chest, (f.face || 1) * run * 1.2, breathe - run * 1.1);
	p.neck = add(p.neck, (f.face || 1) * run * 1.1, breathe - run * 1.1);
	p.head = add(p.head, (f.face || 1) * run * 1.4, breathe - run * 1.2);
	if (run > 0.05) applyRunStride(p, phase, run, f.face || 1);
	if (!grounded) applyAirPose(p, f);
	return p;
}

function applyRunStride(p, phase, run, face) {
	const swing = phase * run;
	p.leftElbow = add(p.leftElbow, -face * swing * 4.5, Math.abs(swing));
	p.rightElbow = add(p.rightElbow, face * swing * 4.5, Math.abs(swing));
	p.leftHand = add(p.leftHand, -face * swing * 7, 0);
	p.rightHand = add(p.rightHand, face * swing * 7, 0);
	p.leftKnee = add(p.leftKnee, face * swing * 7, -Math.max(0, swing) * 3.5);
	p.rightKnee = add(p.rightKnee, -face * swing * 7, -Math.max(0, -swing) * 3.5);
	p.leftFoot = add(p.leftFoot, face * swing * 9, -Math.max(0, swing) * 4.5);
	p.rightFoot = add(p.rightFoot, -face * swing * 9, -Math.max(0, -swing) * 4.5);
}

function applyAirPose(p, f) {
	const lift = clamp(-(f.vy || 0) / 12, -1, 1);
	p.leftKnee = add(p.leftKnee, -7, -7 * lift);
	p.rightKnee = add(p.rightKnee, 7, -7 * lift);
	p.leftFoot = add(p.leftFoot, -8, -9 * lift);
	p.rightFoot = add(p.rightFoot, 8, -9 * lift);
	p.leftHand = add(p.leftHand, -4, -6 * lift);
	p.rightHand = add(p.rightHand, 4, -6 * lift);
}
