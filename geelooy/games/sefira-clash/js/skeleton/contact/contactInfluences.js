//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the contact influences vessel in this instant, revealing
 * its focused js skeleton contact service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
import { influence } from '../compose/poseInfluence.js';
import { PRIORITY } from '../compose/posePriority.js';
/**
 * Reveals the contact influences behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} m The m value entering this behavior.
 * @param {*} body The body value entering this behavior.
 */
export function contactInfluences(f, m, body) {
	const s = body.height,
		k = m.landingImpact || 0;
	if (!m.grounded && !k) return [];
	return [
		influence(
			'leftFoot',
			0,
			f.y + 2 - (f.poseSnapshot?.leftFoot?.y ?? f.y + 2),
			m.grounded ? 1 : 0,
			PRIORITY.contact,
			'left foot ground'
		),
		influence(
			'rightFoot',
			0,
			f.y + 2 - (f.poseSnapshot?.rightFoot?.y ?? f.y + 2),
			m.grounded ? 1 : 0,
			PRIORITY.contact,
			'right foot ground'
		),
		influence('chest', 0, 10 * k * s, 1, PRIORITY.contact, 'impact chest drop'),
		influence('head', 0, 8 * k * s, 1, PRIORITY.contact, 'impact head drop')
	];
}
