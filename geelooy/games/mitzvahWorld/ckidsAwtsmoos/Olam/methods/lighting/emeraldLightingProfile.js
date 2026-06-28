// B"H
/** @file emeraldLightingProfile.js @description Chapter 449: Complete Emerald lighting profile. */
import { THREE } from '../../rendering/ThreeAdapter.js';
import { applyEmeraldFog } from './fogRig.js';
import { GOLDEN_HOUR } from './goldenHourPalette.js';
import { createEmeraldHemisphere } from './hemisphereRig.js';
import { createEmeraldSun } from './sunRig.js';
export function markLight(light, name) { light.name = name; light.userData.awtsmoosLighting = true; return light; }
export function applyEmeraldLighting(scene) {
  applyEmeraldFog(scene);
  const ambient = markLight(new THREE.AmbientLight(GOLDEN_HOUR.ambient, 0.52), 'awtsmoos_soft_bounce_ambient');
  const skyGlow = createEmeraldHemisphere(markLight);
  const sun = createEmeraldSun(markLight);
  scene.add(ambient, skyGlow, sun);
  return sun;
}
