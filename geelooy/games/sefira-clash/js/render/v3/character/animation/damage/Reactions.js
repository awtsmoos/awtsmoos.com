//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the reactions vessel in this instant, revealing
 * its focused js render v3 character animation damage service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — damage tiers: recoil, stun-sway, and dizzy wobble in revealed measure. */
import { add } from '../../CharacterRig.js';
import { clamp, wave } from '../Math.js';

/**
 * Reveals the reaction behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} info The info value entering this behavior.
 */
export function reaction(p, f, info = {}) {
	const force = clamp((f.stun || 0) / 55 + (f.hitstop || 0) / 18 + info.heavy * 0.55, 0.12, 1.15);
	const dir = -Math.sign(f.vx || -p.face || -1);
	const heavy = info.name === 'hitHeavy';
	const dizzy = info.name === 'dizzy' || ((f.damage || 0) > 130 && (f.stun || 0) < 12);
	const sway = wave(f, dizzy ? 0.22 : 0.13) * (dizzy ? 12 : 4) * force;
	p.pelvis = add(p.pelvis, dir * (4 * force + dizzy * 5), 2 * force + dizzy * 4);
	p.chest = add(
		p.chest,
		dir * (heavy ? 15 : 10) * force + sway,
		(heavy ? 4 : 2) * force + dizzy * 8
	);
	p.neck = add(p.neck, dir * 10 * force + sway * 0.8, -5 * force + dizzy * 4);
	p.head = add(p.head, dir * (heavy ? 15 : 11) * force + sway * 1.3, -8 * force + dizzy * 9);
	p.leftHand = add(p.leftHand, dir * (heavy ? 24 : 15) * force - sway, -12 * force + dizzy * 20);
	p.rightHand = add(
		p.rightHand,
		dir * (heavy ? 27 : 17) * force + sway,
		-15 * force + dizzy * 16
	);
	p.leftKnee = add(p.leftKnee, dir * 6 * force - sway * 0.2, -5 * force + dizzy * 6);
	p.rightKnee = add(p.rightKnee, dir * 8 * force + sway * 0.2, -3 * force + dizzy * 6);
	return p;
}
