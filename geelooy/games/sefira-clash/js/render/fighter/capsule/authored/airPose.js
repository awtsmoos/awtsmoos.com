/**
 * B"H
 * Authored air pose.
 *
 * Chapter 163: jump and fall are no longer accidental bends. The Awtsmoos lifts
 * knees, steadies boots, and keeps the helmet attached through the sky.
 */
import { offsetPose } from './poseMixer.js';

export function airPose(base, f) {
  const lift = Math.max(-1, Math.min(1, -(f.vy || 0) / 10));
  return offsetPose(base, {
    chest: { x: 0, y: -4 * lift },
    neck: { x: 0, y: -4 * lift },
    head: { x: 0, y: -5 * lift },
    leftElbow: { x: -5, y: -6 * lift },
    rightElbow: { x: 5, y: -6 * lift },
    leftHand: { x: -7, y: -9 * lift },
    rightHand: { x: 7, y: -9 * lift },
    leftKnee: { x: -9, y: -12 * lift },
    rightKnee: { x: 9, y: -12 * lift },
    leftFoot: { x: -12, y: -16 * lift },
    rightFoot: { x: 12, y: -16 * lift }
  });
}
