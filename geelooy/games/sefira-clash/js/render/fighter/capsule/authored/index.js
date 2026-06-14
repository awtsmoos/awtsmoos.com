/**
 * B"H
 * Authored pose selector.
 *
 * Chapter 166: one gate chooses the fighter's visible story. The Awtsmoos lets
 * idle, run, air, attack, and hit each speak in a clear order.
 */
import { basePose } from './basePose.js';
import { idlePose } from './idlePose.js';
import { runPose } from './runPose.js';
import { airPose } from './airPose.js';
import { attackPose } from './attackPose.js';
import { hitPose } from './hitPose.js';

export function authoredPose(f) {
  let p = basePose(f);
  p = Math.abs(f.vx || 0) > 0.9 && f.grounded ? runPose(p, f) : idlePose(p, f);
  if (!f.grounded) p = airPose(p, f);
  p = attackPose(p, f);
  p = hitPose(p, f);
  return p;
}
