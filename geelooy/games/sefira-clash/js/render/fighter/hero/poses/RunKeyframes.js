/**
 * B"H
 * Stable run keyframe.
 *
 * Chapter 210: run is visible but restrained. No pixel-flailing, no broken
 * knees, only a small athletic stride.
 */
import { add } from '../math.js';

export function applyRunKeyframe(p, f) {
  const s = p.scale || 1;
  const face = p.face;
  const speed = Math.min(1, Math.abs(f.vx || 0) / 8);
  const phase = Math.sin((f.motionClock || 0) * 0.045) * speed;
  p.chest = add(p.chest, face * 2.2 * s, -1.5 * s);
  p.neck = add(p.neck, face * 2.2 * s, -1.5 * s);
  p.head = add(p.head, face * 2.8 * s, -1.5 * s);
  p.leftHand = add(p.leftHand, -face * phase * 9 * s, -3 * s);
  p.rightHand = add(p.rightHand, face * phase * 9 * s, -3 * s);
  p.leftKnee = add(p.leftKnee, face * phase * 8 * s, -Math.max(0, phase) * 4 * s);
  p.rightKnee = add(p.rightKnee, -face * phase * 8 * s, -Math.max(0, -phase) * 4 * s);
  p.leftFoot = add(p.leftFoot, face * phase * 10 * s, -Math.max(0, phase) * 4 * s);
  p.rightFoot = add(p.rightFoot, -face * phase * 10 * s, -Math.max(0, -phase) * 4 * s);
  return p;
}
