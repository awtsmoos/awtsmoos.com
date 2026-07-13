//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the character rig vessel in this instant, revealing
 * its focused js render v3 character service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * V3 character rig. The guard protects anatomy without erasing expression; the
 * Awtsmoos lets every joint speak while keeping the vessel finite.
 */
import { V3_STYLE } from './CharacterStyle.js';
/**
 * Reveals the pt behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 */
export const pt = (x, y) => ({ x, y });
/**
 * Reveals the add behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 */
export const add = (p, x, y) => pt(p.x + x, p.y + y);
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
 * Reveals the smooth behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} t The t value entering this behavior.
 */
export const smooth = t => {
	const x = clamp(t, 0, 1);
	return x * x * (3 - 2 * x);
};
/**
 * Reveals the base rig behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function baseRig(f) {
	const face = Math.sign(f.face || 1) || 1,
		x = f.x || 0,
		floor = f.y || 0;
	const crouch = Math.max(0, f.landingLag || 0) > 0 ? 4 : 0;
	const pelvis = pt(x, floor - 70 + crouch),
		chest = pt(x + face * 2, floor - 141 + crouch * 0.4);
	const sw = V3_STYLE.shoulder,
		hw = V3_STYLE.hip;
	return {
		face,
		floor,
		pelvis,
		chest,
		neck: pt(chest.x + face * 2, chest.y - 13),
		head: pt(chest.x + face * 4, floor - 172),
		leftShoulder: pt(chest.x - sw / 2, chest.y + 12),
		rightShoulder: pt(chest.x + sw / 2, chest.y + 12),
		leftHip: pt(pelvis.x - hw / 2, pelvis.y),
		rightHip: pt(pelvis.x + hw / 2, pelvis.y),
		leftElbow: pt(chest.x - 50, chest.y + 53),
		rightElbow: pt(chest.x + 50, chest.y + 53),
		leftHand: pt(chest.x - 44, chest.y + 79),
		rightHand: pt(chest.x + 44, chest.y + 79),
		leftKnee: pt(pelvis.x - 24, pelvis.y + 52),
		rightKnee: pt(pelvis.x + 24, pelvis.y + 52),
		leftFoot: pt(pelvis.x - 35, floor + 1),
		rightFoot: pt(pelvis.x + 35, floor + 1)
	};
}
/**
 * Reveals the guard rig behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 */
export function guardRig(p) {
	p.neck = sane(p.neck, pt(p.chest.x + p.face * 2, p.chest.y - 13));
	p.head = limit(p.neck, sane(p.head, pt(p.neck.x + p.face * 2, p.neck.y - 18)), 23.5);
	for (const side of ['left', 'right']) {
		const hip = sane(p[side + 'Hip'], p.pelvis),
			shoulder = sane(p[side + 'Shoulder'], p.chest);
		let knee = sane(p[side + 'Knee'], pt(hip.x, hip.y + 42));
		let foot = sane(p[side + 'Foot'], pt(knee.x, p.floor + 1));
		let elbow = sane(p[side + 'Elbow'], pt(shoulder.x, shoulder.y + 35));
		let hand = sane(p[side + 'Hand'], pt(elbow.x, elbow.y + 30));
		knee = limit(hip, knee, 76);
		foot = limit(knee, foot, 82);
		elbow = limit(shoulder, elbow, 78);
		hand = limit(elbow, hand, 86);
		if (p.floor && foot.y > p.floor + 5) foot = pt(foot.x, p.floor + 5);
		p[side + 'Knee'] = knee;
		p[side + 'Foot'] = foot;
		p[side + 'Elbow'] = elbow;
		p[side + 'Hand'] = hand;
	}
	return p;
}
function sane(p, fallback) {
	return p && Number.isFinite(p.x) && Number.isFinite(p.y) ? p : fallback;
}
function limit(a, b, len) {
	const dx = b.x - a.x,
		dy = b.y - a.y,
		d = Math.hypot(dx, dy);
	return d > len ? pt(a.x + (dx / d) * len, a.y + (dy / d) * len) : b;
}
