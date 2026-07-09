// B"H
/**
 * B"H
 *
 * Animal material palette keeps color identity out of motion code. The field
 * can ask for fox-red, cow-hide, frog-green, or bird-blue without rebuilding
 * materials every frame.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

const CACHE = new Map();

export function animalMaterial(color, kind = "lambert") {
  const key = `${kind}:${color}`;
  if (!CACHE.has(key)) {
    const Ctor = kind === "basic" ? THREE.MeshBasicMaterial : THREE.MeshLambertMaterial;
    CACHE.set(key, new Ctor({ color }));
  }
  return CACHE.get(key);
}

export default animalMaterial;
