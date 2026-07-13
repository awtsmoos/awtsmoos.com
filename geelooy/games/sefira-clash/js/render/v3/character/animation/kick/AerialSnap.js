//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the aerial snap vessel in this instant, revealing
 * its focused js render v3 character animation kick service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — aerial snap kick: the whole body becomes a diagonal blade. */
import { add } from '../../CharacterRig.js';

/**
 * Reveals the snap aerial behavior through one focused module vessel.
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
export function snapAerial(p, face, lead, plant, wind, hit, rec, round) {
	p[lead + 'Knee'] = add(
		p[lead + 'Hip'],
		-face * wind * 30 + face * hit * (round ? 70 : 58),
		20 - hit * 52 + rec * 22
	);
	p[lead + 'Foot'] = add(
		p[lead + 'Hip'],
		-face * wind * 46 + face * hit * (round ? 118 : 100),
		42 - hit * 78 + rec * 30
	);
	p[plant + 'Knee'] = add(p[plant + 'Knee'], -face * (22 + hit * 18), -22 + hit * 12);
	p[plant + 'Foot'] = add(p[plant + 'Foot'], -face * (26 + hit * 16), -18 + hit * 8);
}
