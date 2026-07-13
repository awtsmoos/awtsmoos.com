//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hit vessel in this instant, revealing
 * its focused js render fighter hero poses service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hero hit pose.
 *
 * Chapter 178: recoil bends the hero without destroying the silhouette.
 */
import { add, clamp } from '../math.js';

/**
 * Reveals the apply hero hit behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function applyHeroHit(p, f) {
	const force = Math.max(
		clamp((f.stun || 0) / 48, 0, 1),
		clamp((f.damage || 0) / 220, 0, 1) * 0.16
	);
	if (force <= 0) return p;
	const away = Math.sign(f.vx || -p.face) || -p.face;
	p.chest = add(p.chest, away * force * 7, force * 3);
	p.head = add(p.head, away * force * 9, -force * 3);
	p.leftHand = add(p.leftHand, away * force * 7, force * 4);
	p.rightHand = add(p.rightHand, away * force * 7, force * 4);
	p.leftFoot = add(p.leftFoot, away * force * 3, force * 4);
	p.rightFoot = add(p.rightFoot, away * force * 3, force * 4);
	return p;
}
