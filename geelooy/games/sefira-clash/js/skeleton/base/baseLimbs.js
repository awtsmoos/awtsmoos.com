//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the base limbs vessel in this instant, revealing
 * its focused js skeleton base service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Calmer humanoid base limbs.
 *
 * Chapter 116: walking should swing, not collapse. The Awtsmoos gives arms and
 * legs a readable default that later combat may bend without making a crab.
 */
import { point } from '../poseMath.js';

function clamp(n, lo, hi) {
	return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

/**
 * Reveals the base limbs behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} a The a value entering this behavior.
 * @param {*} m The m value entering this behavior.
 * @param {*} body The body value entering this behavior.
 */
export function baseLimbs(f, a, m, body) {
	const s = clamp(body.height || 1, 0.84, 1.18);
	const speed = clamp((m.horizontalSpeed || 0) / 10, 0, 1);
	const dir = Math.sign(m.movingDirection || f.face || 1) || 1;
	const phase = Math.sin((m.footPhase || 0) * Math.PI * 2) * speed * dir;
	const armSwing = phase * 13 * s;
	const legSwing = phase * 17 * s;
	const floor = f.y + 3;
	return {
		...a,
		leftElbow: point(a.leftShoulder.x - 10 * s - armSwing, a.leftShoulder.y + 34 * s),
		leftHand: point(a.leftShoulder.x - 14 * s - armSwing * 1.3, a.leftShoulder.y + 66 * s),
		rightElbow: point(a.rightShoulder.x + 10 * s + armSwing, a.rightShoulder.y + 34 * s),
		rightHand: point(a.rightShoulder.x + 14 * s + armSwing * 1.3, a.rightShoulder.y + 66 * s),
		leftKnee: point(a.leftHip.x - legSwing * 0.45, a.leftHip.y + 35 * s),
		leftFoot: point(a.leftHip.x - 14 * s - legSwing, floor),
		rightKnee: point(a.rightHip.x + legSwing * 0.45, a.rightHip.y + 35 * s),
		rightFoot: point(a.rightHip.x + 14 * s + legSwing, floor)
	};
}
