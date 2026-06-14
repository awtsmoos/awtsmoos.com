/**
 * B"H
 * Authored run pose.
 *
 * Chapter 162: run becomes a deliberate stride. The Awtsmoos keeps the torso
 * proud while arms and legs swing in a readable, slower fighting-game loop.
 */
import { offsetPose } from './poseMixer.js';

export function runPose(base, f) {
  const face = base.face;
  const speed = Math.min(1, Math.abs(f.vx || 0) / 8);
  const phase = Math.sin((f.motionClock || 0) * 0.062) * speed;
  return offsetPose(base, {
    chest: { x: face * speed * 3, y: -speed * 2 },
    neck: { x: face * speed * 3, y: -speed * 2 },
    head: { x: face * speed * 4, y: -speed * 2 },
    leftElbow: { x: -face * phase * 11, y: Math.abs(phase) * 2 },
    rightElbow: { x: face * phase * 11, y: Math.abs(phase) * 2 },
    leftHand: { x: -face * phase * 18, y: 0 },
    rightHand: { x: face * phase * 18, y: 0 },
    leftKnee: { x: face * phase * 14, y: -Math.max(0, phase) * 6 },
    rightKnee: { x: -face * phase * 14, y: -Math.max(0, -phase) * 6 },
    leftFoot: { x: face * phase * 18, y: -Math.max(0, phase) * 7 },
    rightFoot: { x: -face * phase * 18, y: -Math.max(0, -phase) * 7 }
  });
}
