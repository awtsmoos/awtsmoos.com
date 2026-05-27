// B"H
/**
 * @file ChossidNpcLoader.js
 * @description
 * Chapter 1: The Door That Refused the Storm.
 *
 * For this physics repair pass, no chossid.glb network model is loaded here.
 * The Awtsmoos reveals a plain blue rectangular vessel instead, so motion,
 * grounding, wall collision, and camera feeling can be tested without skeletal
 * model mass, hidden meshes, animation mixers, or remote GLB timing changing
 * the truth of the player's body.
 */

import * as THREE from '/games/scripts/build/three.module.js';

let chossidGltfPromise = null;

/**
 * B"H
 * Builds a temporary rectangular NPC/player stand-in while physics is repaired.
 *
 * @returns {{scene: THREE.Group, animations: Array, cameras: Array}}
 * A GLTF-like envelope accepted by the existing clone/build pipeline.
 */
function makePlainChossidEnvelope() {
  const root = new THREE.Group();
  root.name = "Plain_Chossid_Physics_Block_Root";

  const geometry = new THREE.BoxGeometry(1.1, 2.2, 1.1);
  geometry.translate(0, 1.1, 0);

  const material = new THREE.MeshLambertMaterial({ color: 0x1f6fff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Plain_Chossid_Physics_Block";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.isLiving = true;
  root.add(mesh);

  return { scene: root, animations: [], cameras: [] };
}

/**
 * B"H
 * Returns the temporary plain chossid envelope without touching chossid.glb.
 *
 * @returns {Promise<{scene: THREE.Group, animations: Array, cameras: Array}>}
 * Cached GLTF-like envelope for NPC code that still expects that shape.
 */
export async function loadFreshChossidGltf() {
  if (!chossidGltfPromise) {
    chossidGltfPromise = Promise.resolve(makePlainChossidEnvelope());
  }

  return chossidGltfPromise;
}
