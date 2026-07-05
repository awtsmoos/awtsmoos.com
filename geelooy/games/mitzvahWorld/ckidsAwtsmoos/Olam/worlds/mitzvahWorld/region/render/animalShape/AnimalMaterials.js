// B"H
/**
 * AnimalMaterials.js
 * The Awtsmoos paints each beast with separate vessels: hide, muzzle, hoof,
 * horn, wing, and eye. No pixel soup; every surface keeps its own dignity.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const materialCache = new Map();

function cached(key, factory) {
  if (!materialCache.has(key)) materialCache.set(key, factory());
  return materialCache.get(key);
}

export function animalLambert(color, key = color) {
  return cached(`lambert:${key}:${color}`, () => new THREE.MeshLambertMaterial({
    color,
    flatShading: true,
    side: THREE.FrontSide
  }));
}

export function animalEyeMaterial() {
  return cached("eye:black", () => new THREE.MeshBasicMaterial({ color: 0x111111 }));
}

export function softShadowMaterial() {
  return cached("shadow:soft", () => new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.16,
    depthWrite: false
  }));
}
