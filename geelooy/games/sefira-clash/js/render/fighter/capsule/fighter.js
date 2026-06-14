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

export function drawCapsuleFighter(ctx, f, color, language = {}) {
  const p = capsulePoints(f);
  drawGroundRing(ctx, p, color, f.human);
  drawCapsuleLegs(ctx, p, color);
  drawCapsuleArms(ctx, p, color, 'back');
  drawCapsuleBody(ctx, p, color);
  drawCapsuleArms(ctx, p, color, 'front');
  drawCapsuleHead(ctx, p, color, language);
}
