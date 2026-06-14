/**
 * B"H
 * Capsule hit reactions.
 *
 * Chapter 130: damage bends but does not break. The Awtsmoos lets the body show
 * pain with recoil while keeping the head attached and the silhouette readable.
 */
import { add, clamp } from './math.js';

export function applyHitReaction(p, f) {
  const stun = clamp((f.stun || 0) / 40, 0, 1);
  const danger = clamp((f.damage || 0) / 180, 0, 1);
  if (stun <= 0 && danger < 0.55) return p;
  const away = Math.sign(f.vx || -p.face) || -p.face;
  const force = Math.max(stun, danger * 0.35);
  p.chest = add(p.chest, away * force * 10, force * 5);
  p.neck = add(p.neck, away * force * 9, force * 4);
  p.head = add(p.head, away * force * 13, -force * 5);
  p.leftHand = add(p.leftHand, away * force * 12, force * 8);
  p.rightHand = add(p.rightHand, away * force * 12, force * 8);
  p.leftKnee = add(p.leftKnee, away * force * 4, force * 7);
  p.rightKnee = add(p.rightKnee, away * force * 4, force * 7);
  return p;
}
