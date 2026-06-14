/**
 * B"H
 * Hero hit pose.
 *
 * Chapter 178: recoil bends the hero without destroying the silhouette.
 */
import { add, clamp } from '../math.js';

export function applyHeroHit(p, f) {
  const force = Math.max(clamp((f.stun || 0) / 48, 0, 1), clamp((f.damage || 0) / 220, 0, 1) * 0.16);
  if (force <= 0) return p;
  const away = Math.sign(f.vx || -p.face) || -p.face;
  p.chest = add(p.chest, away * force * 7, force * 3);
  p.head = add(p.head, away * force * 9, -force * 3);
  p.leftHand = add(p.leftHand, away * force * 7, force * 4);
  p.rightHand = add(p.rightHand, away * force * 7, force * 4);
  p.leftFoot = add(p.leftFoot, away * force * 3, force * 4);
  p.rightFoot = add(p.rightFoot, away * force * 3, force * 4);
  return p;
}
