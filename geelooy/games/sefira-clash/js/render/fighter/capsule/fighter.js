//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the fighter vessel in this instant, revealing
 * its focused js render fighter capsule service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Full split capsule fighter renderer.
 *
 * Chapter 140: every visible body part now has a chamber: legs, rear arm,
 * torso, front arm, gloves, head, ring. The old skeleton stays hidden beneath.
 */
import { capsulePoints } from './points.js';
import { drawCapsuleBody } from './body.js';
import { drawCapsuleHead } from './head.js';
import { drawCapsuleArms } from './arms.js';
import { drawCapsuleLegs } from './legs.js';
import { drawGroundRing } from './ring.js';

/**
 * Reveals the draw capsule fighter behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} language The language value entering this behavior.
 */
export function drawCapsuleFighter(ctx, f, color, language = {}) {
	const p = capsulePoints(f);
	drawGroundRing(ctx, p, color, f.human);
	drawCapsuleLegs(ctx, p, color);
	drawCapsuleArms(ctx, p, color, 'back');
	drawCapsuleBody(ctx, p, color);
	drawCapsuleArms(ctx, p, color, 'front');
	drawCapsuleHead(ctx, p, color, language);
}
