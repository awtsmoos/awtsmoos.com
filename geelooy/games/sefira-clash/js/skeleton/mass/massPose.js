//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the mass pose vessel in this instant, revealing
 * its focused js skeleton mass service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
import { centerOfMass } from './centerOfMass.js';
import { supportPolygon } from './supportPolygon.js';
import { balanceError } from './balanceError.js';
import { momentumAxis } from './momentumAxis.js';
import { bodyMomentum } from './bodyMomentum.js';
import { bodyLean } from './bodyLean.js';
/**
 * Reveals the mass pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} metrics The metrics value entering this behavior.
 * @param {*} body The body value entering this behavior.
 */
export function massPose(p, f, metrics, body) {
	const com = centerOfMass(p, f, body),
		support = supportPolygon(p, metrics),
		balance = balanceError(com, support, metrics),
		axis = momentumAxis(f, metrics),
		momentum = bodyMomentum(f, metrics),
		lean = bodyLean(balance, momentum, metrics),
		s = body.height;
	p.chest.x += lean.torso * 18 * s;
	p.head.x += lean.head * 14 * s;
	p.hip.x += lean.hips * 12 * s;
	if (balance.falling) {
		p.leftHand.x -= lean.fallDirection * 8 * s;
		p.rightHand.x -= lean.fallDirection * 8 * s;
	}
	f.visualMass = { com, support, balance, axis, momentum, lean };
	return p;
}
