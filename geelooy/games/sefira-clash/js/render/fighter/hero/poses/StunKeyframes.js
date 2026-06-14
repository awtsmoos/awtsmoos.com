/** B"H — Stun keyframe: recoil without destroying the mockup silhouette. */
import { add } from '../math.js';
export function applyStunKeyframe(p, f) {
  const s = p.scale || 1, force = Math.max(Math.min(1, (f.stun || 0) / 48), Math.min(1, (f.damage || 0) / 220) * .16);
  const away = Math.sign(f.vx || -p.face) || -p.face;
  p.chest = add(p.chest, away * force * 7 * s, force * 3 * s); p.neck = add(p.neck, away * force * 7 * s, force * 2 * s); p.head = add(p.head, away * force * 9 * s, -force * 3 * s);
  p.leftHand = add(p.leftHand, away * force * 7 * s, force * 4 * s); p.rightHand = add(p.rightHand, away * force * 7 * s, force * 4 * s);
  p.leftFoot = add(p.leftFoot, away * force * 3 * s, force * 4 * s); p.rightFoot = add(p.rightFoot, away * force * 3 * s, force * 4 * s);
  return p;
}
