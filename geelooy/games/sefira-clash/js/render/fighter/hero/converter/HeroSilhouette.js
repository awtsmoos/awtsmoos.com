//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hero silhouette vessel in this instant, revealing
 * its focused js render fighter hero converter service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Taller stable hero silhouette converter.
 *
 * Chapter 218: a taller body emerges. Feet plant closer, hands rise to glove
 * height, and the neck/head relationship stays tight and readable.
 */
import { point } from '../math.js';
import { MOCKUP } from './MockupMeasurements.js';
import { heroScale } from './HeroScale.js';

/**
 * Reveals the hero silhouette behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function heroSilhouette(f) {
	const s = heroScale(f);
	const face = Math.sign(f.face || 1) || 1;
	const x = f.x;
	const floor = f.y;
	const pelvis = point(x, floor + MOCKUP.pelvis.y * s);
	const chest = point(x + face * 2 * s, floor + MOCKUP.chest.y * s);
	const sw = MOCKUP.shoulderWidth * s;
	const hw = MOCKUP.hipWidth * s;
	return {
		face,
		scale: s,
		pelvis,
		chest,
		neck: point(chest.x + face * 2 * s, chest.y - 13 * s),
		head: point(chest.x + face * 4 * s, floor + MOCKUP.head.y * s),
		leftShoulder: point(chest.x - sw / 2, chest.y + 12 * s),
		rightShoulder: point(chest.x + sw / 2, chest.y + 12 * s),
		leftHip: point(pelvis.x - hw / 2, pelvis.y),
		rightHip: point(pelvis.x + hw / 2, pelvis.y),
		leftElbow: point(chest.x - 50 * s, chest.y + 53 * s),
		rightElbow: point(chest.x + 50 * s, chest.y + 53 * s),
		leftHand: point(chest.x - 44 * s, chest.y + 79 * s),
		rightHand: point(chest.x + 44 * s, chest.y + 79 * s),
		leftKnee: point(pelvis.x - 24 * s, pelvis.y + 57 * s),
		rightKnee: point(pelvis.x + 24 * s, pelvis.y + 57 * s),
		leftFoot: point(pelvis.x - 35 * s, floor + 1 * s),
		rightFoot: point(pelvis.x + 35 * s, floor + 1 * s)
	};
}
