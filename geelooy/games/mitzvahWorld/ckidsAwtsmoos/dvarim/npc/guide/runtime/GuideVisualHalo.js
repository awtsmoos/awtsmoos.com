// B"H
/** @file GuideVisualHalo.js @description Chapter 514: The guide gains a visible level-select halo. */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { guideGlow } from './GuideVisualMaterials.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function buildGuideHalo() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 10, 36), guideGlow('#00ddff', 0.72)); ring.position.y = 2.16;
  const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), guideGlow('#ffd54a', 0.84)); crown.position.y = 2.58;
  g.add(ring, crown); return g;
}
