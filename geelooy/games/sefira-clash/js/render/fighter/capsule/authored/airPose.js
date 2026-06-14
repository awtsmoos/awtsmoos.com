/**
 * B"H
 * Authored air pose.
 *
 * Chapter 163: jump and fall are no longer accidental bends. The Awtsmoos lifts
 * the fighter, but feet never betray the knees or break the readable body.
 */
import { offsetPose } from './poseMixer.js';

export function airPose(base, f) {
  const lift = Math.max(-1, Math.min(1, -(f.vy || 0) / 10));
  return offsetPose(base, {
    chest: { x: 0, y: -4 * lift },
    neck: { x: 0, y: -4 * lift },
    head: { x: 0, y: -5 * lift },
    leftElbow: { x: -5, y: -5 * lift },
    rightElbow: { x: 5, y: -5 * lift },
    leftHand: { x: -7, y: -7 * lift },
    rightHand: { x: 7, y: -7 * lift },
    leftKnee: { x: -8, y: -8 * lift },
    rightKnee: { x: 8, y: -8 * lift },
    leftFoot: { x: -10, y: -5 * lift },
    rightFoot: { x: 10, y: -5 * lift }
  });
}
