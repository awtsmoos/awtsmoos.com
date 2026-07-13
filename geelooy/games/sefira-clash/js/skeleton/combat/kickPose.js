//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the kick pose vessel in this instant, revealing
 * its focused js skeleton combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import { aimFor, point, perpOf, twistTorso } from './shared.js';
/**
 * Reveals the kick pose behavior through one focused module vessel.
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
export function kickPose(p, f, m, body, intent, phase) {
	const id = f.attack?.id || '',
		aim = aimFor(f, m),
		s = body.height,
		reach =
			id === 'roundhouse' ? 142 : id === 'aerialKick' ? 150 : id === 'meteorKick' ? 146 : 116,
		hip = p.rightHip,
		perp = perpOf(aim),
		fold = (38 + intent.panic * 12) * phase.anticipation * s;
	twistTorso(p, aim, s, 18 * phase.extension, -12 * Math.abs(aim.y) * phase.extension);
	p.rightKnee = point(
		hip.x + aim.x * (38 + reach * 0.32 * phase.extension) * s + perp.x * fold,
		hip.y + aim.y * (38 + reach * 0.32 * phase.extension) * s + perp.y * fold
	);
	p.rightFoot = point(
		hip.x + aim.x * (58 + reach * phase.extension) * s,
		hip.y + aim.y * (58 + reach * phase.extension) * s
	);
	p.leftFoot = point(p.leftHip.x - aim.x * 36 * s, p.leftHip.y - aim.y * 18 * s + 82 * s);
	p.leftHand.x -= aim.x * 24 * phase.extension * s;
	p.rightHand.x -= aim.x * 18 * phase.extension * s;
	return p;
}
