// B"H
/** @file sunRig.js @description Chapter 446: Warm directional sun at cinematic village angle. */
import * as THREE from '/games/scripts/build/three.module.js';
import { GOLDEN_HOUR } from './goldenHourPalette.js';
import { tuneEmeraldShadow } from './shadowRig.js';
export function createEmeraldSun(markLight) {
  const sun = markLight(new THREE.DirectionalLight(GOLDEN_HOUR.sun, 2.05), 'awtsmoos_warm_village_sun');
  sun.position.set(-420, 720, 260);
  return tuneEmeraldShadow(sun);
}
