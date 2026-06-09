// B"H
/**
 * @file GuideVisualFactory.js
 * @description Chapter 515: Builds the central guide visual from visualRig. If
 * procedural-core metadata is present, the current renderer now consumes it.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { buildGuideBody } from './GuideVisualBody.js';
import { buildGuideFace } from './GuideVisualFace.js';
import { buildGuideHalo } from './GuideVisualHalo.js';
export function buildGuideVisualFromRig(rig = {}) {
  const g = new THREE.Group(); g.name = `GUIDE_VISUAL_FROM_${rig.kind || 'basic'}`;
  g.userData.visualRigConsumed = Boolean(rig.kind);
  g.add(buildGuideBody(rig), buildGuideFace(rig), buildGuideHalo());
  return g;
}
