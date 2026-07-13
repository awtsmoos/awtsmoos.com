//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the combo layer vessel in this instant, revealing
 * its focused js render v3 character animation layers service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — combo aura nudges the skeleton like hidden fire under armor. */
import { add } from '../../CharacterRig.js';
import { clamp, wave } from '../Math.js';

/**
 * Reveals the combo layer behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} info The info value entering this behavior.
 */
export function comboLayer(p, f, info) {
	const c = clamp(info.combo);
	if (!c) return p;
	const pulse = wave(f, 0.42) * c * 2;
	p.head = add(p.head, p.face * pulse, -c * 3);
	p.chest = add(p.chest, p.face * pulse, -c * 2);
	return p;
}
