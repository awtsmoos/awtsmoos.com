/**
 * B"H
 * Slower readable hit reactions.
 *
 * Chapter 146: recoil is visible but never ugly. The body bends with impact,
 * then the correction gate keeps it from collapsing into the old broken forms.
 */
import { add, clamp } from './math.js';
import { LIMB_BOUNDS } from './limbBounds.js';

export function applyHitReaction(p, f) {
  const stun = clamp((f.stun || 0) / 48, 0, 1) * LIMB_BOUNDS.timing.hit;
  const danger = clamp((f.damage || 0) / 200, 0, 1);
  if (stun <= 0 && danger < 0.55) return p;
  const away = Math.sign(f.vx || -p.face) || -p.face;
  const force = Math.max(stun, danger * 0.22);
  p.chest = add(p.chest, away * force * 7, force * 3);
  p.neck = add(p.neck, away * force * 6, force * 2);
  p.head = add(p.head, away * force * 9, -force * 4);
  p.leftHand = add(p.leftHand, away * force * 8, force * 5);
  p.rightHand = add(p.rightHand, away * force * 8, force * 5);
  p.leftKnee = add(p.leftKnee, away * force * 3, force * 4);
  p.rightKnee = add(p.rightKnee, away * force * 3, force * 4);
  return p;
}
