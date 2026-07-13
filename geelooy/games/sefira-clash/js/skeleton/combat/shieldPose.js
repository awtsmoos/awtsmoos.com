//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the shield pose vessel in this instant, revealing
 * its focused js skeleton combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import { point } from './shared.js';
/**
 * Reveals the shield pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} m The m value entering this behavior.
 * @param {*} body The body value entering this behavior.
 */
export function shieldPose(p, f, m, body) {
	const s = body.height,
		face = m.facing;
	p.chest.x -= face * 4 * s;
	p.leftElbow = point(p.chest.x + face * 18 * s, p.chest.y + 26 * s);
	p.leftHand = point(p.chest.x + face * 45 * s, p.chest.y + 42 * s);
	p.rightElbow = point(p.chest.x + face * 18 * s, p.chest.y + 52 * s);
	p.rightHand = point(p.chest.x + face * 48 * s, p.chest.y + 62 * s);
	p.leftFoot.x -= 8 * s;
	p.rightFoot.x += 8 * s;
	return p;
}
