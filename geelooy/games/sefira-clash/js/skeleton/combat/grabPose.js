//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the grab pose vessel in this instant, revealing
 * its focused js skeleton combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import { point } from './shared.js';
/**
 * Reveals the grab pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} m The m value entering this behavior.
 * @param {*} body The body value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} phase The phase value entering this behavior.
 */
export function grabPose(p, f, m, body, intent, phase) {
	const s = body.height,
		face = m.facing;
	p.chest.x += face * 10 * s;
	p.head.x += face * 6 * s;
	p.rightElbow = point(
		p.rightShoulder.x + face * (42 + 18 * phase.extension) * s,
		p.rightShoulder.y + 26 * s
	);
	p.rightHand = point(
		p.rightShoulder.x + face * (70 + 24 * phase.extension) * s,
		p.rightShoulder.y + 34 * s
	);
	return p;
}
