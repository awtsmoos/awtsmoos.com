// B"H
/**
 * @file ThreeBridge.js
 * @description
 * A narrow bridge between game logic and Three.js. Browser code may load the
 * real Three module, while Node tests and future engines can keep geometry
 * contracts alive through neutral fallbacks.
 */
import { AwtsmoosVector3 } from './Vector3.js';

let cachedThree = null;

function canLoadBrowserModules() {
  return typeof window !== 'undefined' ||
    (typeof WorkerGlobalScope !== 'undefined' && globalThis.self instanceof WorkerGlobalScope);
}

export async function loadThree() {
  if (cachedThree) return cachedThree;
  if (!canLoadBrowserModules()) return null;
  cachedThree = await import('/games/scripts/build/three.module.js');
  return cachedThree;
}

export function createVector3(x = 0, y = 0, z = 0, three = null) {
  const VectorCtor = three?.Vector3;
  return VectorCtor ? new VectorCtor(x, y, z) : new AwtsmoosVector3(x, y, z);
}

export function vectorToPlain(vector = {}) {
  return { x: Number(vector.x) || 0, y: Number(vector.y) || 0, z: Number(vector.z) || 0 };
}
