//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the meteor spear vessel in this instant, revealing
 * its focused js render v3 character animation kick service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — meteor spear: descent written as judgment in the lower boot. */
import { add } from '../../CharacterRig.js';

/**
 * Reveals the spear down behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} face The face value entering this behavior.
 * @param {*} lead The lead value entering this behavior.
 * @param {*} plant The plant value entering this behavior.
 * @param {*} wind The wind value entering this behavior.
 * @param {*} hit The hit value entering this behavior.
 * @param {*} rec The rec value entering this behavior.
 */
export function spearDown(p, face, lead, plant, wind, hit, rec) {
	p.chest = add(p.chest, face * hit * 4, 10 + hit * 18);
	p.head = add(p.head, face * hit * 4, 10 + hit * 16);
	p[lead + 'Knee'] = add(
		p[lead + 'Hip'],
		-face * wind * 18 + face * hit * 24,
		40 + hit * 34 + rec * 18
	);
	p[lead + 'Foot'] = add(
		p[lead + 'Hip'],
		-face * wind * 26 + face * hit * 38,
		86 + hit * 56 + rec * 22
	);
	p[plant + 'Knee'] = add(p[plant + 'Knee'], -face * (24 + hit * 12), -18 + hit * 18);
	p[plant + 'Foot'] = add(p[plant + 'Foot'], -face * (30 + hit * 8), -12 + hit * 16);
}
