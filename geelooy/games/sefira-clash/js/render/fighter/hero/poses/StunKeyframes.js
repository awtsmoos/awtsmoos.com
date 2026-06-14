/**
 * B"H
 * Stable stun keyframe.
 *
 * Chapter 213: hit reaction is a small recoil, never a visual explosion of
 * limbs. The fighter stays legible through damage.
 */
import { add } from '../math.js';

export function applyStunKeyframe(p, f) {
  const s = p.scale || 1;
  const force = Math.max(Math.min(1, (f.stun || 0) / 60), Math.min(1, (f.damage || 0) / 240) * 0.1);
  const away = Math.sign(f.vx || -p.face) || -p.face;
  p.chest = add(p.chest, away * force * 4 * s, force * 2 * s);
  p.neck = add(p.neck, away * force * 4 * s, force * 1.5 * s);
  p.head = add(p.head, away * force * 5 * s, -force * 1.5 * s);
  p.leftHand = add(p.leftHand, away * force * 4 * s, force * 2 * s);
  p.rightHand = add(p.rightHand, away * force * 4 * s, force * 2 * s);
  return p;
}
