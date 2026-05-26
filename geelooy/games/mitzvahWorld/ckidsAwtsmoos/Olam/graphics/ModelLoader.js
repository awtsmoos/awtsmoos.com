// B"H
/**
 * @file ModelLoader.js
 * @description
 * Renderer boundary for model loading. Today it can delegate to Three's
 * GLTFLoader in browsers; it also accepts .gltc JSON descriptors so Emerald
 * content can move toward custom Awtsmoos model vessels without binding game
 * logic to Three.js forever.
 */

import { loadNeutralGltf } from './procedural/NeutralGltfLoader.js';

let cachedGltfLoader = null;

async function loadBrowserGltfLoader() {
  if (cachedGltfLoader) return cachedGltfLoader;
  if (typeof window === 'undefined') return null;
  const mod = await import('/games/scripts/jsm/loaders/GLTFLoader.js');
  cachedGltfLoader = new mod.GLTFLoader();
  return cachedGltfLoader;
}

function makeNeutralNode({ name = 'AwtsmoosModel', animations = [], userData = {} } = {}) {
  return {
    name,
    animations,
    userData: { ...userData, isNeutralModel: true },
    position: { x: 0, y: 0, z: 0, set(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } },
    rotation: { x: 0, y: 0, z: 0, set(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } },
    scale: { x: 1, y: 1, z: 1, set(x = 1, y = 1, z = 1) { this.x = x; this.y = y; this.z = z; } },
    traverse(visitor) { visitor?.(this); }
  };
}

async function loadGltcDescriptor(path, fetcher = globalThis.fetch) {
  if (typeof fetcher !== 'function') {
    return makeNeutralNode({ name: path || 'gltc-model', userData: { source: path, format: 'gltc', deferred: true } });
  }
  const response = await fetcher(path);
  const descriptor = await response.json();
  return makeNeutralNode({
    name: descriptor.name || path || 'gltc-model',
    animations: descriptor.animations || [],
    userData: { source: path, format: 'gltc', descriptor }
  });
}

export async function loadModel(path, options = {}) {
  if (!path) return makeNeutralNode({ name: 'missing-model', userData: { missingPath: true } });
  if (/\.gltc(?:\.json)?$/i.test(path)) return loadGltcDescriptor(path, options.fetcher);
  if (/\.gltf$/i.test(path)) return loadNeutralGltf(path, options.fetcher);

  const loader = await loadBrowserGltfLoader();
  if (!loader) {
    return makeNeutralNode({ name: path, userData: { source: path, format: 'gltf-or-glb', deferred: true } });
  }

  return new Promise((resolve, reject) => {
    loader.load(path, gltf => {
      const root = gltf.scene;
      root.animations = gltf.animations || [];
      resolve(root);
    }, undefined, reject);
  });
}

export function createFallbackModel(createMesh = null) {
  if (typeof createMesh === 'function') return createMesh();
  return makeNeutralNode({ name: 'FallbackModel', userData: { isFallback: true } });
}
