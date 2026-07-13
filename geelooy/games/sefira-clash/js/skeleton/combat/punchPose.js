//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the punch pose vessel in this instant, revealing
 * its focused js skeleton combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import { aimFor, point, perpOf, twistTorso } from './shared.js';
/**
 * Reveals the punch pose behavior through one focused module vessel.
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
export function punchPose(p, f, m, body, intent, phase) {
	const id = f.attack?.id || '',
		aim = aimFor(f, m),
		s = body.height,
		reach = id === 'dashPunch' || id === 'chargePunch' ? 142 : id === 'uppercut' ? 132 : 112,
		draw = (30 + intent.charge * 18) * phase.anticipation * s,
		perp = perpOf(aim),
		sh = p.rightShoulder;
	twistTorso(
		p,
		aim,
		s,
		12 * phase.extension + 10 * phase.anticipation,
		id === 'uppercut' ? -14 * phase.extension : 0
	);
	p.rightElbow = point(
		sh.x + aim.x * (40 + reach * 0.28 * phase.extension) * s + perp.x * draw,
		sh.y + aim.y * (40 + reach * 0.28 * phase.extension) * s + perp.y * draw
	);
	p.rightHand = point(
		sh.x + aim.x * (60 + reach * phase.extension) * s - perp.x * 10 * phase.anticipation,
		sh.y + aim.y * (60 + reach * phase.extension) * s - perp.y * 10 * phase.anticipation
	);
	p.leftHand = point(
		p.leftShoulder.x - aim.x * 42 * s,
		p.leftShoulder.y - aim.y * 18 * s + 54 * s
	);
	return p;
}
