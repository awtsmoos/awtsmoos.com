//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the punch vessel in this instant, revealing
 * its focused js render v3 character animation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — punch gateway: jab, rapid, charged, recovery. */
import { attackPhase, clamp } from './Math.js';
import { jabPose } from './punch/JabPose.js';
import { rapidPose } from './punch/RapidPose.js';
import { chargedPose } from './punch/ChargedPose.js';
import { missRecovery } from './punch/MissRecovery.js';
/**
 * Reveals the punch behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} info The info value entering this behavior.
 */
export function punch(p, f, info = {}) {
	const ph = info.phase || attackPhase(f),
		a = ph.a || {},
		face = p.face;
	if (a.rapid || f.rapidAttack) return rapidPose(p, f, ph);
	const side = face > 0 ? 'right' : 'left',
		other = side === 'right' ? 'left' : 'right',
		sign = side === 'right' ? 1 : -1;
	const charge = clamp((a.charge || 0) + (a.fullCharge ? 1 : 0));
	const heavy = charge + (a.id || '').includes('dash') * 0.4 + info.combo * 0.5;
	const wind = ph.name === 'anticipation' ? 1 - ph.t : 0,
		hit = ph.name === 'action' ? ph.t : 0,
		rec = ph.name === 'followThrough' ? ph.t : 0;
	const reach = 60 + heavy * 34;
	p =
		heavy > 0.35 || info.name?.includes('charge')
			? chargedPose(p, face, side, other, sign, wind, hit, rec, reach, heavy)
			: jabPose(p, face, side, other, sign, wind, hit, rec, reach);
	return rec > 0.2 ? missRecovery(p, f, rec) : p;
}
