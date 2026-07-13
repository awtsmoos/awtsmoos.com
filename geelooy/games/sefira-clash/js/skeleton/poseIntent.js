//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pose intent vessel in this instant, revealing
 * its focused js skeleton service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import { clamp } from './poseMath.js';
/**
 * Reveals the pose intent behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} anim The anim value entering this behavior.
 * @param {*} m The m value entering this behavior.
 */
export function poseIntent(f, anim, m = {}) {
	const damage = f.damage || 0,
		last = (f.stocks || 0) <= 1,
		role = f.aiMind?.role?.name || '',
		panic = clamp((damage - 115) / 90 + (last ? 0.25 : 0)),
		hunt = role === 'Hunter' || f.aiMind?.koIntent?.active ? 1 : 0,
		recover =
			!f.grounded && (anim.kind === 'fall' || anim.kind === 'fastFall') && f.y > 0 ? 0.65 : 0,
		charge = clamp(f.chargeGlow || 0),
		face = m.facing || f.face || 1,
		vx = f.vx || 0,
		airTurn = !f.grounded && Math.sign(vx || face) !== Math.sign(face) ? 1 : 0,
		dive = f.fastFalling || f.attack?.id === 'meteorKick' ? 1 : 0,
		confidence = clamp(
			(f.combo?.count || 0) / 5 + charge * 0.5 - panic * 0.35 + (f.human ? 0.08 : 0)
		);
	return {
		mood: chooseMood(anim, { panic, hunt, recover, charge, dive }),
		panic,
		hunt,
		recover,
		charge,
		airTurn,
		dive,
		confidence,
		damageCurl: clamp((damage - 70) / 130),
		lean: clamp(vx * 0.032 + hunt * face * 0.16 - panic * face * 0.08, -0.55, 0.55),
		footWiden: 1 + panic * 0.55 + clamp(damage / 220, 0, 0.4)
	};
}
function chooseMood(anim, v) {
	if (v.dive) return 'dive';
	if (v.charge > 0.1) return 'charge';
	if (anim.kind?.startsWith('attack:')) return 'attack';
	if (v.panic > 0.65) return 'panic';
	if (v.recover > 0.5) return 'recover';
	if (v.hunt) return 'hunt';
	return anim.kind;
}
