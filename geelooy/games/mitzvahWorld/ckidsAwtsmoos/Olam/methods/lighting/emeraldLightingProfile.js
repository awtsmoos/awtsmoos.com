// B"H
/** @file emeraldLightingProfile.js @description Chapter 449: Complete Emerald lighting profile. */
import { THREE } from '../../rendering/ThreeAdapter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { applyEmeraldFog } from './fogRig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { GOLDEN_HOUR } from './goldenHourPalette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createEmeraldHemisphere } from './hemisphereRig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { createEmeraldSun } from './sunRig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function markLight(light, name) { light.name = name; light.userData.awtsmoosLighting = true; return light; }
export function applyEmeraldLighting(scene) {
  applyEmeraldFog(scene);
  const ambient = markLight(new THREE.AmbientLight(GOLDEN_HOUR.ambient, 0.52), 'awtsmoos_soft_bounce_ambient');
  const skyGlow = createEmeraldHemisphere(markLight);
  const sun = createEmeraldSun(markLight);
  scene.add(ambient, skyGlow, sun);
  return sun;
}
