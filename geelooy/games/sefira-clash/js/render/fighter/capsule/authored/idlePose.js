/**
 * B"H
 * Authored idle pose.
 *
 * Chapter 161: idle is a throne, not a pause. The Awtsmoos steadies the fighter
 * into a strong mockup stance with slow breath and planted boots.
 */
import { offsetPose } from './poseMixer.js';

export function idlePose(base, f) {
  const breath = Math.sin((f.motionClock || 0) * 0.014) * 1.1;
  return offsetPose(base, {
    chest: { x: 0, y: breath },
    neck: { x: 0, y: breath },
    head: { x: 0, y: breath },
    leftHand: { x: -2, y: 2 },
    rightHand: { x: 2, y: 2 },
    leftFoot: { x: -2, y: 0 },
    rightFoot: { x: 2, y: 0 }
  });
}
