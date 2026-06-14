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
