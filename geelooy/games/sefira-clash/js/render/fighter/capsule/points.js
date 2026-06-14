/**
 * B"H
 * Authored capsule visual rig pipeline.
 *
 * Chapter 167: the visible fighter is now authored first. Gameplay bones still
 * guide physics, but the eye receives a mockup-like silhouette every frame.
 */
import { authoredPose } from './authored/index.js';
import { correctCapsulePose } from './poseCorrection.js';

export function capsulePoints(f) {
  return correctCapsulePose(authoredPose(f));
}
