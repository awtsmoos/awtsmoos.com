/**
 * B"H
 * Stable idle keyframe.
 *
 * Chapter 209: the hero stands tall and calm. Arms are bent but not dangling;
 * knees are readable but not crouched.
 */
import { add } from '../math.js';

export function applyIdleKeyframe(p, f) {
  const s = p.scale || 1;
  const b = Math.sin((f.motionClock || 0) * 0.01) * 0.55 * s;
  p.chest = add(p.chest, 0, b);
  p.neck = add(p.neck, 0, b);
  p.head = add(p.head, 0, b);
  p.leftElbow = add(p.leftElbow, 3 * s, -4 * s);
  p.rightElbow = add(p.rightElbow, -3 * s, -4 * s);
  p.leftHand = add(p.leftHand, 5 * s, -6 * s);
  p.rightHand = add(p.rightHand, -5 * s, -6 * s);
  p.leftFoot = add(p.leftFoot, -2 * s, 0);
  p.rightFoot = add(p.rightFoot, 2 * s, 0);
  return p;
}
