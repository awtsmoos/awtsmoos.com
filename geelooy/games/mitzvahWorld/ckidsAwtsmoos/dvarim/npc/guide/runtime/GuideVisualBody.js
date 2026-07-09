// B"H
/**
 * @file GuideVisualBody.js
 * @description Chapter 512: The guide body consumes visualRig clothing metadata
 * and turns it into visible robe, vest, belt, and hands.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { guideMat } from './GuideVisualMaterials.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function color(rig, key, fallback) { return rig?.clothing?.find(c => c.meshName?.includes(key))?.color || fallback; }
export function buildGuideBody(rig = {}) {
  const g = new THREE.Group();
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1.18, 18), guideMat(color(rig, 'robe', '#f4efe0'))); robe.position.y = 0.78;
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.66, 0.08), guideMat(color(rig, 'vest', '#2f5f9f'))); vest.position.set(0, 0.94, 0.38);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.026, 8, 30), guideMat(color(rig, 'belt', '#6d4424'))); belt.position.y = 1.02; belt.rotation.x = Math.PI / 2;
  [-0.44, 0.44].forEach(x => { const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), guideMat('#e9b883')); hand.position.set(x, 1.08, 0.2); g.add(hand); });
  g.add(robe, vest, belt); return g;
}
