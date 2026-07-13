//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ground arc vessel in this instant, revealing
 * its focused js render v3 character animation kick service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — grounded kick arc, a readable sweep engraved in air. */
import { add } from '../../CharacterRig.js';

/**
 * Reveals the ground arc behavior through one focused module vessel.
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
 * @param {*} round The round value entering this behavior.
 */
export function groundArc(p, face, lead, plant, wind, hit, rec, round) {
	p[lead + 'Knee'] = add(
		p[lead + 'Hip'],
		-face * wind * 24 + face * hit * (round ? 48 : 36),
		34 - hit * 38 + rec * 28
	);
	p[lead + 'Foot'] = add(
		p[lead + 'Hip'],
		-face * wind * 38 + face * hit * (round ? 92 : 72),
		62 - hit * 58 + rec * 38
	);
	p[plant + 'Knee'] = add(p[plant + 'Knee'], -face * hit * 10, -hit * 8);
	p[plant + 'Foot'] = add(p[plant + 'Foot'], -face * hit * 14, 0);
}
