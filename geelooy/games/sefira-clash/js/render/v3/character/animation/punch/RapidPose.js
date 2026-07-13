//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the rapid pose vessel in this instant, revealing
 * its focused js render v3 character animation punch service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — rapid punch alternates fists and vibrates the torso. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';
/**
 * Reveals the rapid pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} phase The phase value entering this behavior.
 */
export function rapidPose(p, f, phase) {
	const face = p.face,
		swap = wave(f, 0.9) > 0,
		side = swap ? 'right' : 'left',
		other = swap ? 'left' : 'right',
		sign = side === 'right' ? 1 : -1;
	const hit = phase.name === 'action' ? phase.t : 0.55,
		wind = phase.name === 'anticipation' ? 1 - phase.t : 0.2,
		rec = phase.name === 'followThrough' ? phase.t : 0;
	const reach = 44 + Math.abs(wave(f, 0.9)) * 28;
	p.chest = add(p.chest, wave(f, 0.9) * 4, -3);
	p.head = add(p.head, wave(f, 1.2) * 2, -1);
	p[side + 'Elbow'] = add(
		p[side + 'Shoulder'],
		sign * (-wind * 18 + hit * reach * 0.5 + rec * 18),
		28 - wind * 16 - hit * 12 + rec * 18
	);
	p[side + 'Hand'] = add(
		p[side + 'Shoulder'],
		sign * (-wind * 30 + hit * reach + rec * 28),
		24 - wind * 18 - hit * 16 + rec * 20
	);
	p[other + 'Hand'] = add(p[other + 'Shoulder'], -sign * 30, 48);
	p.leftFoot = add(p.leftFoot, -face * 2, 0);
	p.rightFoot = add(p.rightFoot, face * 2, 0);
	return p;
}
