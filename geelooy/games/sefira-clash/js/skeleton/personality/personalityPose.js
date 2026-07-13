//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the personality pose vessel in this instant, revealing
 * its focused js skeleton personality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
import { personalityProfile } from './personalityProfile.js';
import { rhythmProfile } from './rhythmProfile.js';
import { aggressionProfile } from './aggressionProfile.js';
import { courageProfile } from './courageProfile.js';
import { confidenceProfile } from './confidenceProfile.js';
/**
 * Reveals the personality pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} m The m value entering this behavior.
 * @param {*} body The body value entering this behavior.
 */
export function personalityPose(p, f, m, body) {
	const base = personalityProfile(f),
		rhythm = rhythmProfile(base),
		aggression = aggressionProfile(base),
		courage = courageProfile(base, f),
		confidence = confidenceProfile(base, f),
		s = body.height;
	p.chest.x += m.facing * aggression.forwardLean * 20 * s;
	p.head.y -= confidence.confidence * 3 * s;
	p.leftHand.y += courage.hesitation * 4 * s;
	p.rightHand.y += courage.hesitation * 4 * s;
	f.visualPersonality = { base, rhythm, aggression, courage, confidence };
	return p;
}
