/**
 * B"H
 * Capsule arms.
 *
 * Chapter 135: arms are now staged actors: one may pass behind the chest, one
 * may strike in front, both remain attached to heroic shoulders.
 */
import { capsuleSegment } from './segment.js';
import { drawGlove } from './gloves.js';

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
  capsuleSegment(ctx, shoulder, elbow, 10, color, { shadow: true });
  capsuleSegment(ctx, elbow, hand, 8.5, color);
}
