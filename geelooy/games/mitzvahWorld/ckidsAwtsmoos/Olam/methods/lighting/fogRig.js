// B"H
/** @file fogRig.js @description Chapter 448: Distant mist gives the screenshot depth. */
import * as THREE from '/games/scripts/build/three.module.js';
import { GOLDEN_HOUR } from './goldenHourPalette.js';
export function applyEmeraldFog(scene) {
  scene.background = new THREE.Color(GOLDEN_HOUR.sky);
  scene.fog = new THREE.Fog(GOLDEN_HOUR.fog, 360, 5200);
}
