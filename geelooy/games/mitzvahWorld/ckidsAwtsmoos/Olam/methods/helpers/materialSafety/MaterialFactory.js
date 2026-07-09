// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { ARCHITECTURAL_SHADERS } from '../../../../utils/3d/procedural/Shaders/SederHishtalshelusShaders.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

/**
 * Purpose: construct the correct Three.js material class.
 * Owner: SafeMaterialApplier.
 * Inputs: material name plus sanitized options.
 * Outputs: a visible material with awtsmoos type metadata when needed.
 * Runtime authority: creates materials, does not attach them to meshes.
 * Performance: shader lookup is constant-time, no repeated branch scans.
 * Update order: after sanitize, before shader strengthening.
 * Callers: SafeMaterialApplier.apply.
 * Calls: Three.js constructors and architectural shader registry.
 * Invariants: unknown names fall back to MeshStandardMaterial.
 * Failure modes: constructor errors bubble to facade fallback.
 * Future: add keyed material pooling for static immutable surfaces.
 */
export function shaderDataFor(materialName) { return ARCHITECTURAL_SHADERS[materialName] || null; }

export function createMaterial(materialName, options) {
  const shaderData = shaderDataFor(materialName);
  if (shaderData) {
    const color = options.color || (materialName === "AwtsmoosFloorMaterial" ? 0xdddddd : 0x8b4513);
    const material = new THREE.MeshStandardMaterial({ color, roughness:0.7, metalness:0.1 });
    material.userData.awtsmoosType = materialName;
    return material;
  }
  if (THREE[materialName]) return new THREE[materialName](options);
  console.warn(`B"H - Material ${materialName} not in THREE. Using Standard.`);
  return new THREE.MeshStandardMaterial(options);
}

export function emergencyMaterial() {
  return new THREE.MeshBasicMaterial({ color:0x00ffed, wireframe:true, visible:true });
}
