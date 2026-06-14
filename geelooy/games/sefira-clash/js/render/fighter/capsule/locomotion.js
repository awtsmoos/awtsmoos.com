/**
 * B"H
 * Capsule locomotion offsets.
 *
 * Chapter 128: idle breath, run stride, air lift, landing compression. The
 * Awtsmoos makes movement readable before any attack flames appear.
 */
import { add, clamp } from './math.js';

export function applyLocomotionPose(p, f) {
  const speed = clamp(Math.abs(f.vx || 0) / 9, 0, 1);
  const phase = Math.sin((f.motionClock || 0) * 0.18);
  const grounded = !!f.grounded;
  const breathe = Math.sin((f.motionClock || 0) * 0.045) * 1.6;
  const run = grounded ? speed : 0;
  p.chest = add(p.chest, (f.face || 1) * run * 3, breathe - run * 3);
  p.neck = add(p.neck, (f.face || 1) * run * 3, breathe - run * 3);
  p.head = add(p.head, (f.face || 1) * run * 4, breathe - run * 3);
  if (run > 0.05) applyRunStride(p, phase, run, f.face || 1);
  if (!grounded) applyAirPose(p, f);
  return p;
}

function applyRunStride(p, phase, run, face) {
  const swing = phase * run;
  p.leftElbow = add(p.leftElbow, -face * swing * 8, Math.abs(swing) * 2);
  p.rightElbow = add(p.rightElbow, face * swing * 8, Math.abs(swing) * 2);
  p.leftHand = add(p.leftHand, -face * swing * 13, 0);
  p.rightHand = add(p.rightHand, face * swing * 13, 0);
  p.leftKnee = add(p.leftKnee, face * swing * 10, -Math.max(0, swing) * 4);
  p.rightKnee = add(p.rightKnee, -face * swing * 10, Math.max(0, swing) * 4);
  p.leftFoot = add(p.leftFoot, face * swing * 15, -Math.max(0, swing) * 7);
  p.rightFoot = add(p.rightFoot, -face * swing * 15, -Math.max(0, -swing) * 7);
}

function applyAirPose(p, f) {
  const lift = clamp(-(f.vy || 0) / 12, -1, 1);
  p.leftKnee = add(p.leftKnee, -8, -8 * lift);
  p.rightKnee = add(p.rightKnee, 8, -8 * lift);
  p.leftFoot = add(p.leftFoot, -10, -12 * lift);
  p.rightFoot = add(p.rightFoot, 10, -12 * lift);
  p.leftHand = add(p.leftHand, -3, -8 * lift);
  p.rightHand = add(p.rightHand, 3, -8 * lift);
}
