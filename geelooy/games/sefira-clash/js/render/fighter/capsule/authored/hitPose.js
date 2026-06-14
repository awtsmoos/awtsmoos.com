/**
 * B"H
 * Authored hit pose.
 *
 * Chapter 165: damage recoils, but never ruins the form. The Awtsmoos bends the
 * fighter away from danger while preserving the mockup silhouette.
 */
import { offsetPose } from './poseMixer.js';

export function hitPose(base, f) {
  const stun = Math.min(1, (f.stun || 0) / 44);
  const danger = Math.min(1, (f.damage || 0) / 190);
  const force = Math.max(stun, danger * 0.22);
  if (force <= 0) return base;
  const away = Math.sign(f.vx || -base.face) || -base.face;
  return offsetPose(base, {
    chest: { x: away * force * 8, y: force * 4 },
    neck: { x: away * force * 7, y: force * 2 },
    head: { x: away * force * 10, y: -force * 3 },
    leftHand: { x: away * force * 8, y: force * 5 },
    rightHand: { x: away * force * 8, y: force * 5 },
    leftKnee: { x: away * force * 4, y: force * 5 },
    rightKnee: { x: away * force * 4, y: force * 5 }
  });
}
