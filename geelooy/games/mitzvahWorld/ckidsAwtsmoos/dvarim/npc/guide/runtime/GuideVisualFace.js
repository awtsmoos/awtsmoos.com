// B"H
/**
 * @file GuideVisualFace.js
 * @description Chapter 513: The guide face consumes living-eye/yarmulke/beard
 * metadata and makes it visible in the current renderer.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { guideGlow, guideMat } from './GuideVisualMaterials.js';
function rgb(arr, fallback) { return Array.isArray(arr) ? new THREE.Color(arr[0], arr[1], arr[2]).getHex() : fallback; }
export function buildGuideFace(rig = {}) {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 22, 16), guideMat('#f0c18a')); head.position.y = 1.52;
  const eyeColor = rgb(rig?.face?.eyes?.irisColor, 0x2d6f2d);
  [-0.075, 0.075].forEach(x => { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), guideGlow(eyeColor, 0.95)); eye.position.set(x, 1.56, 0.235); g.add(eye); });
  const beardColor = rgb(rig?.face?.beard?.colorTip, 0x70421f);
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.42, 18), guideMat(beardColor)); beard.position.set(0, 1.25, 0.17); beard.rotation.x = Math.PI;
  const yarmulke = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.29, 0.08, 24), guideMat(rig?.face?.yarmulke?.color || '#0b0b0b')); yarmulke.position.y = 1.72;
  g.add(head, beard, yarmulke); return g;
}
