// B"H
/**
 * @file ProceduralAnimalSurface.js
 * @description Deprecated compatibility: animals are skeletal in AnimalBodyForge, but old callers still receive a small parametric torso.
 */
import * as THREE from "/games/scripts/build/three.module.js";
const CACHE = new Map();
function torsoOf(profile) { const body = profile && profile.body ? profile.body : {}; return body.torso || [.6,.4,.9]; }
export function proceduralAnimalGeometry(species = "animal", profile = {}) {
  const key = `${species}:skeletal_compat`; if (CACHE.has(key)) return CACHE.get(key);
  const torso = torsoOf(profile), geometry = new THREE.SphereGeometry(.5, 24, 14);
  geometry.scale(torso[0], torso[1], torso[2]); geometry.name = `skeletal_compat_parametric_${species}_geometry`;
  geometry.userData = { oldScalarAnimalSurface:false, useAnimalBodyForge:true }; geometry.computeVertexNormals(); CACHE.set(key, geometry); return geometry;
}
export default proceduralAnimalGeometry;
