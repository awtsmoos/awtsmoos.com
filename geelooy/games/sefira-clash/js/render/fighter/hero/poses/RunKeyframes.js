/** B"H — Run keyframe: slower athletic stride, not frantic puppet motion. */
import { add } from '../math.js';
export function applyRunKeyframe(p, f) {
  const s = p.scale || 1, face = p.face, phase = Math.sin((f.motionClock || 0) * .052) * Math.min(1, Math.abs(f.vx || 0) / 8);
  p.chest = add(p.chest, face * 3 * s, -2 * s); p.neck = add(p.neck, face * 3 * s, -2 * s); p.head = add(p.head, face * 4 * s, -2 * s);
  p.leftHand = add(p.leftHand, -face * phase * 18 * s, 0); p.rightHand = add(p.rightHand, face * phase * 18 * s, 0);
  p.leftKnee = add(p.leftKnee, face * phase * 14 * s, -Math.max(0, phase) * 6 * s); p.rightKnee = add(p.rightKnee, -face * phase * 14 * s, -Math.max(0, -phase) * 6 * s);
  p.leftFoot = add(p.leftFoot, face * phase * 18 * s, -Math.max(0, phase) * 7 * s); p.rightFoot = add(p.rightFoot, -face * phase * 18 * s, -Math.max(0, -phase) * 7 * s);
  return p;
}
