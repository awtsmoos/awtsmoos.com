/**
 * B"H
 * Capsule legs.
 *
 * Chapter 136: legs carry the whole story. Knees bend with mercy, calves reach
 * boots, and the stance reads as fighter instead of folded geometry.
 */
import { capsuleSegment, joint } from './segment.js';
import { drawBoot } from './boots.js';

export function drawCapsuleLegs(ctx, p, color) {
  drawLeg(ctx, p.leftHip, p.leftKnee, p.leftFoot, -1, color);
  drawLeg(ctx, p.rightHip, p.rightKnee, p.rightFoot, 1, color);
}

function drawLeg(ctx, hip, knee, foot, side, color) {
  capsuleSegment(ctx, hip, knee, 12, color, { shadow: true });
  capsuleSegment(ctx, knee, foot, 10.5, color);
  joint(ctx, knee, 5.2, color);
  drawBoot(ctx, foot, side, color);
}
