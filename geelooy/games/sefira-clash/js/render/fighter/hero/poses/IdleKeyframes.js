/** B"H — Idle keyframe: the hero stands like the mockup, breathing slowly. */
import { add } from '../math.js';
export function applyIdleKeyframe(p, f) {
  const b = Math.sin((f.motionClock || 0) * .012) * .8 * (p.scale || 1);
  p.chest = add(p.chest, 0, b); p.neck = add(p.neck, 0, b); p.head = add(p.head, 0, b);
  p.leftHand = add(p.leftHand, -2 * p.scale, 1 * p.scale); p.rightHand = add(p.rightHand, 2 * p.scale, 1 * p.scale);
  return p;
}
