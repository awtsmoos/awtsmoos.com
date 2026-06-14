/**
 * B"H
 * Mockup arms.
 *
 * Chapter 151: arms become strong suit segments, not noodles. Rear arm hides
 * beneath torso, front arm reads with glove weight and shoulder connection.
 */
import { capsuleSegment } from './segment.js';
import { drawGlove } from './gloves.js';
import { LIMB_BOUNDS } from './limbBounds.js';

export function drawCapsuleArms(ctx, p, color, layer) {
  const leftBack = p.face > 0;
  if (layer === 'back') {
    drawArm(ctx, p.leftShoulder, p.leftElbow, p.leftHand, color, leftBack);
    drawArm(ctx, p.rightShoulder, p.rightElbow, p.rightHand, color, !leftBack);
  } else {
    drawArm(ctx, p.leftShoulder, p.leftElbow, p.leftHand, color, !leftBack);
    drawArm(ctx, p.rightShoulder, p.rightElbow, p.rightHand, color, leftBack);
    drawGlove(ctx, p.leftHand, color);
    drawGlove(ctx, p.rightHand, color);
  }
}

function drawArm(ctx, shoulder, elbow, hand, color, shouldDraw) {
  if (!shouldDraw) return;
  capsuleSegment(ctx, shoulder, elbow, LIMB_BOUNDS.arm.widthUpper, color, { shadow: true });
  capsuleSegment(ctx, elbow, hand, LIMB_BOUNDS.arm.widthLower, color);
}
