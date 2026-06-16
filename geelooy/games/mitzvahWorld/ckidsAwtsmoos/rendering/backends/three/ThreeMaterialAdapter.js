// B"H
/**
 * @file ThreeMaterialAdapter.js
 * @description Renderer covenant for opaque animals: no accidental see-through,
 * stable depth writing, richer rough fur, and explicit alpha only when intended.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { createThreeTexture } from "./ThreeTextureAdapter.js";
function solidDefaults(intent = {}) {
  const transparent = intent.transparent === true;
  const opacity = Number.isFinite(Number(intent.opacity)) ? Number(intent.opacity) : 1;
  return {
    color:intent.color || 0xffffff,
    transparent,
    opacity:transparent ? opacity : 1,
    alphaTest:transparent ? Number(intent.alphaTest || .25) : 0,
    depthWrite:intent.depthWrite !== false,
    depthTest:intent.depthTest !== false,
    side:intent.doubleSided ? THREE.DoubleSide : THREE.FrontSide
  };
}
function polish(mat, intent = {}) {
  mat.name = intent.name || `awtsmoos_${intent.kind || "lambert"}_material`;
  mat.userData.awtsmoosMaterialIntent = intent;
  mat.userData.awtsmoosOpacitySeal = { transparent:mat.transparent, opacity:mat.opacity, depthWrite:mat.depthWrite, alphaTest:mat.alphaTest };
  mat.needsUpdate = true;
  return mat;
}
export function createThreeMaterial(intent = {}) {
  const kind = intent.kind || "lambert", params = solidDefaults(intent);
  if (intent.texture) params.map = createThreeTexture(intent.texture);
  if (kind === "basic") return polish(new THREE.MeshBasicMaterial(params), intent);
  if (kind === "standard") return polish(new THREE.MeshStandardMaterial(Object.assign({ roughness:intent.roughness ?? .86, metalness:intent.metalness ?? 0 }, params)), intent);
  return polish(new THREE.MeshLambertMaterial(params), intent);
}
export default createThreeMaterial;
