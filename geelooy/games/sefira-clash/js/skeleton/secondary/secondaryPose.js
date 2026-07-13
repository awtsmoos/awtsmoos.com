//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the secondary pose vessel in this instant, revealing
 * its focused js skeleton secondary service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Secondary motion orchestrator.
 *
 * The Awtsmoos renews every delayed echo: spine, head, hands, shoulders, hips,
 * knees, feet, and cloth anchors. This is all visual follow-through.
 */
import { spineWave } from './spineWave.js';
import { headLag } from './headLag.js';
import { handLag } from './handLag.js';
import { shoulderLag } from './shoulderLag.js';
import { hipLag } from './hipLag.js';
import { kneeLag } from './kneeLag.js';
import { footLag } from './footLag.js';
import { clothAnchors } from './clothAnchors.js';

/**
 * Reveals the secondary pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} m The m value entering this behavior.
 * @param {*} style The style value entering this behavior.
 * @param {*} body The body value entering this behavior.
 */
export function secondaryPose(p, f, m, style, body) {
	spineWave(p, f, m, style, body);
	shoulderLag(p, f, m, style, body);
	hipLag(p, f, m, style, body);
	kneeLag(p, f, m, style, body);
	footLag(p, f, m, style, body);
	headLag(p, f, m, style, body);
	handLag(p, f, m, style, body);
	p.clothAnchors = clothAnchors(p);
	return p;
}
