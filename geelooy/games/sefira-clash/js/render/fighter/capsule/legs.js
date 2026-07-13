//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the legs vessel in this instant, revealing
 * its focused js render fighter capsule service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Mockup legs.
 *
 * Chapter 152: thighs and calves gain fighter weight. The stance widens, boots
 * plant, and the old stick-leg feeling is swallowed by strong capsules.
 */
import { capsuleSegment, joint } from './segment.js';
import { drawBoot } from './boots.js';
import { LIMB_BOUNDS } from './limbBounds.js';

/**
 * Reveals the draw capsule legs behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function drawCapsuleLegs(ctx, p, color) {
	drawLeg(ctx, p.leftHip, p.leftKnee, p.leftFoot, -1, color);
	drawLeg(ctx, p.rightHip, p.rightKnee, p.rightFoot, 1, color);
}

function drawLeg(ctx, hip, knee, foot, side, color) {
	capsuleSegment(ctx, hip, knee, LIMB_BOUNDS.leg.widthUpper, color, { shadow: true });
	capsuleSegment(ctx, knee, foot, LIMB_BOUNDS.leg.widthLower, color);
	joint(ctx, knee, 6.2, color);
	drawBoot(ctx, foot, side, color);
}
